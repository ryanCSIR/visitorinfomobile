angular.module('services.VisitorInformationService', [])
    .factory('VisitorInformationService', function ($http, $q) {
        $http.defaults.headers.common['Access-Control-Allow-Origin'] = '*';

        var BASE_URL = "http://mule-test.csir.co.za:8081/api/visinfo/employees?";
        var SAVE_URL = "http://mule-test.csir.co.za:8081/api/visinfo/createpushid?";
        var GET_URL = "http://mule-test.csir.co.za:8081/api/visinfo/findpushid?";

        var items = [];

        return {
            GetPersonInfo: function (query) {
                var config = {
                    params: {
                        name: query,
                        callback: "JSON_CALLBACK"
                    }
                };

                return $http.jsonp(BASE_URL, config)
                    .success(function (response) {
                        return response.data;
                    }).error(function (data, status, headers, config) {
                        console.log(status);
                    });
            },
            SavePushInfo: function (lanid, pushid) {
                var config = {
                    params: {
                        lan_id: lanid,
                        push_id: pushid,
                        callback: "JSON_CALLBACK"
                    }
                };

                return $http.jsonp(SAVE_URL, config)
                    .success(function (response) {
                        return response.data;
                    }).error(function (data, status, headers, config) {
                        console.log(status);
                    });
            },
            GetPushInfo: function (lanid) {
                var config = {
                    params: {
                        lan_id: lanid,
                        callback: "JSON_CALLBACK"
                    }
                };
                var defferer = $q.defer();

                return $http.jsonp(GET_URL, config)
                    .success(function (response) {
                        defferer.resolve(response.data);
                        return defferer.promise;
                    }).error(function (data, status, headers, config) {
                        console.log(status);
                    });
            },
        };
    });
