'use strict';

var {
    getDSN, getProjectName
} = require('*/cartridge/scripts/helpers/sentryHelper');
var SentryConfig = require('*/cartridge/config/sentry');
var DuplicateEventProcessor = require('*/cartridge/scripts/processors/duplicateEventProcessor');

/**
 * Sentry SDK options
 *
 * @param {Object|null|undefined} config - The configuration
 * @constructor
 */
function SentryOptions(config) {
    this.dsn = (config && config.dsn) || getDSN();
    this.release = (config && config.release) || (getProjectName() + '@' + SentryConfig['code-version']);
    this.eventProcessors = [new DuplicateEventProcessor(this)];
    this.logger = require('dw/system/Logger').getLogger('sentry');
}

/**
 * Adds an event processor
 *
 * @param {Object} eventProcessor - The event processor
 */
SentryOptions.prototype.addEventProcessor = function (eventProcessor) {
    this.eventProcessors.push(eventProcessor(this));
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
