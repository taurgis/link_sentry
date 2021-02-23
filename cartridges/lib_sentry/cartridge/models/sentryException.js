'use strict';

var VALID_LEVELS = ['fatal',
    'error',
    'warning',
    'info',
    'debug'];

var ENVIRONMENT_MAPPING = {
    0: 'development',
    1: 'staging',
    2: 'production'
};

/**
 * The model representing a Sentry Exception to be posted to the Sentry API.
 *
 * @param {string} level - The error severity.
 * @param {string} stackTrace - The exception
 * @param {string} type - The error type
 *
 * @constructor
 */
function SentryException(level, stackTrace, type) {
    var { getInstanceType } = require('dw/system/System');
    var { createUUID } = require('dw/util/UUIDUtils');
    var { getProjectName } = require('*/cartridge/scripts/helpers/sentryHelper');
    var sentryConfig = require('*/cartridge/config/sentry');

    this.event_id = (createUUID() + createUUID()).substring(0, 32).toLowerCase();
    this.timestamp = Date.now() / 1000;
    this.platform = 'javascript';
    this.transaction = request.httpPath;
    this.server_name = request.httpHost;
    this.release = getProjectName() + '@' + sentryConfig['code-version'];
    this.environment = ENVIRONMENT_MAPPING[getInstanceType().valueOf()];

    if (level && VALID_LEVELS.indexOf(level) >= 0) {
        this.level = level;
    }

    this.exception = {
        values: [{
            type: type,
            value: stackTrace
        }]
    };
}

SentryException.LEVEL_FATAL = 'fatal';
SentryException.LEVEL_ERROR = 'error';
SentryException.LEVEL_WARNING = 'warning';
SentryException.LEVEL_INFO = 'info';
SentryException.LEVEL_DEBUG = 'debug';
SentryException.TYPE_UNKNOWN = 'unknown_error';
SentryException.SYNTAX_ERROR = 'SyntaxError';
SentryException.TYPE_SECURITY_VIOLATION = 'security_violation';

module.exports = SentryException;
