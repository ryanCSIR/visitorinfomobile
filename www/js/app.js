
function NoOp() {
}
var app = angular.module('starter', ['ionic', 'starter.Home', 'starter.Settings', 'services.Settings', 'services.Shared', 'services.VisitorInformationService']);

app.config(function ($stateProvider, $urlRouterProvider) {

    $urlRouterProvider.otherwise('/')

    $stateProvider
        .state('home', {
            url: '/',
            templateUrl: 'js/app/home/home.html',
            controller: 'Home'
        })
        .state('getSettings', {
            url: '/getSettings',
            controller: 'Settings'
        })
        .state('settings', {
            url: '/settings',
            templateUrl: 'js/app/settings/settings.html',
            controller: 'Settings',
            cache: false
        })
        .state('settings/distanceFilter', {
            url: '/settings/distanceFilter',
            templateUrl: 'js/app/settings/radio-list.html',
            controller: 'Settings'
        })
        .state('settings/stationaryRadius', {
            url: '/settings/stationaryRadius',
            templateUrl: 'js/app/settings/radio-list.html',
            controller: 'Settings'
        })
        .state('settings/desiredAccuracy', {
            url: '/settings/desiredAccuracy',
            templateUrl: 'js/app/settings/radio-list.html',
            controller: 'Settings'
        })
        .state('settings/locationTimeout', {
            url: '/settings/locationTimeout',
            templateUrl: 'js/app/settings/radio-list.html',
            controller: 'Settings'
        })
        .state('settings/activityType', {
            url: '/settings/activityType',
            templateUrl: 'js/app/settings/radio-list.html',
            controller: 'Settings'
        })
        .state('settings/triggerActivities', {
            url: '/settings/triggerActivities',
            templateUrl: 'js/app/settings/trigger-activities.html',
            controller: 'Settings'
        })
        .state('settings/disableElasticity', {
            url: '/settings/disableElasticity',
            templateUrl: 'js/app/settings/radio-list.html',
            controller: 'Settings'
        })
        .state('settings/url', {
            url: '/settings/url',
            templateUrl: 'js/app/settings/url.html',
            controller: 'Settings'
        })
        .state('settings/method', {
            url: '/settings/method',
            templateUrl: 'js/app/settings/radio-list.html',
            controller: 'Settings'
        })
        .state('settings/autoSync', {
            url: '/settings/autoSync',
            templateUrl: 'js/app/settings/radio-list.html',
            controller: 'Settings'
        })
        .state('settings/autoSyncThreshold', {
            url: '/settings/autoSyncThreshold',
            templateUrl: 'js/app/settings/radio-list.html',
            controller: 'Settings'
        })
        .state('settings/batchSync', {
            url: '/settings/batchSync',
            templateUrl: 'js/app/settings/radio-list.html',
            controller: 'Settings'
        })
        .state('settings/locationUpdateInterval', {
            url: '/settings/locationUpdateInterval',
            templateUrl: 'js/app/settings/radio-list.html',
            controller: 'Settings'
        })
        .state('settings/fastestLocationUpdateInterval', {
            url: '/settings/fastestLocationUpdateInterval',
            templateUrl: 'js/app/settings/radio-list.html',
            controller: 'Settings'
        })
        .state('settings/activityRecognitionInterval', {
            url: '/settings/activityRecognitionInterval',
            templateUrl: 'js/app/settings/radio-list.html',
            controller: 'Settings'
        })
        .state('settings/stopDetectionDelay', {
            url: '/settings/stopDetectionDelay',
            templateUrl: 'js/app/settings/radio-list.html',
            controller: 'Settings'
        })
        .state('settings/stopTimeout', {
            url: '/settings/stopTimeout',
            templateUrl: 'js/app/settings/radio-list.html',
            controller: 'Settings'
        })
        .state('settings/stopOnTerminate', {
            url: '/settings/stopOnTerminate',
            templateUrl: 'js/app/settings/radio-list.html',
            controller: 'Settings'
        })
        .state('settings/forceReloadOnLocationChange', {
            url: '/settings/forceReloadOnLocationChange',
            templateUrl: 'js/app/settings/radio-list.html',
            controller: 'Settings'
        })
        .state('settings/forceReloadOnMotionChange', {
            url: '/settings/forceReloadOnMotionChange',
            templateUrl: 'js/app/settings/radio-list.html',
            controller: 'Settings'
        })
        .state('settings/forceReloadOnGeofence', {
            url: '/settings/forceReloadOnGeofence',
            templateUrl: 'js/app/settings/radio-list.html',
            controller: 'Settings'
        })
        .state('settings/forceReloadOnHeartbeat', {
            url: '/settings/forceReloadOnHeartbeat',
            templateUrl: 'js/app/settings/radio-list.html',
            controller: 'Settings'
        })
        .state('settings/forceReloadOnBoot', {
            url: '/settings/forceReloadOnBoot',
            templateUrl: 'js/app/settings/radio-list.html',
            controller: 'Settings'
        })
        .state('settings/startOnBoot', {
            url: '/settings/startOnBoot',
            templateUrl: 'js/app/settings/radio-list.html',
            controller: 'Settings'
        })
        .state('settings/debug', {
            url: '/settings/debug',
            templateUrl: 'js/app/settings/radio-list.html',
            controller: 'Settings'
        })
        .state('settings/preventSuspend', {
            url: '/settings/preventSuspend',
            templateUrl: 'js/app/settings/radio-list.html',
            controller: 'Settings'
        })
        .state('settings/heartbeatInterval', {
            url: '/settings/heartbeatInterval',
            templateUrl: 'js/app/settings/radio-list.html',
            controller: 'Settings'
        })
        .state('settings/foregroundService', {
            url: '/settings/foregroundService',
            templateUrl: 'js/app/settings/radio-list.html',
            controller: 'Settings'
        })
        .state('settings/deferTime', {
            url: '/settings/deferTime',
            templateUrl: 'js/app/settings/radio-list.html',
            controller: 'Settings'
        })
        .state('settings/pausesLocationUpdatesAutomatically', {
            url: '/settings/pausesLocationUpdatesAutomatically',
            templateUrl: 'js/app/settings/radio-list.html',
            controller: 'Settings'
        })
        .state('settings/useSignificantChangesOnly', {
            url: '/settings/useSignificantChangesOnly',
            templateUrl: 'js/app/settings/radio-list.html',
            controller: 'Settings'
        })
        .state('settings/disableMotionActivityUpdates', {
            url: '/settings/disableMotionActivityUpdates',
            templateUrl: 'js/app/settings/radio-list.html',
            controller: 'Settings'
        })
});
app.filter('capitalize', function () {
    return function (input, scope) {
        if (input != null) {
            var stringArr = input.split(" ");
            var result = "";
            var cap = stringArr.length;
            for (var x = 0; x < cap; x++) {
                stringArr[x].toLowerCase();
                if (x === cap - 1) {
                    result += stringArr[x].substring(0, 1).toUpperCase() + stringArr[x].substring(1);
                } else {
                    result += stringArr[x].substring(0, 1).toUpperCase() + stringArr[x].substring(1) + " ";
                }
            }
            return result;
        }
    }
});
app.run(function ($ionicPlatform, $ionicPopup, $window, $document, $filter, $rootScope, VisitorInformationService) {
    $ionicPlatform.onHardwareBackButton(function () {
        var bgGeo, map, lat, long;
        bgGeo = window.BackgroundGeolocation;

        if(true) { // your check here
            $ionicPopup.confirm({
                title: 'System warning',
                template: 'Are you sure you want to exit?'
            }).then(function(res){
                if( res ){
                    console.log('1st remove: on back button');
                    removeAll();
                    console.log('1st remove: after back button');

                    navigator.app.exitApp();
                }
            })
        }

        function removeAll() {

            if (bgGeo) {

                bgGeo.getGeofences(function (geofences) {
                    for (var n = 0, len = geofences.length; n < len; n++) {
                        var marker = getGeofenceMarker(geofence.identifier);
                        if (marker) {
                            var index = geofenceMarkers.indexOf(marker);
                            geofenceMarkers.splice(index, 1);
                            marker.setMap(null);
                            if (marker.removed) {
                                return;
                            }
                        }

                        removeGeofence(geofence.identifier);
                    }
                }, function (error) {
                    console.warn("Failed to fetch geofences from server");
                });
            }
        }
    });

    $ionicPlatform.ready(function () {
        var bgGeo, map, lat, long;
        bgGeo = window.BackgroundGeolocation;
        function removeAll() {

            if (bgGeo) {

                bgGeo.getGeofences(function (geofences) {
                    for (var n = 0, len = geofences.length; n < len; n++) {
                        var marker = getGeofenceMarker(geofence.identifier);
                        if (marker) {
                            var index = geofenceMarkers.indexOf(marker);
                            geofenceMarkers.splice(index, 1);
                            marker.setMap(null);
                            if (marker.removed) {
                                return;
                            }
                        }

                        removeGeofence(geofence.identifier);
                    }
                }, function (error) {
                    console.warn("Failed to fetch geofences from server");
                });
            }
        }
        console.log('1st remove: load');

        removeAll();

        console.log('1st remove: after load');

        if (window.StatusBar) {
            StatusBar.styleDefault();
        }

        var employee = false;
        var iosSettings = {};

        iosSettings["kOSSettingsKeyAutoPrompt"] = true;
        iosSettings["kOSSettingsKeyInAppLaunchURL"] = false;

        document.addEventListener("resume", function() {
            console.log("The application is resuming from the background");
        }, false);

        var notificationOpenedCallback = function (jsonData) {
            //alert("Notification received:\n" + JSON.stringify(jsonData));
            console.log('didReceiveRemoteNotificationCallBack: ' + JSON.stringify(jsonData));
            if(jsonData.notification.payload.additionalData != null)
                console.log(jsonData.notification.payload.additionalData.type);
            var notificationObj = {
                contents: {en: "I am on my way to come and fetch you!!!"},
                include_player_ids: [jsonData.notification.payload.additionalData.type]
            };
            window.plugins.OneSignal.postNotification(notificationObj,
                function (successResponse) {
                    console.log("Notification Post Success:", successResponse);
                },
                function (failedResponse) {
                    console.log("Notification Post Failed: ", failedResponse);
                }
            );

        };

        var isTablet = !!navigator.userAgent.match(/iPad/i);

        if (ionic.Platform.isIOS()) {
            window.plugins.OneSignal
                .startInit("e60fcbbf-b0f2-4f74-9df6-cf85c5710166", "")
                .iOSSettings(iosSettings)
                .handleNotificationOpened(notificationOpenedCallback)
                .inFocusDisplaying(window.plugins.OneSignal.OSInFocusDisplayOption.Notification)
                .endInit();
        }
        else {
            window.plugins.OneSignal
                .startInit("e60fcbbf-b0f2-4f74-9df6-cf85c5710166", "133070389613")
                .handleNotificationOpened(notificationOpenedCallback)
                .inFocusDisplaying(window.plugins.OneSignal.OSInFocusDisplayOption.Notification)
                .endInit();
        }

        window.plugins.OneSignal.enableNotificationsWhenActive(true);
        window.plugins.OneSignal.enableVibrate(true);
        window.plugins.OneSignal.enableSound(true);

        if (window.localStorage.getItem("lanid") == undefined && window.localStorage.getItem("visname") == undefined) {
            $ionicPopup.confirm({
                title: 'CSIR Employee',
                subTitle: 'Please confirm if you are a CSIR Employee',
                buttons: [
                    {
                        text: 'Yes',
                        onTap: function (e) {
                            employee = true;
                            return employee;
                        }
                    },
                    {
                        text: 'No',
                        type: 'button-default',
                        onTap: function (e) {
                            return employee;
                        }
                    }
                ]
            }).then(function (employee) {
                if (employee) {
                    if (window.localStorage.getItem("lanid") == undefined) {
                        $ionicPopup.prompt({
                            title: 'LAN User Id',
                            subTitle: 'Enter your LAN User Id'
                        }).then(function (res) {
                            window.localStorage.setItem("lanid", res.toUpperCase());
                            window.plugins.OneSignal.getIds(function (ids) {
                                if (window.localStorage.getItem("lanid") != undefined) {
                                    $rootScope.$apply(function () {
                                        console.log('a');
                                        VisitorInformationService.SavePushInfo(window.localStorage.getItem("lanid"), ids.userId);
                                        console.log('b');
                                    });
                                }
                            });
                        });
                    }

                    if (window.localStorage.getItem("visname") == undefined) {
                        $ionicPopup.prompt({
                            title: 'Name & Surname',
                            subTitle: 'Please enter your Name & Surname'
                        }).then(function (res) {
                            if (res) {
                                window.localStorage.setItem("visname", $filter('capitalize')(res));
                            }
                        });
                    }
                } else {
                    if (window.localStorage.getItem("visname") == undefined) {
                        $ionicPopup.prompt({
                            title: 'Name & Surname',
                            subTitle: 'Please enter your Name & Surname'
                        }).then(function (res) {
                            if (res) {
                                window.localStorage.setItem("visname", $filter('capitalize')(res));
                            }
                        });
                    }
                }
            });
        }

    });
});
