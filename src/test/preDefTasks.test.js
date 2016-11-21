var assert = require('assert');

var preDefTasks = require('../modules/preDefTasks'); 

describe('PreDefTasks', function() {

    describe('#jownprint', function() {
        var tests = [
            {arg: ['hello'], expected: 'hello'},
            {arg: ['hello', 'world'], expected: 'hello world'},
            {arg: ['-al'], expected: '-al'},
            {arg: null, expected: null},
            {arg: [], expected: ''}
        ];

        tests.forEach(function(test) {
            it('correctly prints the arg array: ' + test.arg, function() {
                var res = preDefTasks.PreDefTasks.prototype.jownprint(test.arg);
                assert.deepEqual(res, test.expected);
            });
        });
    });
    
});