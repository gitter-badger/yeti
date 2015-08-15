app.factory('blockService', [
    '$q',
    '$http',
    function(
        $q,
        $http
    ) {
        var blockService = {};
        var blocks;
        var selectedBlockId;

        blockService.setSelectedBlockId = function(blockId) {
            selectedBlockId = blockId;
        };

        blockService.getSelectedBlockId = function() {
            return selectedBlockId;
        };

        blockService.setBlocks = function() {
            return fetchBlocks();
        };

        blockService.getBlocks = function(cacheBuster) {
            if (!blocks || cacheBuster) {
                return fetchBlocks().then(function(result) {
                    return blocks;
                });
            } else {
                return $q.when(blocks);
            }
        };

        blockService.getBlockById = function(blockId) {
            return _.find(blocks, {
                _id: blockId
            });
        };

        function fetchBlocks() {
            return $http.get('/api/blocks').then(function (result) {
                blocks = result.data;
                return blocks;
            }).catch(function (err) {
                console.log(err);
            });
        }

        return blockService;
}]);