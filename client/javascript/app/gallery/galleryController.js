app.controller('galleryController', [
    '$rootScope',
    '$scope',
    '$state',
    '$http',
    'loaderService',
    '$mdDialog',
    '$timeout',
    function(
        $rootScope,
        $scope,
        $state,
        $http,
        loaderService,
        $mdDialog,
        $timeout
    ) {
        var hoverTimer;

        var snapper = new Snap({
            element: document.getElementById('page-content-wrapper'),
            disable: 'right',
            maxPosition: 500,
            transitionSpeed: 1,
            easing: 'ease'
        });

        $scope.$on('$stateChangeSuccess', function(event, toState) {
            if (toState.name === 'gallery') {
                loaderService.show();

                $scope.getMedia();
            }
        });

        $scope.showConfirm = function(ev, fileName) {
            var confirm = $mdDialog.confirm()
                .title('Are you sure you want to delete ' + fileName + '?')
                .content('This cannot be reversed!')
                .ariaLabel('Lucky day')
                .targetEvent(ev)
                .ok('DELETE')
                .cancel('Cancel');
            $mdDialog.show(confirm).then(function() {
                $scope.deleteImage(fileName);
            }, function() {
            });
        };

        $scope.getMedia = function () {
            $http({
                method: 'GET',
                url: '/api/media'
            }).success(function (result) {
                $scope.mediaList = result;

                loaderService.hide();
            }).error(function (err) {
                throw new Error(err);
            });
        };

        $scope.submitImage = function() {
            var file = document.getElementById('inputFile').files[0];
            var reader = new FileReader();
            reader.onloadend = function(e){
                loaderService.show();
                var data = e.target.result;
                $http({
                    method: 'POST',
                    url:    '/api/media',
                    data: {
                        file_name: file.name,
                        media_data: data
                    }
                }).success(function(result) {
                    if (result === 204) {
                        loaderService.hide();
                        location.reload();
                    }
                }).error(function(err) {
                    throw new Error(err);
                });
            };
            reader.readAsBinaryString(file);
        };

        $scope.deleteImage = function(fileName) {
            $http({
                method: 'POST',
                url:    '/api/media/deleteImg',
                data: {
                    fileName: fileName
                }
            }).success(function(result) {
                if (result === 204) {
                    location.reload();
                }
            }).error(function(err) {
                throw new Error(err);
            });
        };

        $scope.displayImage = function(file) {
            var fileType = file.split('.').pop();
            return ((fileType === 'svg') ? '/images/' : '/images/thumbs/thumb_') + file;
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
