'use strict';

var server = require('server');

server.extend(module.superModule);

/**
 * Logs the exception to Sentry when the Error page is loaded.
 *
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next call in the middleware chain
 */
function logError(req, res, next) {
    var error = req.error;

    if (error) {
        var Sentry = require('*/cartridge/scripts/Sentry');

        Sentry.captureException(new Error(error.errorText));
    }
    next();
}

server.prepend('Start', logError);
server.prepend('ErrorCode', logError);

/**
 * Logs forbidden access requests to Sentry. If a user is logged in, the customer number is logged.
 */
server.prepend('Forbidden', function (req, res, next) {
    if (req.currentCustomer.profile) {
        var Sentry = require('*/cartridge/scripts/Sentry');
        var message = 'Forbidden access for customer ' + req.currentCustomer.profile.customerNo;

        Sentry.captureException(new Error(message));
    }

    next();
});

module.exports = server.exports();
