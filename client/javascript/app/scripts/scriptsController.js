app.controller('scriptsController', [
    '$rootScope',
    '$scope',
    '$state',
    '$stateParams',
    '$http',
    'loaderService',
    'scriptService',
    '$mdDialog',
    '$mdToast',
    '$timeout',
    function(
        $rootScope,
        $scope,
        $state,
        $stateParams,
        $http,
        loaderService,
        scriptService,
        $mdDialog,
        $mdToast,
        $timeout
    ) {
        $scope.model = {};
        $scope.model.scripts = [];

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

        function initLoad(scriptId) {
            loaderService.show();

            scriptService.getScripts(true).then(function (result) {
                $scope.model.scripts = result;
                if (!scriptId) {
                    buildScript($scope.model.scripts[0]._id);
                    $scope.model.currentScript = scriptService.getScriptById($scope.model.scripts[0]._id);
                    $scope.model.currentScriptId = $scope.model.scripts[0]._id;
                } else {
                    buildScript(scriptId);
                    $scope.model.currentScript = scriptService.getScriptById(scriptId);
                    $scope.model.currentScriptId = scriptId;
                }

                loaderService.hide();
            });
        }

        function buildScript(id) {
            var currentScript = scriptService.getScriptById(id || scriptService.getSelectedScriptId());
            $scope.model.currentScript = currentScript;
            $scope.model.scriptType = currentScript.type;
        }

        $scope.saveScript = function() {
            $http({
                method: 'POST',
                url:    '/api/scripts',
                data: {
                    enabled: $scope.model.currentScript.enabled,
                    scriptId: $scope.model.currentScriptId,
                    scriptContent: $scope.model.currentScript.content,
                    scriptType: $scope.model.currentScript.type
                }
            }).success(function(result) {
                if (result === 204) {
                    $mdToast.show(
                        $mdToast.simple()
                            .content('Scriptsheet Saved!')
                            .position('top right')
                            .hideDelay(3000)
                    );
                }
            }).error(function(err) {
                throw new Error(err);
            });
        };

        $scope.gotoScript = function(id) {
            buildScript(id || $scope.model.currentScriptId);
        };

        $scope.deleteScript = function(ev) {
            var confirm = $mdDialog.confirm()
                .title('Are you sure you want to delete this script?')
                .content('This cannot be reversed!')
                .targetEvent(ev)
                .ok('Delete')
                .cancel('Cancel');
            $mdDialog.show(confirm).then(function() {
                $http({
                    method: 'POST',
                    url: '/api/scripts/deleteScript',
                    data: {
                        scriptId: $scope.model.currentScriptId
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
            if (toState.name === 'scriptsDefault' || toState.name === 'scripts') {
                initLoad();
            }
        });

        $scope.addScript = function() {
            $http({
                method: 'POST',
                url: '/api/scripts/addScript',
                data: {
                    scriptType: $scope.model.scriptType,
                    scriptName: $scope.model.scriptName
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
                templateUrl: '/javascript/app/scripts/addScriptModal.html',
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
