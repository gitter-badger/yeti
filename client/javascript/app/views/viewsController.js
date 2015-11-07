app.controller('viewsController', [
    '$rootScope',
    'viewService',
    '$scope',
    '$state',
    '$http',
    '$mdDialog',
    'loaderService',
    '$stateParams',
    '$sce',
    '$q',
    '$mdToast',
    'blockService',
    function(
        $rootScope,
        viewService,
        $scope,
        $state,
        $http,
        $mdDialog,
        loaderService,
        $stateParams,
        $sce,
        $q,
        $mdToast,
        blockService
    ) {
        $scope.model = {};

        $scope.model.selectedBlock = '';

        $scope.$on('$stateChangeSuccess', function(event, toState) {
            if (toState.name === 'viewsDefault' || toState.name === 'views') {
                initLoad();
            }
        });

        function initLoad(viewId) {
            loaderService.show();

            viewService.getViews(true).then(function (result) {
                $scope.model.views = result;
                if (!viewId) {
                    var defaultView = viewService.getDefaultView();
                    if (defaultView) {
                        buildView(defaultView.id);
                        $scope.model.currentView = viewService.getViewById(defaultView.id);
                        $scope.model.currentViewId = defaultView.id;
                    }
                } else {
                    buildView(viewId);
                    $scope.model.currentView = viewService.getViewById(viewId);
                    $scope.model.currentViewId = viewId;
                }

                loaderService.hide();
            });
        }

        function buildView(targetViewId) {
            var viewId = targetViewId || $scope.model.currentViewId;
            if (viewId) {
                $scope.model.blocks = [];
                blockService.getBlocks().then(function(result) {
                    _.each(result, function(block, idx) {
                        $scope.model.blocks.push({
                            id: block._id,
                            index: idx,
                            title: block.title
                        });
                    });

                    viewService.setSelectedViewId(viewId);
                    var view = viewService.getViewById(viewId);

                    if (~view.content.indexOf('{{')) {
                        insertBlocks(view.content).then(function (modifiedView) {
                            $scope.model.editorContent = $sce.trustAsHtml(modifiedView);
                        })
                            .catch(function (err) {
                                console.log(err);
                            });
                    } else {
                        $scope.model.editorContent = $sce.trustAsHtml(view.content);
                    }
                }).catch(function(err) {
                    console.log(err);
                });
            }
        }

        $scope.addView = function() {
            $http({
                method: 'POST',
                url: '/api/views/addView',
                data: {
                    viewName: $scope.model.viewName
                }
            }).then(function(result) {
                $mdDialog.hide();
                if (result.status === 200) {
                    initLoad(result.data._id);
                }
            }).catch(function(err) {
                console.log(err);
            });
        };

        $scope.showConfirm = function(ev) {
            $mdDialog.show({
                templateUrl: '/javascript/app/views/addViewModal.html',
                scope: $scope,
                preserveScope: true,
                parent: angular.element(document.body),
                targetEvent: ev,
                clickOutsideToClose: true
            });
        };

        $scope.saveView = function() {
            postView(getModifiedView());
        };

        $scope.deleteView = function(ev) {
            var confirm = $mdDialog.confirm()
                .title('Are you sure you want to delete this view?')
                .content('This cannot be reversed!')
                .targetEvent(ev)
                .ok('Delete')
                .cancel('Cancel');
            $mdDialog.show(confirm).then(function() {
                $http({
                    method: 'POST',
                    url:    '/api/views/deleteView',
                    data: {
                        viewId: $scope.model.currentViewId
                    }
                }).success(function(result) {
                    if (result) {
                        initLoad();
                    }
                }).error(function(err) {
                    throw new Error(err);
                });
            }, function() {
            });
        };

        $scope.addBlock = function() {
            postView(getModifiedView() + '{{-' + $scope.model.selectedBlock + '}}');
            buildView();
        };

        $scope.deleteBlock = function(viewContent) {
            postView(viewContent);
            buildView();
        };

        $scope.gotoView = function(viewId) {
            buildView(viewId || $scope.model.currentViewId);
            $scope.model.currentView = viewService.getViewById(viewId || $scope.model.currentViewId);
        };

        function insertBlocks(view) {
            var deferred = $q.defer();
            var modifiedView = '';
            var blocks = view.split(/\n/);

            _.forEach(blocks, function(block) {
                var blockId = (/{{-([\s\S]*?)}}/g).exec(block)[1];
                var blockContent = blockService.getBlockById(blockId);
                blockContent.content = blockContent.type === 'blog' ? 'Blog Post Block' : blockContent.content;

                modifiedView += '<div id="' + blockContent._id + '"' +
                    'class="blockContent" draggable="true"' +
                    'onDragStart="dragStart(this, event)"' +
                    'onDrop="dragDrop(this, event)"' +
                    'onDragOver="dragOver(this, event)"' +
                    'onDragLeave="dragLeave(this, event)">' + blockContent.content +
                    '<div class="blockControlBox">' +
                    '<a href="/admin/#/blocks/' + blockContent._id + '"><i class="btn fa fa-pencil fa-4x""></i></a>' +
                    '<i class="btn fa fa-trash-o fa-4x" onclick="deleteBlock(\'' + blockContent._id +'\')"></i>' +
                    '</div>' +
                    '</div>';
            });
            deferred.resolve(modifiedView);
            return deferred.promise;
        }

        function getModifiedView() {
            var viewContent = '';
            _.forEach(document.getElementById('viewEditor').childNodes, function(block) {
                if (block.id) {
                    viewContent += '{{-' + block.id + '}}\n';
                }
            });
            return viewContent;
        }

        function postView(viewContent) {
            $http({
                method: 'POST',
                url:    '/api/views',
                data: {
                    viewId: $scope.model.currentViewId,
                    viewContent: viewContent.replace(/\n$/, ''),
                    viewRoute: $scope.model.currentView.route,
                    viewIsDefault: $scope.model.currentView.defaultView
                }
            }).success(function(result) {
                if (result === 204) {
                    viewService.setViews().then(function() {
                        initLoad($scope.model.currentViewId);
                        $mdToast.show(
                            $mdToast.simple()
                                .content('View Saved!')
                                .position('bottom right')
                                .hideDelay(3000)
                        );
                    });
                }
            }).error(function(err) {
                throw new Error(err);
            });
        }
}]);
