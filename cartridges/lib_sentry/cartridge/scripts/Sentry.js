'use strict';

var SentryEvent = require('*/cartridge/models/SentryEvent');
var { getDSN, getProjectName, sendEvent } = require('*/cartridge/scripts/helpers/sentryHelper');
var SentryConfig = require('*/cartridge/config/sentry');

/**
 * The Sentry SFCC SDK Client.
 *
 * To use this SDK, call the {@link init} function as early as possible in the
 * main entry module. To set context information or send manual events, use the
 * provided methods.
 *
 * @example
 * ```
 *
 * var { init } = require('*\/cartridge/scripts/Sentry');
 *
 * init({
 *   dsn: '__DSN__',
 *   // ...
 * });
 * ```
 *
 * @example
 * ```
 *
 * var { init } = require('*\/cartridge/scripts/Sentry');
 * Sentry.captureMessage('Hello, world!');
 * Sentry.captureException(new Error('Good bye'));
 * ```
 */
function Sentry() {
    // EMPTY CONSTRUCTOR
}

Sentry.prototype.init = function (config) {
    this.dsn = (config && config.dsn) || getDSN();
    this.release = (config && config.release) || (getProjectName() + '@' + SentryConfig['code-version']);

    return this;
};

Sentry.prototype.captureMessage = function (message) {
    var sentryEvent = new SentryEvent({
        eventType: SentryEvent.TYPE_MESSAGE,
        release: this.release,
        message: message,
        level: SentryEvent.LEVEL_INFO
    });

    sendEvent(sentryEvent, this.dsn);
};

/**
 * Captures an exception event and sends it to Sentry.
 *
 * @param {Error} exception An exception-like object.
 * @returns {string} The event id
 */
Sentry.prototype.captureException = function (exception) {
    var sentryEvent = new SentryEvent({
        eventType: SentryEvent.TYPE_EXCEPTION,
        release: this.release,
        message: exception.message + (exception.stack ? '\n' + exception.stack : ''),
        type: exception.constructor.name,
        level: SentryEvent.LEVEL_ERROR
    });

    return sendEvent(sentryEvent, this.dsn);
};

module.exports = new Sentry();
