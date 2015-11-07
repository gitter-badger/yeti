app.directive('controlPanel', ['$timeout', function($timeout) {
    return {
        restrict: 'E',
        link: function(scope) {
            var snapper = new Snap({
                element: document.getElementById('page-content-wrapper'),
                disable: 'right',
                maxPosition: 500,
                transitionSpeed: 1,
                easing: 'ease'
            });

            var hoverTimer;

            scope.startHover = function() {
                hoverTimer = $timeout(function() {
                    scope.toggleMenu()
                }, 500);
            };

            scope.endHover = function() {
                $timeout.cancel(hoverTimer);
            };

            scope.toggleMenu = function() {
                if (snapper.state().state === 'left') {
                    snapper.close();
                } else {
                    snapper.open('left');
                }
                $timeout.cancel(hoverTimer);
            };

            scope.closeMenu = function() {
                if (snapper.state().state === 'left') {
                    snapper.close();
                }
                $timeout.cancel(hoverTimer);
            };
        }
    };
}]);

