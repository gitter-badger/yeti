app.controller('adminController', [
    '$rootScope',
    '$scope',
    '$state',
    'viewService',
    function(
        $rootScope,
        $scope,
        $state,
        viewService
    ) {
        $rootScope.isLoading = false;

        $scope.$on('$viewContentLoaded', function() {
            $scope.refreshAuth().catch(function() {
                $state.go('login');
            });
        });

        $scope.$on('$stateChangeSuccess', function() {
            viewService.getViews().then(function(result) {
                $scope.views = result;
            });
        });
}]);