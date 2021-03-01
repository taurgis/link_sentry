'use strict';

var SentryEvent = require('*/cartridge/models/SentryEvent');
var SentryId = require('*/cartridge/models/SentryId');
var SentryOptions = require('*/cartridge/models/SentryOptions');
var {
    sendEvent, getLastEventID
} = require('*/cartridge/scripts/helpers/sentryHelper');
var BEFORE_SEND_HOOK = 'com.sentry.beforesend';

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
    this.options = new SentryOptions(sentryOptions);

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
 * @param {Error} error An exception-like object.
 * @returns {string|null} The event id
 */
Sentry.prototype.captureException = function (error) {
    var sentryEvent = new SentryEvent({
        error: error,
        eventType: SentryEvent.TYPE_EXCEPTION,
        release: this.options.release,
        level: SentryEvent.LEVEL_ERROR
    });

    this.options.getEventProcessors().forEach(function (eventProcessor) {
        if (sentryEvent) {
            sentryEvent = eventProcessor.process(sentryEvent);
        }
    });

    if (sentryEvent) {
        var { hasHook, callHook } = require('dw/system/HookMgr');

        if (hasHook(BEFORE_SEND_HOOK)) {
            sentryEvent = callHook(BEFORE_SEND_HOOK, 'beforeSend', sentryEvent);

            if (!sentryEvent) {
                return null;
            }
        }

        return sendEvent(sentryEvent, this.options.dsn);
    }

    return null;
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
