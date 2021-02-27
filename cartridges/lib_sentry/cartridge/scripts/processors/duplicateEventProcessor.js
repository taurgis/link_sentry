'use strict';

// eslint-disable-next-line no-unused-vars
var SentryOptions = require('*/cartridge/models/SentryOptions');
// eslint-disable-next-line no-unused-vars
var SentryEvent = require('*/cartridge/models/SentryEvent');

/**
 * Main processor to set event data.
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
    return sentryEvent;
};

module.exports = DuplicateEventProcessor;
