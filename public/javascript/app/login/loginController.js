app.controller('loginController', function($rootScope, $scope, $state, $cookies) {
        $scope.loginSubmit = function() {
            $scope.loginError = {};
            $scope.verifyUser($scope.inputUser, $scope.inputPassword).then(function(result) {
                if (result.data.success) {
                    delete $scope.loginError.message;
                    $cookies.put('authToken', result.data.token);
                    $rootScope.verified = true;
                    $rootScope.user = {
                        name: $scope.inputUser
                    };
                    $state.go($state.previous.name);
                }
            }).catch(function(err) {
                $scope.loginError.message = err.data;
            });
        };
    });