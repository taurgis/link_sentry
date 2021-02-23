'use strict';

var server = require('server');

/**
 * Test controller to see that exceptions end up in Sentry.
 */
server.get('Error', function() {
    throw new Error('I am crashing, please help!');
});

module.exports = server.exports();
