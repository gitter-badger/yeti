app.controller('loginController', [
    '$rootScope',
    '$scope',
    '$state',
    function(
        $rootScope,
        $scope,
        $state
    ) {
    $scope.loginSubmit = function() {
        $scope.loginError = {};
        $scope.verifyUser($scope.inputUser, $scope.inputPassword).then(function(result) {
            if (result.data.success) {
                delete $scope.loginError.message;
                $scope.setToken($scope.inputUser, result.data.token);
                $state.go($state.previous.name || 'home');
            } else {
                $scope.loginError.message = 'Username and/or password incorrect.';
            }
        }).catch(function(err) {
            $scope.loginError.message = err.data;
        });
    };
}]);
