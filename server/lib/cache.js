var NodeCache = require( "node-cache" );
var cache = new NodeCache();

module.exports = {
    get: function(key) {
        return cache.get(key);
    },
    set: function(key, val) {
        cache.set(key, val);
    },
    del: function(key) {
        cache.del(key);
    },
    flush: function() {
        cache.flushAll();
    },
    list: function() {
        return cache.keys();
    },
    stats: function() {
        return cache.getStats();
    }
};