'use strict';

var Logger = require('dw/system/Logger').getLogger('sentry');
var DSN_PREFERENCE = 'sentryDSN';
var PROJECT_NAME_PREFERENCE = 'sentryProjectID';

/**
 * Gets the Public Key (DSN) URL from the Site Preference. First try to fetch it from
 * the cache, if it is not in there get it from the preference and store it.
 *
 * @return {string|Object} - The DSN URL
 */
function getDSN() {
    var configCache = require('dw/system/CacheMgr').getCache('sentryConfig');

    Logger.debug('Sentry :: Fetching DSN.');

    return configCache.get('DSN', function () {
        var currentSite = require('dw/system/Site').getCurrent();

        Logger.debug('Sentry :: Fetching DSN from the Site Preference.');

        return currentSite.getCustomPreferenceValue(DSN_PREFERENCE);
    });
}

/**
 * Gets the project ID for Sentry. First try to fetch it from
 * the cache, if it is not in there get it from the preference and store it.
 *
 * @return {string|Object} - The project ID
 */
function getProjectName() {
    var configCache = require('dw/system/CacheMgr').getCache('sentryConfig');

    Logger.debug('Sentry :: Fetching Project Name.');

    return configCache.get('projectName', function () {
        var currentSite = require('dw/system/Site').getCurrent();

        Logger.debug('Sentry :: Fetching Project Name from the Site Preference.');

        return currentSite.getCustomPreferenceValue(PROJECT_NAME_PREFERENCE);
    });
}

/**
 * Set the amount of seconds we should stop trying to send events to Sentry.
 *
 * Note: This is a helper function to manage the Retry-After header.
 *
 * @param {number} seconds - The amount of seconds to stop sending events
 */
function blockSendingEvents(seconds) {
    var configCache = require('dw/system/CacheMgr').getCache('sentryConfig');
    var currentDateTime = new Date();

    currentDateTime.setSeconds(currentDateTime.getSeconds() + seconds);

    Logger.debug('Sentry :: We will stop sending requests until {0}.', currentDateTime);

    configCache.put('retryAfter', currentDateTime.getTime());
}

/**
 * Checks if we are allowed to send a request to Sentry.
 *
 * @return {boolean} - Wether or not we can send an event
 */
function canSendEvent() {
    var configCache = require('dw/system/CacheMgr').getCache('sentryConfig');
    var retryAfter = configCache.get('retryAfter');

    Logger.debug('Sentry :: Checking if we can send events to Sentry.');

    if (retryAfter) {
        var currentDateTime = Date.now();

        Logger.debug('Sentry :: Recently had a Retry header, which was set until {0}. Current Time is {1}, so result is {2}.',
            new Date(retryAfter), new Date(currentDateTime), currentDateTime > retryAfter);

        return currentDateTime > retryAfter;
    }

    return true;
}

/**
 * Logs an exception in sentry
 * @param {Object} sentryEvent - The Sentry Event to send
 * @param {string} dsn - The DSN to use
 *
 * @returns {string|null} - The Sentry Event ID
 */
function sendEvent(sentryEvent, dsn) {
    if (!empty(sentryEvent) && canSendEvent()) {
        var sentryService = require('*/cartridge/scripts/services/sentryService');
        var sentryServiceRequest = sentryService.sentryEvent(sentryEvent, dsn);
        var result = sentryServiceRequest.call();
        
        if (!result.error) {
            return result.object;
        }

        var resultClient = sentryServiceRequest.getClient();

        Logger.debug('Sentry :: Sentry returned an error: {0}.', resultClient.getResponseHeaders().keySet().toArray().length);

        if (resultClient.statusCode === 429) {
            Logger.debug('Sentry :: Sentry is under maintenance, or our DSN has reached its monthly limit.');

            var retryHeaderValues = resultClient.getResponseHeader('Retry-After');

            if (retryHeaderValues && retryHeaderValues.length > 0) {
                var retryHeaderValue = retryHeaderValues.get(0);

                if (retryHeaderValue) {
                    Logger.debug('Sentry :: Sentry is sending Retry-After with a value of {0}.', retryHeaderValue);

                    blockSendingEvents(Number(retryHeaderValue));
                }
            } else {
                blockSendingEvents(Number(1000));
            }

            return result.errorMessage;
        }
    }

    return null;
}


module.exports = {
    getDSN: getDSN,
    getProjectName: getProjectName,
    sendEvent: sendEvent
};
