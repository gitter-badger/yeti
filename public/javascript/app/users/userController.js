app.controller('userController', function($scope, $http, $state, $cookies) {
        $scope.verifyUser = function(user, pass) {
            return $http({
                method: 'POST',
                url:    '/users/verify',
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
                url:    '/users/verifyToken',
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
                url:    '/users/changepass',
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
    });