app.controller('adminController', function($rootScope, $scope, $state, $cookies) {
    $scope.$on('$viewContentLoaded', function() {
        var tokenCookie = $cookies.get('authToken');
        if (tokenCookie) {
            $scope.verifyToken(tokenCookie).then(function (result) {
                if (result.status === 200) {
                    $rootScope.verified = true;
                    $rootScope.user = {
                        name: result.data.decoded.userName
                    };
                }
            }).catch(function() {
                $state.go('login');
            });
        } else {
            $state.go('login');
        }
    });
});