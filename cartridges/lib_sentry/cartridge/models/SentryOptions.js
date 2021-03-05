'use strict';

var DuplicateEventProcessor = require('*/cartridge/scripts/processors/duplicateEventProcessor');
var CookieProcessor = require('*/cartridge/scripts/processors/cookieProcessor');

/**
 * Sentry SDK options
 *
 * @param {Object} config - The configuration
 * @constructor
 */
function SentryOptions(config) {
    this.dsn = config.dsn;
    this.release = config.release;
    this.eventProcessors = [new DuplicateEventProcessor(this), new CookieProcessor(this)];
    this.logger = require('dw/system/Logger').getLogger('sentry');
}

/**
 * Adds an event processor
 *
 * @param {Object} EventProcessor - The event processor
 */
SentryOptions.prototype.addEventProcessor = function (EventProcessor) {
    this.eventProcessors.push(new EventProcessor(this));
};

/**
 * Returns the list of event processors
 *
 * @return {[function]} the event processor list
 */
SentryOptions.prototype.getEventProcessors = function () {
    return this.eventProcessors;
};

/**
 * Returns the configured Logger.
 *
 * @return {dw.system.Log} - the logger
 */
SentryOptions.prototype.getLogger = function () {
    return this.logger;
};

/**
 * Sets the Logger
 *
 * @param {dw.system.Log|dw.system.Logger} logger the logger interface
 */
SentryOptions.prototype.setLogger = function (logger) {
    if (!logger || (typeof logger.debug !== 'function')) {
        return;
    }

    this.logger = logger;
};

module.exports = SentryOptions;
