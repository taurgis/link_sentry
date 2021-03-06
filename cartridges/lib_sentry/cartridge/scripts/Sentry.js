'use strict';

var SentryEvent = require('*/cartridge/models/SentryEvent');
var SentryOptions = require('*/cartridge/models/SentryOptions');
var {
    sendEvent, getLastEventID, getDSN, getProjectName
} = require('*/cartridge/scripts/helpers/sentryHelper');
var SentryConfig = require('*/cartridge/config/sentry');

var BEFORE_SEND_HOOK = 'com.sentry.beforesend';
var DEFAULT_OPTIONS = new SentryOptions({
    dsn: getDSN(),
    release: getProjectName() + '@' + SentryConfig['code-version']
});

/**
 * Processes and preprocesses the SentryEvent before it is sent to Sentry
 * @param {SentryEvent} sentryEvent - The Sentry Event
 *
 * @return {SentryId|null} - The Sentry Event ID
 */
function processEventCall(sentryEvent) {
    var currentSentryEvent = sentryEvent;

    this.options.getEventProcessors()
        .forEach(function (eventProcessor) {
            if (currentSentryEvent) {
                currentSentryEvent = eventProcessor.process(currentSentryEvent);
            }
        });

    if (currentSentryEvent) {
        var { hasHook, callHook } = require('dw/system/HookMgr');

        if (hasHook(BEFORE_SEND_HOOK)) {
            currentSentryEvent = callHook(BEFORE_SEND_HOOK, 'beforeSend', currentSentryEvent);

            if (!currentSentryEvent) {
                return null;
            }
        }

        return sendEvent(currentSentryEvent, this.options.dsn);
    }

    return null;
}

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
 * var Sentry = require('*\/cartridge/scripts/Sentry');
 *
 * Sentry.init();
 * Sentry.captureException(new Error('Good bye'));
 * ```
 *
 *
 * @example
 * ```
 * var Sentry = require('*\/cartridge/scripts/Sentry');
 *
 * Sentry.init({
 *   dsn: '__DSN__',
 *   // ...
 * });
 *
 * Sentry.captureException(new Error('Good bye'));
 * ```
 *
 * @example
 * ```
 * var Sentry = require('*\/cartridge/scripts/Sentry');
 * Sentry.captureMessage('Hello, world!');
 * Sentry.captureException(new Error('Good bye'));
 * Sentry.captureEvent(new SentryEvent({
 *     message: 'Manual',
 *     // ...
 * });
 * ```
 */
function Sentry() {
    this.initialized = false;
}

/**
 * Initializes Sentry with the given options. If no options are passed the default
 * options will be used.
 *
 * @param {SentryOptions|null|undefined} sentryOptions - The Sentry Options
 * @return {Sentry} - Sentry instance
 */
Sentry.prototype.init = function (sentryOptions) {
    this.options = sentryOptions ? new SentryOptions(sentryOptions) : DEFAULT_OPTIONS;
    this.initialized = true;

    return this;
};

/**
 * Returns the options of the Sentry instance. If not initialized, the default options will be used.
 *
 * @return {SentryOptions} - The current options
 */
Sentry.prototype.getOptions = function () {
    if (!this.initialized) {
        this.init(DEFAULT_OPTIONS);
    }

    return this.options;
};

/**
 * Captures the message.
 *
 * @param {string} message - The message to send.
 * @return {SentryId} - The Id (SentryId object) of the event
 */
Sentry.prototype.captureMessage = function (message) {
    if (!this.initialized) {
        this.init(DEFAULT_OPTIONS);
    }

    var sentryEvent = new SentryEvent({
        eventType: SentryEvent.TYPE_MESSAGE,
        release: this.options.release,
        message: message,
        level: SentryEvent.LEVEL_INFO
    });

    return sendEvent(sentryEvent, this.options.dsn);
};

/**
 * Captures an exception event and sends it to Sentry.
 *
 * @param {Error} error - An exception-like object.
 * @returns {SentryId|null} - The event id
 */
Sentry.prototype.captureException = function (error) {
    if (!this.initialized) {
        this.init(DEFAULT_OPTIONS);
    }

    var sentryEvent = new SentryEvent({
        error: error,
        eventType: SentryEvent.TYPE_EXCEPTION,
        release: this.options.release,
        level: SentryEvent.LEVEL_ERROR
    });

    return processEventCall.call(this, sentryEvent);
};

/**
 * Captures the event.
 *
 * @param {SentryEvent} sentryEvent - the event
 * @returns {SentryId} - The Id (SentryId object) of the event
 */
Sentry.prototype.captureEvent = function (sentryEvent) {
    if (!this.initialized) {
        this.init(DEFAULT_OPTIONS);
    }

    return processEventCall.call(this, sentryEvent);
};

/**
 * Fetch the last Event ID returned by Sentry.
 *
 * @returns {SentryId} - The last know Event ID returned by Sentry.
 */
Sentry.prototype.getLastEventID = function () {
    var lastEventId = getLastEventID();

    if (lastEventId) {
        return lastEventId;
    }

    return null;
};

module.exports = new Sentry();
