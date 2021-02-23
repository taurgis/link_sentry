'use strict';

var Logger = require('dw/system/Logger').getLogger('sentry');
var DSN_PREFERENCE = 'sentryDSN';
var PROJECT_NAME_PREFERENCE = 'sentryProjectID';

/**
 * Gets the Public Key (DSN) URL from the Site Preference. First try to fetch it from
 * the cache, if it is not in there get it from the preference and store it.
 *
 * @return {string} - The DSN URL
 */
function getDSN() {
    var configCache = require('dw/system/CacheMgr').getCache('sentryConfig');

    Logger.debug('Sentry :: Fetching DSN.');

    return configCache.get('DSN', function () {
        var currentSite = require('dw/system/Site').getCurrent();

        Logger.debug('Sentry :: Fetching DSN from the Site Preference.')

        return currentSite.getCustomPreferenceValue(DSN_PREFERENCE);
    });
}

/**
 * Gets the project ID for Sentry. First try to fetch it from
 * the cache, if it is not in there get it from the preference and store it.
 *
 * @return {string} - The project ID
 */
function getProjectName() {
    var configCache = require('dw/system/CacheMgr').getCache('sentryConfig');

    Logger.debug('Sentry :: Fetching Project Name.');

    return configCache.get('projectName', function () {
        var currentSite = require('dw/system/Site').getCurrent();

        Logger.debug('Sentry :: Fetching Project Name from the Site Preference.')

        return currentSite.getCustomPreferenceValue(PROJECT_NAME_PREFERENCE);
    });
}

/**
 * Logs an exception in sentry
 * @param {string} message - The log message you want to appear in Sentry (e.g. Stacktrace)
 * @param {string} severity - The severity of the error
 * @param  {string} type - The type of error
 */
function logException(message, severity, type) {
    if (!empty(message)) {
        var SentryException = require('*/cartridge/models/sentryException');
        var sentryService = require('*/cartridge/scripts/services/sentryService');
        var sentryException = new SentryException(severity, message, type);

        sentryService.sentryEvent(sentryException).call();
    }
}

module.exports = {
    getDSN: getDSN,
    getProjectName: getProjectName,
    logException: logException
};
