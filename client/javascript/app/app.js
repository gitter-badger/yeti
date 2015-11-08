var app = angular.module('dash', [
    'ui.router',
    'ngCookies',
    'ngMaterial',
    'wu.masonry',
    'ui.ace'
]);

app.config([
    '$stateProvider',
    '$urlRouterProvider',
    '$mdThemingProvider',
    function(
        $stateProvider,
        $urlRouterProvider,
        $mdThemingProvider
    ) {
        $mdThemingProvider.definePalette('yeti', {
            '50': 'f8f8f8',
            '100': '333333',
            '200': '0d47a1',
            '300': '0d47a1',
            '400': '0d47a1',
            '500': '0d47a1',
            '600': '0d47a1',
            '700': '0d47a1',
            '800': '0d47a1',
            '900': '0d47a1',
            'A100': '0d47a1',
            'A200': '0d47a1',
            'A400': '0d47a1',
            'A700': '0d47a1',
            'contrastDefaultColor': 'light'
        });
        $mdThemingProvider.theme('default')
            .primaryPalette('blue', {
                'default': '800'
            })
            .accentPalette('yeti', {
                'default': '500',
                'hue-1': '50',
                'hue-2': '100'
            });

        $urlRouterProvider.otherwise('/');

        $stateProvider
            .state('home', {
                url:'/',
                templateUrl: '/javascript/app/admin/admin.html',
                controller: 'adminController'
            })
            .state('users', {
                url:'/users',
                templateUrl: '/javascript/app/users/users.html',
                controller: 'userController'
            })
            .state('login', {
                url:'/login',
                templateUrl: '/javascript/app/login/login.html',
                controller: 'loginController'
            })
            .state('changepass', {
                url:'/changepass',
                templateUrl: '/javascript/app/changepass/changepass.html',
                controller: 'changepassController'
            })
            .state('views', {
                url:'/views',
                templateUrl: '/javascript/app/views/views.html',
                controller: 'viewsController',
                params: {
                    viewId: { value: null }
                }
            })
            .state('blocks', {
                url:'/blocks',
                templateUrl: '/javascript/app/blocks/blocks.html',
                controller: 'blocksController',
                params: {
                    blockId: { value: null }
                }
            })
            .state('posts', {
                url:'/posts',
                templateUrl: '/javascript/app/posts/posts.html',
                controller: 'postsController',
                params: {
                    postId: { value: null }
                }
            })
            .state('styles', {
                url:'/styles',
                templateUrl: '/javascript/app/styles/styles.html',
                controller: 'stylesController',
                params: {
                    styleId: { value: null }
                }
            })
            .state('scripts', {
                url:'/scripts',
                templateUrl: '/javascript/app/scripts/scripts.html',
                controller: 'scriptsController',
                params: {
                    scriptId: { value: null }
                }
            })
            .state('gallery', {
                url:'/gallery',
                templateUrl: '/javascript/app/gallery/gallery.html',
                controller: 'galleryController'
            })
}])
.run([
        '$rootScope',
        '$state',
    function(
        $rootScope,
        $state
    ) {
    $rootScope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState) {
        $state.previous = fromState;
        $rootScope.current = toState.name.charAt(0).toUpperCase() + toState.name.slice(1);
    });
}]);


var dragSource;

function dragLeave(div, event) {
    div.style.opacity = 1;
}
function dragOver(div, event) {
    div.style.opacity = 0.3;
    event.preventDefault();
}
function dragStart(div, event) {
    dragSource = div;
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/html', div.innerHTML);
}
function dragDrop(div, event) {
    div.style.opacity = 1;
    if (event.stopPropogation) {
        event.stopPropogation();
    }

    if (dragSource != div) {
        var oldId = dragSource.id;
        dragSource.innerHTML = div.innerHTML;
        dragSource.id = div.id;
        div.id = oldId;
        div.innerHTML = event.dataTransfer.getData('text/html');
    }

    return false;
}
function deleteBlock(div) {
    var viewContent = '';
    _.forEach(document.getElementById('viewEditor').childNodes, function(block) {
        if (block.id !== div) {
            viewContent += '{{-' + block.id + '}}\n';
        }
    });
    angular.element($('#viewEditor')).scope().deleteBlock(viewContent);
}
function editBlock(blockId) {
    angular.element($('#viewEditor')).scope().editBlock(blockId);
}
