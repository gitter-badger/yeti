app.factory('styleService', [
    '$q',
    '$http',
    function(
        $q,
        $http
    ) {
        var styleService = {};
        var styles;
        var selectedStyleId;

        styleService.setSelectedStyleId = function(styleId) {
            selectedStyleId = styleId;
        };

        styleService.getSelectedStyleId = function() {
            return selectedStyleId;
        };

        styleService.setStyles = function() {
            return fetchStyles();
        };

        styleService.getStyles = function(cacheBuster) {
            if (!styles || cacheBuster) {
                return fetchStyles().then(function(result) {
                    return styles;
                });
            } else {
                return $q.when(styles);
            }
        };

        styleService.getStyleById = function(styleId) {
            return _.find(styles, {
                _id: styleId
            });
        };

        function fetchStyles() {
            return $http.get('/api/styles').then(function (result) {
                styles = result.data;
                return styles;
            }).catch(function (err) {
                console.log(err);
            });
        }

        return styleService;
}]);