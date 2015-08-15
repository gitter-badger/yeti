app.factory('scriptService', [
    '$q',
    '$http',
    function(
        $q,
        $http
    ) {
        var scriptService = {};
        var scripts;
        var selectedScriptId;

        scriptService.setSelectedScriptId = function(scriptId) {
            selectedScriptId = scriptId;
        };

        scriptService.getSelectedScriptId = function() {
            return selectedScriptId;
        };

        scriptService.setScripts = function() {
            return fetchScripts();
        };

        scriptService.getScripts = function(cacheBuster) {
            if (!scripts || cacheBuster) {
                return fetchScripts().then(function(result) {
                    return scripts;
                });
            } else {
                return $q.when(scripts);
            }
        };

        scriptService.getScriptById = function(scriptId) {
            return _.find(scripts, {
                _id: scriptId
            });
        };

        function fetchScripts() {
            return $http.get('/api/scripts').then(function (result) {
                scripts = result.data;
                return scripts;
            }).catch(function (err) {
                console.log(err);
            });
        }

        return scriptService;
}]);