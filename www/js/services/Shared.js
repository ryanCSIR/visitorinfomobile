angular.module('services.Shared', [])
	.factory("Shared", function($ionicPopup) {
		var factory = {};
		/**
		 * Show a prompt
		 * @param {String} title
		 * @param {Function} successCallback
		 * @param {Function} errorCallback
		 */
		factory.showPrompt = function(text, successCallback, errorCallback) {
		  $ionicPopup.show({
			"template": "",
			"title": "Please confirm",
			"subTitle": text,
			"buttons": [{
				 "text": "OK",
				 "onTap": successCallback
			 },
			 {
				"text": "Cancel",
				"onTap": errorCallback }]
		 });
	       };
		/**
		 * Show an alert
		 * @param {String} title
		 * @param {String} content
		 */
		factory.showAlert = function (title, content) {
		    $ionicPopup.alert({
			title: title,
			content: content
		    });
		};
		/**
		 * messages
		 * for the application
		 */
		factory.messages = {
			"ERROR_RESET": "Could not remove geofences..", //called when bgGeo.removeGeofences errors
			"ERROR_PUSH_NOTIFICATION": "Could not send push notification..", //called when push notification fails
			"ERROR_MARKER": "Could not find marker", //called when marker can't be found by index
			"ERROR_GEOFENCE": "Could not find geofence", //called when geofence does not exist
		};

		return factory;
	 });


