'use strict';

var SentryEvent = require('*/cartridge/models/SentryEvent');
var SentryId = require('*/cartridge/models/SentryId');
var SentryOptions = require('*/cartridge/models/SentryOptions');
var {
    sendEvent, getLastEventID
} = require('*/cartridge/scripts/helpers/sentryHelper');

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

/**
 * Initializes Sentry with the given options
 *
 * @param {SentryOptions} sentryOptions - The Sentry Options
 * @return {Sentry} - Sentry instance
 */
Sentry.prototype.init = function (sentryOptions) {
    this.options = sentryOptions || new SentryOptions(null);

    return this;
};

Sentry.prototype.captureMessage = function (message) {
    var sentryEvent = new SentryEvent({
        eventType: SentryEvent.TYPE_MESSAGE,
        release: this.options.release,
        message: message,
        level: SentryEvent.LEVEL_INFO
    });

    sendEvent(sentryEvent, this.options.dsn);
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
        release: this.options.release,
        message: exception.message + (exception.stack ? '\n' + exception.stack : ''),
        type: exception.constructor.name,
        level: SentryEvent.LEVEL_ERROR
    });

    this.options.getEventProcessors().forEach(function (eventProcessor) {
        eventProcessor.process(sentryEvent);
    });

    return sendEvent(sentryEvent, this.options.dsn);
};

/**
 * Fetch the last Event ID returned by Sentry.
 *
 * @returns {SentryId} - The last know Event ID returned by Sentry.
 */
Sentry.prototype.getLastEventID = function () {
    var lastEventId = getLastEventID();

    if (lastEventId) {
        return new SentryId(lastEventId);
    }

    return null;
};

module.exports = new Sentry();
