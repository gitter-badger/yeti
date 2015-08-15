app.factory('postService', [
    '$q',
    '$http',
    function(
        $q,
        $http
    ) {
        var postService = {};
        var posts;
        var selectedPostId;

        postService.setSelectedPostId = function(postId) {
            selectedPostId = postId;
        };

        postService.getSelectedPostId = function() {
            return selectedPostId;
        };

        postService.setPosts = function() {
            return fetchPosts();
        };

        postService.getPosts = function(cacheBuster) {
            if (!posts || cacheBuster) {
                return fetchPosts().then(function(result) {
                    return posts;
                });
            } else {
                return $q.when(posts);
            }
        };

        postService.getPostById = function(postId) {
            return _.find(posts, {
                _id: postId
            });
        };

        function fetchPosts() {
            return $http.get('/api/posts').then(function (result) {
                posts = result.data;
                return posts;
            }).catch(function (err) {
                console.log(err);
            });
        }

        return postService;
}]);