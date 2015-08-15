app.factory('viewService', [
    '$q',
    '$http',
    function(
        $q,
        $http
    ) {
    var viewService = {};
    var views;
    var selectedViewId;

    viewService.setSelectedViewId = function(viewId) {
        selectedViewId = viewId;
    };

    viewService.getSelectedViewId = function() {
        return selectedViewId;
    };

    viewService.setViews = function() {
        return fetchViews();
    };

    viewService.getViews = function(cacheBuster) {
        if (!views || cacheBuster) {
            return fetchViews().then(function(result) {
                return views;
            });
        } else {
            return $q.when(views);
        }
    };

    viewService.getViewById = function(viewId) {
        return _.find(views, {
            id: viewId
        });
    };

    viewService.getDefaultView = function() {
        return _.find(views, {
            defaultView: true
        });
    };

    function fetchViews() {
        return $http.get('/api/views/edit').then(function (result) {
            views = result.data;
            return views;
        }).catch(function (err) {
            console.log(err);
        });
    }

    return viewService;
}]);