'use strict';

// eslint-disable-next-line no-unused-vars
var SentryOptions = require('*/cartridge/models/SentryOptions');
// eslint-disable-next-line no-unused-vars
var SentryEvent = require('*/cartridge/models/SentryEvent');

/**
 * Processor to add cookie information to the request information.
 *
 * @param {SentryOptions} options - The options
 * @constructor
 */
function CookieProcessor(options) {
    if (!options) {
        throw new Error('The sentryOptions is required.');
    }

    this.options = options;
}

/**
 * Gets the cookies from the HTTP request
 *
 * @param {dw.system.Request} request - The HTTP request
 * @return {string} - The cookies as a string separated by ;
 */
function getCookies(request) {
    var cookies = '';

    if (request.httpCookies) {
        // eslint-disable-next-line no-plusplus
        for (var i = 0; i < request.httpCookies.cookieCount; i++) {
            var currentCookie = request.httpCookies[i];

            cookies += currentCookie.name + '=' + currentCookie.value + '; ';
        }
    }
    return cookies;
}

/**
 * Processes the event.
 *
 * @param {SentryEvent} sentryEvent - The event to process
 *
 * @returns {SentryEvent} - The processed event
 */
CookieProcessor.prototype.process = function (sentryEvent) {
    var currentSentryEvent = sentryEvent;

    this.options.logger.debug('Sentry :: Setting cookies on event.');

    currentSentryEvent.request.cookies = getCookies(request);

    return currentSentryEvent;
};

module.exports = CookieProcessor;
