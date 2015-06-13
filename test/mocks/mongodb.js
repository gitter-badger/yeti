module.exports = {
    MongoClient: {
        connect: function(db, cb) {
            return cb(new Error('connect ECONNREFUSED'), null);
        }
    }
};

