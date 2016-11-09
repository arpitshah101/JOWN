var assert = require('assert');

var UserModule = require('../models/User');

describe('Array', function() {
    describe('#indexOf()', function() {
        it('should return -1 when the result is not present', function() {
            assert.equal(-1, [1, 2, 3].indexOf(4));
        });
        it('should return 0 when searching for 1', function() {
            assert.equal([1, 2, 4].indexOf(1), 0);
        });
    });
});