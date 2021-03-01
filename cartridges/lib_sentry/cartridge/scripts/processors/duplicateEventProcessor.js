'use strict';

// eslint-disable-next-line no-unused-vars
var SentryOptions = require('*/cartridge/models/SentryOptions');
// eslint-disable-next-line no-unused-vars
var SentryEvent = require('*/cartridge/models/SentryEvent');

/**
 * Processor to prevent duplicate events being sent to Sentry.
 *
 * @param {SentryOptions} options - The options
 * @constructor
 */
function DuplicateEventProcessor(options) {
    if (!options) {
        throw new Error('The sentryOptions is required.');
    }

    this.options = options;
}

/**
 * Processes the event.
 *
 * @param {SentryEvent} sentryEvent - The event to process
 *
 * @returns {SentryEvent} - The processed event
 */
DuplicateEventProcessor.prototype.process = function (sentryEvent) {
    var sentryEventError = sentryEvent.error;

    if (sentryEventError) {
        var eventsCache = require('dw/system/CacheMgr').getCache('sentryEvents');
        var Bytes = require('dw/util/Bytes');
        var MessageDigest = require('dw/crypto/MessageDigest');
        var Encoding = require('dw/crypto/Encoding');
        var sessionId = request.session.sessionID;

        this.options.logger.debug('Sentry :: Checking for duplicate events for error: {0}', sentryEventError.message);

        var exceptionHash = Encoding.toHex(
            new MessageDigest(MessageDigest.DIGEST_SHA_512).digestBytes(
                new Bytes(sessionId + sentryEventError.message + sentryEventError.stack)
            )
        );

        var cacheResult = eventsCache.get(exceptionHash);

        if (cacheResult) {
            this.options.logger.debug('Sentry :: Duplicate Exception detected. Event {0} will be discarded.', sentryEvent.event_id);

            return null;
        }

        this.options.logger.debug('Sentry :: Exception is not duplicate. Event {0} will pass through.', sentryEvent.event_id);

        eventsCache.put(exceptionHash, true);
    }

    return sentryEvent;
};

module.exports = DuplicateEventProcessor;
