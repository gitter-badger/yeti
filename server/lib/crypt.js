var bcrypt = require('bcrypt');

module.exports = {
    crypt: function(password) {
        var salt = bcrypt.genSaltSync(10);
        var hash = bcrypt.hashSync(password, salt);
        return hash;
    },
    decrypt: function(password, hash) {
        return bcrypt.compareSync(password, hash);
    }
};