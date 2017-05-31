angular.module('starter.Home', [])

    .controller('Home', function ($scope, $q, $http, $ionicPlatform, $ionicModal, $ionicLoading, $ionicPopup, $state, Shared, Settings, VisitorInformationService) {
        $http.defaults.headers.common['Access-Control-Allow-Origin'] = '*';

        var PLAY_BUTTON_CLASS = "ion-play button-balanced",
            PAUSE_BUTTON_CLASS = "ion-pause button-assertive";

        var currentLocation,
            lastLocation,
            currentLocationMarker, locationAccuracyMarker, polyline,
            markers = [], geofenceMarkers = [];

        // Convenient, private reference to BackgroundGeolocation API
        var bgGeo, map, lat, long, directionsDisplay;

        /**
         * Red stationary-radius marker
         */
        var stationaryRadiusMarker;

        var icons = {
            activity_unknown: "ion-ios-help",
            activity_still: "ion-man",
            activity_on_foot: "ion-android-walk",
            activity_walking: "ion-android-walk",
            activity_running: "ion-android-walk",
            activity_on_bicycle: "ion-android-bicycle",
            activity_in_vehicle: "ion-android-car"
        };

        $scope.search = {"query": ""};
        $scope.people = [];
        $scope.selectedPerson = null;
        $scope.isChangingPace = false;
        $scope.state = {
            enabled: false,
            isMoving: false,
            startButtonIcon: PLAY_BUTTON_CLASS
        };

        // Motion Activity
        $scope.activityIcon = icons.activity_still;
        $scope.activityName = "still";
        $scope.provider = {
            enabled: true,
            network: true,
            gps: true
        };
        // Build "Add Geofence" Modal.
        $ionicModal.fromTemplateUrl('js/app/home/add-geofence.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function (modal) {
            $scope.addGeofenceModal = modal;
        });

        // Build "Show Geofence" Modal.
        $ionicModal.fromTemplateUrl('js/app/home/show-geofence.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function (modal) {
            $scope.showGeofenceModal = modal;
        });


        function configureMap() {
            var def = $q.defer();
            console.log("- configure map settings..");
            // Create map
            map = new google.maps.Map(document.getElementById("map"), {
                center: new google.maps.LatLng(-25.746017, 28.277650),
                zoom: 16,
                zoomControl: false,
                panControl: false,
                streetViewControl: false,
                mapTypeId: google.maps.MapTypeId.ROADMAP
            });

            // Add custom LongPress event to google map so we can add Geofences with longpress event!
            new LongPress(map, 500);

            // "Add Geofence" cursor.
            geofenceCursor = new google.maps.Marker({
                map: map,
                clickable: false,
                icon: {
                    path: google.maps.SymbolPath.CIRCLE,
                    scale: 100,
                    fillColor: '#11b700',   //'2f71ff',
                    fillOpacity: 0.2,
                    strokeColor: '#11b700', // 2f71ff
                    strokeWeight: 2,
                    strokeOpacity: 0.9
                }
            });

            // Tap&hold detected.  Play a sound a draw a circular cursor.
            google.maps.event.addListener(map, 'longpresshold', function (e) {
                geofenceCursor.setPosition(e.latLng);
                geofenceCursor.setMap(map);
                bgGeo.playSound(Settings.getSoundId('LONG_PRESS_ACTIVATE'))
            });

            // Longpress cancelled.  Get rid of the circle cursor.
            google.maps.event.addListener(map, 'longpresscancel', function () {
                geofenceCursor.setMap(null);
                bgGeo.playSound(Settings.getSoundId('LONG_PRESS_CANCEL'));
            });

            // Longpress initiated, add the geofence
            google.maps.event.addListener(map, 'longpress', function (e) {
                onAddGeofence(geofenceCursor.getPosition());
                geofenceCursor.setMap(null);
            });
            removeMarkers();
            def.resolve();
            return def;
        }

        /**
         * Configure BackgroundGeolocation plugin
         */
        function configureBackgroundGeolocation() {
            console.log("- configuring BackgroundGeolocation");
            var def = $q.defer();
            var config = Settings.getConfig();

            // NOTE:  Optionally generate a schedule here.  @see /www/js/persons.js
            //  1: how many schedules?
            //  2: delay (minutes) from now to start generating schedules
            //  3: schedule duration (minutes)
            //  4: time between (minutes) generated schedule ON events
            //
            // UNCOMMENT TO AUTO-GENERATE A SERIES OF SCHEDULE EVENTS BASED UPON CURRENT TIME:
            //config.schedule = Tests.generateSchedule(24, 1, 1, 1);
            //
            config.params = {};
            config.stopOnTerminate = true;
            config.debug = false;
            config.params.device = ionic.Platform.device();

            bgGeo = window.BackgroundGeolocation;

            bgGeo.on('location', onLocation, onLocationError);
            bgGeo.on('motionchange', onMotionChange);
            bgGeo.on('geofence', onGeofence);
            bgGeo.on('http', onHttpSuccess, onHttpError);
            bgGeo.on('heartbeat', onHeartbeat);
            bgGeo.on('schedule', onSchedule);
            bgGeo.on('activitychange', onActivityChange);
            bgGeo.on('providerchange', onProviderChange);

            bgGeo.configure(config, function (state) {
                // Get the current position now, regardles of whether plugin is enabled/disabled.
                bgGeo.getCurrentPosition(function (l) {
                    lat = l.coords.latitude;
                    long = l.coords.longitude;
                    console.log('- get Initial Position');
                }, function (error) {
                    console.error('[js] getCurrentPosition error: ', error);
                }, {
                    timeout: 5000,
                    enableHighAccuracy: true
                });

                // If configured with a Schedule, start it:
                if (state.schedule) {
                    bgGeo.startSchedule(function () {
                        console.log('[js] Start schedule success');
                    }, function (error) {
                        console.warn('- FAILED TO START SCHEDULE: ', error);
                    });
                }

                $scope.$apply(function () {
                    $scope.state.enabled = state.enabled;
                    $scope.state.isMoving = state.isMoving;
                    def.resolve();
                });
            });
            return def.promise;
        }

        function configureBackgroundFetch() {
            var def = $q.defer();
            var config = Settings.getConfig();
            var Fetcher = window.BackgroundFetch;
            // Your background-fetch handler.
            var fetchCallback = function () {
                console.log('[js] BackgroundFetch initiated');
                Fetcher.finish();
            }

            var failureCallback = function () {
                console.log('- BackgroundFetch failed');
            };

            Fetcher.configure(fetchCallback, failureCallback, {
                stopOnTerminate: config.stopOnTerminate
            });
            def.resolve();
            return def.promise;
        }

        /**
         * Remove all data for geofence, markers and directions
         * call before new user is selected
         */
        function resetUI() {
            var def = $q.defer();

            $scope.people = [];
            if (directionsDisplay != null) {
                directionsDisplay.set('directions', null);
            }
            removeMarkers();
            bgGeo.removeGeofences(def.resolve, def.reject);
            return def.promise;
        }

        /**
         * Remove markers for the Google Map
         */
        function removeMarkers() {
            if (geofenceMarkers != null) {
                for (var i = 0; i < geofenceMarkers.length; i++) {
                    geofenceMarkers[i].setMap(null);
                }
                geofenceMarkers = [];
            }
        }

        /**
         * Get a function for alerting
         * of a user side error
         */
        function getErrorAlertFn(message) {

            return function () {
                //Shared.showAlert(message);
                console.log(message);
            }
        }

        /**
         * Select a Person on the UI
         **/
        function onSelectPerson(selectedPerson) {
            function onPromptOk() {
                $scope.selectedPerson = selectedPerson;
                $scope.people = [];
                var values = selectedPerson.y00Location.split(",");
                $scope.geofenceRecord = {
                    latitude: values[0],
                    longitude: values[1],
                    identifier: 'GEO',
                    radius: 75,
                    notifyOnEntry: true,
                    notifyOnExit: false,
                    notifyOnDwell: false,
                    loiteringDelay: undefined
                };
                bgGeo.addGeofences([$scope.geofenceRecord], function () {
                    //bgGeo.playSound(Settings.getSoundId('ADD_GEOFENCE'));
                    console.log("success - Added")
                    createGeofenceMarker($scope.geofenceRecord);
                }, function (error) {
                    console.error(error);
                    Shared.showAlert("Error", "Failed to add geofence: " + error);
                });

                var current = new google.maps.LatLng(lat, long);
                var dest = new google.maps.LatLng(values[0], values[1]);
                var directionsService = new google.maps.DirectionsService();
                directionsDisplay = new google.maps.DirectionsRenderer();

                directionsDisplay.set('directions', null);
                directionsDisplay.setOptions({preserveViewport: true});


                var request = {
                    origin: current,
                    destination: dest,
                    travelMode: google.maps.TravelMode.WALKING
                };
                directionsService.route(request, function (response, status) {
                    if (status == google.maps.DirectionsStatus.OK) {
                        directionsDisplay.setDirections(response);
                    }
                });

                directionsDisplay.setMap(map);
                //map.setZoom(16);
            }

            function onPromptCancel() {
                $scope.people = [];
            }

            Shared.showPrompt("Are you sure?", onPromptOk, onPromptCancel);
        }


        /**
         * BackgroundGeolocation Location callback
         * @param {Object} location
         * @param {Integer} taskId
         */
        function onLocation(location, taskId) {
            console.log('[js] location: ', location);
            centerOnMe(location);
            bgGeo.finish(taskId);
        }

        /**
         * Background Geolocation error callback
         * @param {Integer} code
         */
        function onLocationError(error) {
            console.error('[js] Location error: ', error);
        }

        /**
         * Background Geolocation HTTP callback
         */
        function onHttpSuccess(response) {
            console.info('[js] HTTP success', response);
        }

        /**
         * BackgroundGeolocation HTTP error
         */
        function onHttpError(error) {
            console.info('[js] HTTP ERROR: ', error);
        }

        /**
         * Background Geolocation motionchange callback
         */
        function onMotionChange(isMoving, location, taskId) {
            console.log('[js] onMotionChange: ', isMoving, location);
            $scope.state.isMoving = isMoving;

            // Change state of start-button icon:  [>] or [||]
            $scope.$apply(function () {
                $scope.isChangingPace = false;
                $scope.state.startButtonIcon = (isMoving) ? PAUSE_BUTTON_CLASS : PLAY_BUTTON_CLASS;
            });

            if (map) {
                map.setCenter(new google.maps.LatLng(location.coords.latitude, location.coords.longitude));
                if (stationaryRadiusMarker) {
                    setCurrentLocationMarker(location);
                    stationaryRadiusMarker.setMap(null);
                }
            }
            bgGeo.finish(taskId);
        }

        /**
         * BackgroundGeolocation heartbeat event handler
         */
        function onHeartbeat(params) {
            var shakes = params.shakes;
            var location = params.location;
            console.log('- heartbeat: ', params);

            // Location returned from heartbeat event is only the "Last Known Location".  We can manually insert those
            // into the plugin's database if we wish.
            bgGeo.insertLocation(params.location, function (uuid) {
                console.log('- insert location success: ', uuid);
            }, function (error) {
                console.log('- insert FAILURE: ', error);
            });

            /**
             * OPTIONAL.  retrieve current position during heartbeat callback
             *
             bgGeo.getCurrentPosition(function(location, taskId) {
      		console.log("- location: ", location);
      		bgGeo.finish(taskId);      
    	     });
             *
             *
             */
        }

        function onActivityChange(activityName) {
            console.info('[js] Motion activity changed: ', activityName);
            var icon = icons['activity_' + activityName];
            if (!icon) {
                console.warn("Failed to find activity icon for: " + activityName);
                return;
            }
            console.log('- icon: ', icon);

            $scope.$apply(function () {
                $scope.activityName = activityName;
                $scope.activityIcon = icon;
            });
        }

        function onProviderChange(provider) {
            console.info('[js] Location provider change: ', JSON.stringify(provider));
            $scope.$apply(function () {
                $scope.provider.enabled = provider.enabled;
                $scope.provider.network = provider.network;
                $scope.provider.gps = provider.gps;

            });
        }
    1

        function onAddGeofence(latLng) {
            $scope.geofenceRecord = {
                latitude: latLng.lat(),
                longitude: latLng.lng(),
                identifier: '',
                radius: 200,
                notifyOnEntry: true,
                notifyOnExit: false,
                notifyOnDwell: false,
                loiteringDelay: undefined
            };
            $scope.addGeofenceModal.show();
        }

        /**
         * BackgroundGeolocation geofence callback
         */
        function onGeofence(params, taskId) {
            //console.log('- onGeofence: ', JSON.stringify(params, null, 2));
            var errorFnReset = getErrorAlertFn(Shared.messages.ERROR_RESET);
            var errorFnPush = getErrorAlertFn(Shared.messages.ERROR_PUSH_NOTIFICATION);
            var errorFnMarker = getErrorAlertFn(Shared.messages.ERROR_MARKER);
            var errorFnGeofence = getErrorAlertFn(Shared.messages.ERROR_GEOFENCE);
            var myDataPromise = VisitorInformationService.GetPushInfo($scope.selectedPerson.y00LanId);
            myDataPromise.then(onPushInfo, errorFnPush);

            Shared.showAlert('Destination', 'You have arrived at your destination. A notification will be sent to the person you are visiting!');


            function onResetUI() {
                var marker = angular.extend({}, getGeofenceMarker(params.identifier));
                if (!marker) {
                    errorFnMarker();
                    return;
                }
                var geofence = marker.params;
                if (!geofence) {
                    errorFnGeofence();
                    return;
                }
                // Destroy the geofence?

                if (!geofence.notifyOnDwell || (geofence.notifyOnDwell && params.action === "DWELL")) {
                    if (marker) {
                        // Change the color of geofence marker to GREY so we know it has fired.
                        marker.removed = true;
                        marker.setOptions({
                            fillColor: '#000000',
                            fillOpacity: 0.3,
                            strokeColor: '#000000',
                            strokeOpacity: 0.5
                        });
                    }
                }

                //console.log("got before data:");
                //console.log($scope.selectedPerson.y00LanId);
            }

            function onPushInfo(result) {
                // this is only run after getData() resolves
                //$scope.pushId = result.data[0].pushId;
                console.log(result.data[0].pushId);

                window.plugins.OneSignal.getIds(function (ids) {
                    var notificationObj = {
                        data: {type: ids.userId},
                        contents: {en: window.localStorage.getItem("visname") + " has arrived!!!"},
                        include_player_ids: [result.data[0].pushId]
                    };
                    //console.log($scope.selectedPerson.pushId);

                    window.plugins.OneSignal.postNotification(notificationObj,
                        function (successResponse) {
                            console.log("Notification Post Success:", successResponse);
                        },
                        function (failedResponse) {
                            console.log("Notification Post Failed: ", failedResponse);
                            errorFnPush("Sending PUSH notification failed");
                        }
                    );
                }, errorFnPush);
            }

            resetUI().then(onResetUI, errorFnReset);
        }

        /**
         * Platform is ready.  Boot the Home screen
         */
        function onPlatformReady() {
            // Configure BackgroundGeolocation
            if (!window.BackgroundGeolocation) {
                console.warn('Could not detect BackgroundGeolocation API');
                return;
            }


            console.log("Calling onPlatformReady");
            var configurePromises = [
                configureMap(),
                configureBackgroundGeolocation()];

            function onConfigure() {
                console.log('1st remove: after ready');
                var errorFn = getErrorAlertFn(Shared.messages.ERROR_RESET);

                resetUI().then(onResetUI, errorFn);
            }

            function onResetUI() {
                if (window.BackgroundFetch) {
                    configureBackgroundFetch();
                }
            }

            var errorFn = getErrorAlertFn(Shared.messages.ERROR_CONFIGURATION);
            $q.all(configurePromises).then(onConfigure, errorFn);
        }

        /**
         * Create google.maps.Circle geofence marker.
         * @param {Object}
         */
        function createGeofenceMarker(params) {
            // Add longpress event for adding GeoFence of hard-coded radius 200m.
            var geofence = new google.maps.Circle({
                zIndex: 100,
                fillColor: '#11b700',
                fillOpacity: 0.2,
                strokeColor: '#11b700',
                strokeWeight: 2,
                strokeOpacity: 0.9,
                params: params,
                radius: parseInt(params.radius, 10),
                center: new google.maps.LatLng(params.latitude, params.longitude),
                map: map
            });
            // Add 'click' listener to geofence so we can edit it.
            google.maps.event.addListener(geofence, 'click', function () {
                $scope.onShowGeofence(this.params);
            });
            geofenceMarkers.push(geofence);
            return geofence;
        }

        /**
         * Fetch a google.maps.Circle marker
         */
        function getGeofenceMarker(identifier) {
            var filtered = geofenceMarkers.filter(function (geofence) {
                return geofence.params.identifier === identifier;
            });
            if (filtered.length > 0) {
                return filtered[0];
            }
        }

        /**
         * Remove a geofence
         */
        function removeGeofence(identifier) {
            var marker = getGeofenceMarker(identifier);
            if (marker) {
                var index = geofenceMarkers.indexOf(marker);
                geofenceMarkers.splice(index, 1);
                marker.setMap(null);
                if (marker.removed) {
                    return;
                }
            }
            bgGeo.removeGeofence(identifier);
        }

        /**
         * Create current position Marker
         */
        function setCurrentLocationMarker(location) {
            // Set currentLocation @property
            currentLocation = location;
            var coords = location.coords;

            if (!currentLocationMarker) {
                currentLocationMarker = new google.maps.Marker({
                    map: map,
                    zIndex: 10,
                    title: 'Current Location',
                    icon: {
                        path: google.maps.SymbolPath.CIRCLE,
                        scale: 12,
                        fillColor: '#2677FF',
                        fillOpacity: 1,
                        strokeColor: '#ffffff',
                        strokeOpacity: 1,
                        strokeWeight: 6
                    }
                });
                locationAccuracyMarker = new google.maps.Circle({
                    zIndex: 9,
                    fillColor: '#3366cc',
                    fillOpacity: 0.4,
                    strokeOpacity: 0,
                    map: map
                });
            }

            if (!polyline) {
                polyline = new google.maps.Polyline({
                    zIndex: 1,
                    map: map,
                    geodesic: true,
                    strokeColor: '#2677FF',
                    strokeOpacity: 0.7,
                    strokeWeight: 5
                });
            }
            var latlng = new google.maps.LatLng(coords.latitude, coords.longitude);

            if (lastLocation) {
                var last = lastLocation;
                // Drop a breadcrumb of where we've been.
                var icon, scale;
                if (markers.length % 2) {
                    icon = google.maps.SymbolPath.FORWARD_CLOSED_ARROW;
                    scale = 4;
                } else {
                    icon = google.maps.SymbolPath.CIRCLE;
                    scale = 6;
                }

                markers.push(new google.maps.Marker({
                    zIndex: 1,
                    icon: {
                        path: icon,
                        rotation: last.coords.heading,
                        scale: scale,
                        fillColor: '#11b700',//'26cc77',
                        fillOpacity: 1,
                        strokeColor: '#0d6104',
                        strokeWeight: 1,
                        strokeOpacity: 0.7
                    },
                    map: map,
                    position: new google.maps.LatLng(lastLocation.coords.latitude, lastLocation.coords.longitude)
                }));
            }

            // Update our current position marker and accuracy bubble.
            currentLocationMarker.setPosition(latlng);
            locationAccuracyMarker.setCenter(latlng);
            locationAccuracyMarker.setRadius(location.coords.accuracy);

            if (location.sample === true) {
                return;
            }

            // Add breadcrumb to current Polyline path.
            polyline.getPath().push(latlng);
            lastLocation = location;

            $scope.$apply(function () {
                $scope.odometer = (location.odometer / 1000).toFixed(1);
            });
        }

        function setStationaryMarker(location) {
            setCurrentLocationMarker(location);

            var coords = location.coords;

            if (!stationaryRadiusMarker) {
                stationaryRadiusMarker = new google.maps.Circle({
                    zIndex: 0,
                    fillColor: '#ff0000',
                    strokeColor: '#aa0000',
                    strokeWeight: 2,
                    fillOpacity: 0.5,
                    strokeOpacity: 0.5,
                    map: map
                });
            }
            var radius = 50;
            var center = new google.maps.LatLng(coords.latitude, coords.longitude);
            stationaryRadiusMarker.setRadius(radius);
            stationaryRadiusMarker.setCenter(center);
            stationaryRadiusMarker.setMap(map);
            map.setCenter(center);
        }

        /**
         * Center users's current position on Map
         */
        function centerOnMe(location) {
            map.setCenter(new google.maps.LatLng(location.coords.latitude, location.coords.longitude));
            setCurrentLocationMarker(location);
        }


        /**
         * When a person
         * is clicked
         */
        $scope.clickedPerson = function (person) {
            var errorFn = getErrorAlertFn(Shared.messages.ERROR_RESET);

            function onResetUI() {
                onSelectPerson(person);
            }

            resetUI().then(onResetUI, errorFn);
        };


        /**
         * Create geofence click-handler
         */
        $scope.onCreateGeofence = function () {
            $scope.addGeofenceModal.hide();
            bgGeo.addGeofences([$scope.geofenceRecord], function () {
                bgGeo.playSound(Settings.getSoundId('ADD_GEOFENCE'));
                createGeofenceMarker($scope.geofenceRecord);
            }, function (error) {
                console.error(error);
                Shared.showAlert("Error", "Failed to add geofence: " + error);
            });
        };
        /**
         * Cancel geofence modal
         */
        $scope.onCancelGeofence = function () {
            bgGeo.playSound(Settings.getSoundId('LONG_PRESS_ACTIVATE'));
            $scope.modal.hide();
        };
        /**
         * show geofence modal
         * @param {Google.maps.Circle} circle
         */
        $scope.onShowGeofence = function (params) {
            bgGeo.playSound(Settings.getSoundId("LONG_PRESS_ACTIVATE"));
            $scope.geofenceRecord = params;
            $scope.showGeofenceModal.show();
        };
        /**
         * Remove geofence click-handler
         */
        $scope.onRemoveGeofence = function () {
            var identifier = $scope.geofenceRecord.identifier;
            removeGeofence(identifier);
            $scope.showGeofenceModal.hide();
        };

        /**
         * Stop / Start BackgroundGeolocation tracking button handler.
         */
        $scope.onToggleEnabled = function () {
            if (!bgGeo) {
                return;
            }
            if ($scope.state.enabled) {

                bgGeo.start(function (state) {
                    console.log('[js] BackgroundGeolocation started', state);

                    // If BackgroundGeolocation is monitoring geofences, fetch them and add map-markers
                    bgGeo.getGeofences(function (rs) {
                        for (var n = 0, len = rs.length; n < len; n++) {
                            createGeofenceMarker(rs[n]);
                        }
                    });
                }, function (error) {
                    console.warn(error);
                });
            } else {
                removeGeofence($scope.geofenceRecord.identifier);

                bgGeo.stop(function () {
                    console.info('[js] BackgroundGeolocation stopped');
                });

                // Reset the odometer.
                bgGeo.resetOdometer(function () {
                    $scope.$apply(function () {
                        $scope.odometer = 0;
                    });
                });

                // Clear map markers
                bgGeo.playSound(Settings.getSoundId('BUTTON_CLICK'));
                $scope.state.isMoving = false;
                $scope.state.startButtonIcon = PLAY_BUTTON_CLASS;

                // Clear previousLocation
                lastLocation = undefined;

                // Clear location-markers.
                var marker;
                for (var n = 0, len = markers.length; n < len; n++) {
                    marker = markers[n];
                    marker.setMap(null);
                }
                markers = [];

                // Clear geofence markers.
                for (var n = 0, len = geofenceMarkers.length; n < len; n++) {
                    marker = geofenceMarkers[n];
                    marker.setMap(null);
                }
                geofenceMarkers = [];

                // Clear red stationaryRadius marker
                if (stationaryRadiusMarker) {
                    stationaryRadiusMarker.setMap(null);
                    stationaryRadiusMarker = null;
                }

                // Clear blue route PolyLine
                if (polyline) {
                    polyline.setMap(null);
                    polyline = undefined;
                }
            }
        }

        /**
         * getCurrentPosition button handler
         */
        $scope.getCurrentPosition = function () {
            if (!bgGeo) {
                return;
            }
            bgGeo.getCurrentPosition(function (location, taskId) {
                console.info('[js] getCurrentPosition: ', JSON.stringify(location));
                centerOnMe(location);
                bgGeo.finish(taskId);
            }, function (error) {
                console.error('[js] getCurrentPosition error: ', error);
            }, {
                timeout: 5000,
                samples: 3,
                enableHighAccuracy: true,
                desiredAccuracy: 10,
                maximumAge: 5000,
                persist: true,
                extras: {
                    'extra-param': 'getCurrentPosition'
                }
            })
        }

        $scope.onClickChangePace = function () {
            var willStart = !$scope.state.isMoving;
            console.log('onClickStart: ', willStart);
            $scope.isChangingPace = true;

            bgGeo.changePace(willStart, function (location) {
                console.log("[js] changePace success: ", location);
                $scope.$apply(function () {
                    $scope.isChangingPace = false;
                    $scope.state.isMoving = willStart;
                    $scope.state.startButtonIcon = (willStart) ? PAUSE_BUTTON_CLASS : PLAY_BUTTON_CLASS;
                });
            }, function (error) {
                console.error("[js] changePace failed with error: " + error);
                $scope.$apply(function () {
                    $scope.isChangingPace = false;
                });
            });
        };
        /**
         * Show Settings screen button handler
         */
        $scope.onClickSettings = function () {
            if (bgGeo) {
                bgGeo.playSound(Settings.getSoundId('BUTTON_CLICK'));
            }
            //$state.transitionTo('settings');
            //directions.navigateTo($scope.selectedPerson.y00Location);
            launchnavigator.isAppAvailable(launchnavigator.APP.GOOGLE_MAPS, function (isAvailable) {
                var app;
                if (isAvailable) {
                    app = launchnavigator.APP.GOOGLE_MAPS;
                } else {
                    console.warn("Google Maps not available - falling back to user selection");
                    app = launchnavigator.APP.USER_SELECT;
                }
                launchnavigator.navigate($scope.selectedPerson.y00Location, {
                    app: app,
                    transportMode: launchnavigator.TRANSPORT_MODE.WALKING
                });
            });

        };

        $scope.saveLanId = function (lanid) {
            window.localStorage.setItem("lanid", lanid);
        };

        $scope.getPersonInfo = function () {
            var query = $scope.search.query;
            if (query !== "" && query.length > 2) {
                VisitorInformationService.GetPersonInfo(query).then(function (personInfo) {
                    $scope.people = personInfo.data;
                }, function () {
                    $scope.people = [];
                });
            }
        };

        ionic.Platform.ready(onPlatformReady);
    });
