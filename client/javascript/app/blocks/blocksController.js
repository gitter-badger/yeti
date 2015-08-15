app.controller('blocksController', [
    '$rootScope',
    '$scope',
    '$state',
    '$stateParams',
    '$http',
    '$timeout',
    '$mdDialog',
    'loaderService',
    'blockService',
    '$mdToast',
    function(
        $rootScope,
        $scope,
        $state,
        $stateParams,
        $http,
        $timeout,
        $mdDialog,
        loaderService,
        blockService,
        $mdToast
    ) {
        $scope.model = {};

        var editor = $('div#editor');
        var hoverTimer;

        var snapper = new Snap({
            element: document.getElementById('page-content-wrapper'),
            disable: 'right',
            maxPosition: 500,
            transitionSpeed: 1,
            easing: 'ease'
        });

        $scope.$on('$stateChangeSuccess', function(event, toState) {
            if (toState.name === 'blocksDefault' || toState.name === 'blocks') {
                initLoad();
            }
        });

        $scope.saveBlock = function() {
            var postData = {
                blockId: $scope.model.currentBlockId
            };

            if (!$scope.model.isBlog) {
                postData.blockContent = editor.froalaEditor('html.get');
            } else {
                postData.numPosts = $scope.model.blockSettings.numToDisplay;
                postData.displayTitles = $scope.model.blockSettings.displayTitles;
                postData.displayedCategories = $scope.model.blockSettings.displayedCategories;
            }

            $http({
                method: 'POST',
                url:    '/api/blocks',
                data: postData
            }).success(function(result) {
                if (result === 204) {
                    $mdToast.show(
                        $mdToast.simple()
                            .content('Block Saved!')
                            .position('top right')
                            .hideDelay(3000)
                    );
                }
            }).error(function(err) {
                throw new Error(err);
            });
        };

        $scope.deleteBlock = function(ev) {
            var confirm = $mdDialog.confirm()
                .title('Are you sure you want to delete this view?')
                .content('This cannot be reversed!')
                .targetEvent(ev)
                .ok('Delete')
                .cancel('Cancel');
            $mdDialog.show(confirm).then(function() {
                $http({
                    method: 'POST',
                    url: '/api/blocks/deleteBlock',
                    data: {
                        blockId: $scope.model.currentBlockId
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

        $scope.gotoBlock = function(id) {
            buildBlock(id || $scope.model.currentBlockId);
        };

        $scope.toggle = function (item, list) {
            var idx = list.indexOf(item);
            if (idx > -1) list.splice(idx, 1);
            else list.push(item);
        };

        $scope.exists = function (item, list) {
            return list.indexOf(item) > -1;
        };

        $scope.addBlock = function() {
            $http({
                method: 'POST',
                url: '/api/blocks/addBlock',
                data: {
                    blockType: $scope.model.blockType,
                    blockName: $scope.model.blockName
                }
            }).then(function(result) {
                $mdDialog.hide();
                if (result && result.data._id && result.data.revisions && result.status === 200) {
                    window.location.assign('/admin/#/blocks/' + result.data._id + '/' + result.data.revisions.length);
                }
            }).catch(function(err) {
                console.log(err);
            });
        };

        $scope.showConfirm = function(ev) {
            $mdDialog.show({
                templateUrl: '/javascript/app/blocks/addBlockModal.html',
                parent: angular.element(document.body),
                scope: $scope,
                preserveScope: true,
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

        function initLoad() {
            loaderService.show();

            blockService.getBlocks(true).then(function(result) {
                $scope.model.blocks = result;
                blockService.setSelectedBlockId(result[0]._id);
                $scope.model.currentBlockId = blockService.getSelectedBlockId();

                $http.get('/api/posts/categories').then(function (result) {
                    $scope.model.postCategories = result.data;
                    buildBlock();
                    loaderService.hide();
                });

            });
        }

        function buildBlock(id) {
            var currentBlock = blockService.getBlockById(id || blockService.getSelectedBlockId());
            $scope.model.currentBlock = currentBlock;

            if (currentBlock.type === 'blog') {
                $scope.model.blockSettings = {
                    numToDisplay: currentBlock.numPosts,
                    displayTitles: currentBlock.displayTitles,
                    displayedCategories: currentBlock.displayedCategories || []
                };
                $scope.model.isBlog = true;
            } else {
                $scope.model.isBlog = false;

                editor.froalaEditor({
                    toolbarButtons: ['fullscreen', 'bold', 'italic', 'underline', 'strikeThrough', 'subscript', 'superscript', 'fontFamily', 'fontSize', '|', 'color', 'emoticons', 'inlineStyle', 'paragraphStyle', '|', 'paragraphFormat', 'align', 'formatOL', 'formatUL', 'outdent', 'indent', '-', 'insertLink', 'insertImage', 'insertVideo', 'insertFile', 'insertTable', '|', 'quote', 'insertHR', 'undo', 'redo', 'clearFormatting', 'selectAll', 'html']
                });
                editor.froalaEditor('html.set', currentBlock.content);
            }

            $timeout(function() {
                var froalaLabel = $("div:contains('Unlicensed Froala Editor')");
                froalaLabel[froalaLabel.length-1].style.visibility='hidden';
            }, 350);
        }
}]);