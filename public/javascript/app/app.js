var app = angular.module('dash', ['ui.router', 'ngCookies']);

app
    .config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {
        $urlRouterProvider.otherwise('/');

        $stateProvider
            .state('home', {
                url:'/',
                templateUrl: '/javascript/app/home/home.html',
                controller: 'homeController'
            })
            .state('login', {
                url:'/login',
                templateUrl: '/javascript/app/login/login.html',
                controller: 'loginController'
            })
            .state('admin', {
                url:'/admin',
                templateUrl: '/javascript/app/admin/admin.html',
                controller: 'adminController'
            })
            .state('changepass', {
                url:'/changepass',
                templateUrl: '/javascript/app/changepass/changepass.html',
                controller: 'changepassController'
            })
    }])
    .run(function($rootScope, $state) {
        $rootScope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState) {
            $state.previous = fromState;
        });
    });