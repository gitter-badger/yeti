app.controller('userController', [
    '$rootScope',
    '$scope',
    '$q',
    '$http',
    '$state',
    '$cookies',
    '$mdDialog',
    'loaderService',
    function(
        $rootScope,
        $scope,
        $q,
        $http,
        $state,
        $cookies,
        $mdDialog,
        loaderService
    ) {
    $scope.$on('$stateChangeSuccess', function(event, toState) {
        if (toState.name === 'users') {
            loaderService.show();

            getUsers().then(function (result) {
                $scope.userList = result.data;

                loaderService.hide();
            }).catch(function (err) {
                console.log(err);
            });
        }
    });

    $scope.verifyUser = function(user, pass) {
        return $http({
            method: 'POST',
            url:    '/api/users/verify',
            data: {
                username:   user,
                password:   pass
            }
        }).success(function(result) {
            return result;
        }).error(function(err) {
            return err;
        });
    };
    $scope.verifyToken = function(token) {
        return $http({
            method: 'POST',
            url:    '/api/users/verifytoken',
            data: {
                token: token
            }
        }).success(function(result) {
            return result;
        }).error(function(err) {
            return err;
        });
    };
    $scope.logout = function() {
        $cookies.remove('authToken');
        $state.go('login');
    };
    $scope.changePass = function(userName, oldPassword, newPassword) {
        return $http({
            method: 'POST',
            url:    '/api/users/changepass',
            data: {
                username:   userName,
                oldpassword: oldPassword,
                newpassword: newPassword
            }
        }).success(function(result) {
            return result;
        }).error(function(err) {
            return err;
        });
    };
    $scope.setToken = function(user, token) {
        $cookies.put('authToken', token);
        $rootScope.verified = true;
        $rootScope.user = {
            name: user
        };
    };
    $scope.refreshAuth = function() {
        var deferred = $q.defer();

        var tokenCookie = $cookies.get('authToken');

        $scope.verifyToken(tokenCookie).then(function (result) {
            if (result.status === 200) {
                $rootScope.verified = true;
                $rootScope.user = {
                    name: result.data.decoded.userName
                };
                deferred.resolve(true);
            } else {
                deferred.reject(401);
            }
        }).catch(function(err) {
            deferred.reject(err);
        });

        return deferred.promise;
    };

    $scope.refreshAuth().catch(function() {
        $state.go('login');
    });

    $scope.userSubmit = function() {
        $http({
            method: 'POST',
            url:    '/api/users/register',
            data: {
                firstRun: true,
                username: $scope.inputUsername,
                password: $scope.inputPassword,
                email: $scope.inputEmail
            }
        }).success(function(result) {
            $scope.verifyUser($scope.inputUsername, $scope.inputPassword).then(function(result) {
                if (result.data.success) {
                    $mdDialog.hide();
                    $state.go($state.current, {}, {reload: true});
                }
            });
        }).error(function(err) {
            throw new Error(err);
        });
    };

    $scope.deleteUser = function(ev, id) {
        var confirm = $mdDialog.confirm()
            .title('Are you sure you want to delete this user?')
            .content('This cannot be reversed!')
            .targetEvent(ev)
            .ok('Delete')
            .cancel('Cancel');
        $mdDialog.show(confirm).then(function() {
            $http({
                method: 'POST',
                url:    '/api/users/delete/' + id
            }).success(function() {
                $state.go($state.current, {}, {reload: true});
            }).error(function(err) {
                throw new Error(err);
            });
        }, function() {
        });
    };

    $scope.showConfirm = function(ev) {
        $mdDialog.show({
            templateUrl: '/javascript/app/users/addUserModal.html',
            parent: angular.element(document.body),
            targetEvent: ev,
            clickOutsideToClose: true
        });
    };

    function getUsers() {
        return $http.get('/api/users').then(function(result) {
            return result;
        }).catch(function(err) {
            return err;
        });
    }
}]);
