app.controller('changepassController', function($rootScope, $scope, $state, $cookies) {
    $scope.passSubmit = function() {
        $scope.passwordError = {};
        $scope.changePass($rootScope.user.name, $scope.oldPassword, $scope.newPassword).then(function(result) {
            $state.go($state.previous.name);
        }).catch(function(err) {
            $scope.passwordError.message = err.data;
        });
    };
});