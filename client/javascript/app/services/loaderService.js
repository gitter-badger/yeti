app.factory('loaderService', [
    '$rootScope',
    '$timeout',
    function(
        $rootScope,
        $timeout
    ) {
    var loaderService = {};
    var loaderDelay = 300;
    // loaderService controls the state of the splash screen, if it is hidden again within loaderDelay ms it never shows. Prevents flickering.
    var loaderState;

    loaderService.show = function() {
        loaderState = true;
        $timeout(function() {
            if (loaderState) {
                $rootScope.isLoading = true;
                loaderState = true;
            }
        }, loaderDelay);
    };

    loaderService.hide = function() {
        loaderState = false;
        $rootScope.isLoading = false;
    };

    return loaderService;
}]);