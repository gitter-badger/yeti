app.controller('changepassController', [
    '$rootScope',
    '$scope',
    '$state',
    function(
        $rootScope,
        $scope,
        $state
    ) {
    $scope.passSubmit = function() {
        $scope.passwordError = {};
        $scope.changePass($rootScope.user.name, $scope.oldPassword, $scope.newPassword).then(function() {
            $state.go($state.previous.name);
        }).catch(function(err) {
            $scope.passwordError.message = err.data;
        });
    };
}]);