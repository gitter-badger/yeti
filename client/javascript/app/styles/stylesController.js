app.controller('stylesController', [
    '$rootScope',
    '$scope',
    '$state',
    '$stateParams',
    '$http',
    'loaderService',
    'styleService',
    '$mdDialog',
    '$timeout',
    '$mdToast',
    function(
        $rootScope,
        $scope,
        $state,
        $stateParams,
        $http,
        loaderService,
        styleService,
        $mdDialog,
        $timeout,
        $mdToast
    ) {
        $scope.model = {};
        $scope.model.styles = [];

        $scope.model.options = {
            allowedContent: true,
            extraPlugins: 'save'
        };

        var hoverTimer;

        var snapper = new Snap({
            element: document.getElementById('page-content-wrapper'),
            disable: 'right',
            maxPosition: 500,
            transitionSpeed: 1,
            easing: 'ease'
        });

        function initLoad(styleId) {
            loaderService.show();

            styleService.getStyles(true).then(function (result) {
                $scope.model.styles = result;
                if (!styleId) {
                    buildStyle($scope.model.styles[0]._id);
                    $scope.model.currentStyle = styleService.getStyleById($scope.model.styles[0]._id);
                    $scope.model.currentStyleId = $scope.model.styles[0]._id;
                } else {
                    buildStyle(styleId);
                    $scope.model.currentStyle = styleService.getStyleById(styleId);
                    $scope.model.currentStyleId = styleId;
                }

                loaderService.hide();
            });
        }

        function buildStyle(id) {
            var currentStyle = styleService.getStyleById(id || styleService.getSelectedStyleId());
            $scope.model.currentStyle = currentStyle;
            $scope.model.styleType = currentStyle.type;
        }

        $scope.saveStyle = function() {
            $http({
                method: 'POST',
                url:    '/api/styles',
                data: {
                    enabled: $scope.model.currentStyle.enabled,
                    styleId: $scope.model.currentStyleId,
                    styleContent: $scope.model.currentStyle.content,
                    styleType: $scope.model.currentStyle.type
                }
            }).success(function(result) {
                if (result === 204) {
                    $mdToast.show(
                        $mdToast.simple()
                            .content('Stylesheet Saved!')
                            .position('bottom right')
                            .hideDelay(3000)
                    );
                }
            }).error(function(err) {
                throw new Error(err);
            });
        };

        $scope.gotoStyle = function(id) {
            buildStyle(id || $scope.model.currentStyleId);
        };

        $scope.deleteStyle = function(ev) {
            var confirm = $mdDialog.confirm()
                .title('Are you sure you want to delete this style?')
                .content('This cannot be reversed!')
                .targetEvent(ev)
                .ok('Delete')
                .cancel('Cancel');
            $mdDialog.show(confirm).then(function() {
                $http({
                    method: 'POST',
                    url: '/api/styles/deleteStyle',
                    data: {
                        styleId: $scope.model.currentStyleId
                    }
                }).success(function (result) {
                    if (result) {
                        initLoad();
                    }
                }).error(function (err) {
                    throw new Error(err);
                });
            });
        };

        $scope.aceLoaded = function(editor) {
            editor.setTheme("ace/theme/github");
            editor.getSession().setMode("ace/mode/css");
        };

        $scope.$on('$stateChangeSuccess', function(event, toState) {
            if (toState.name === 'stylesDefault' || toState.name === 'styles') {
                initLoad();
            }
        });

        $scope.addStyle = function() {
            $http({
                method: 'POST',
                url: '/api/styles/addStyle',
                data: {
                    styleType: $scope.model.styleType,
                    styleName: $scope.model.styleName
                }
            }).then(function(result) {
                $mdDialog.hide();
                initLoad(result.data._id);
            }).catch(function(err) {
                console.log(err);
            });
        };

        $scope.showConfirm = function(ev) {
            $mdDialog.show({
                templateUrl: '/javascript/app/styles/addStyleModal.html',
                scope: $scope,
                preserveScope: true,
                parent: angular.element(document.body),
                targetEvent: ev,
                clickOutsideToClose: true
            });
        };

        $scope.startHover = function() {
            hoverTimer = $timeout(function() {
                $scope.toggleMenu()
            }, 500);
        };

        $scope.endHover = function() {
            $timeout.cancel(hoverTimer);
        };

        $scope.toggleMenu = function() {
            if (snapper.state().state === 'left') {
                snapper.close();
            } else {
                snapper.open('left');
            }
            $timeout.cancel(hoverTimer);
        };

        $scope.closeMenu = function() {
            if (snapper.state().state === 'left') {
                snapper.close();
            }
            $timeout.cancel(hoverTimer);
        };
}]);
