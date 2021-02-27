'use strict';

var { forEach } = require('*/cartridge/scripts/util/collections');

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
 * Gets the user click stream to send to Sentry.
 *
 * @return {{values: []}|null} - The breadcrumb path
 */
function getBreadcrumbsPayload() {
    if (!request || !request.session) {
        return null;
    }

    var clickStream = request.session.clickStream;
    var values = [];

    if (clickStream.enabled) {
        var previousClick;

        forEach(clickStream.clicks, function (click) {
            values.push({
                timestamp: Math.round(click.timestamp / 1000),
                type: 'navigation',
                data: {
                    from: previousClick ? previousClick.url : null,
                    to: click.url
                }
            });

            previousClick = click;
        });
    }

    return {
        values: values
    };
}

/**
 * The model representing a Sentry Exception to be posted to the Sentry API.
 *
 * @param {Object} data - The event data
 * @param {number} data.eventType - The event type
 * @param {string} data.level - The error severity.
 * @param {string} data.message - The exception
 * @param {string} data.type - The error type
 * @param {string} data.release - The release version
 *
 * @constructor
 */
function SentryEvent(data) {
    // If any of these are missing, don't try to create a Sentry Event object
    if (!data || !data.message || !data.release) {
        return;
    }

    var { getInstanceType } = require('dw/system/System');
    var SentryId = require('*/cartridge/models/SentryId');
    var SentryUser = require('*/cartridge/models/SentryUser');
    var SentryRequest = require('*/cartridge/models/SentryRequest');

    this.event_id = new SentryId(null).toString();
    this.timestamp = Math.round(Date.now() / 1000);
    this.platform = 'javascript';
    this.transaction = request.httpPath;
    this.server_name = request.httpHost;
    this.release = data.release;
    this.environment = ENVIRONMENT_MAPPING[getInstanceType().valueOf()];

    if (data.level && VALID_LEVELS.indexOf(data.level) >= 0) {
        this.level = data.level;
    } else {
        this.level = SentryEvent.LEVEL_FATAL;
    }

    if (data.eventType === SentryEvent.TYPE_EXCEPTION) {
        this.exception = {
            values: [{
                type: data.type,
                value: data.message
            }]
        };
    } else {
        this.message = {
            message: data.message
        };
    }

    this.user = new SentryUser(request.httpRemoteAddress, request.session.customer);
    this.request = new SentryRequest(request);
    this.breadcrumbs = getBreadcrumbsPayload();
}

SentryEvent.LEVEL_FATAL = 'fatal';
SentryEvent.LEVEL_ERROR = 'error';
SentryEvent.LEVEL_WARNING = 'warning';
SentryEvent.LEVEL_INFO = 'info';
SentryEvent.LEVEL_DEBUG = 'debug';
SentryEvent.ERROR_TYPE_UNKNOWN = 'unknown_error';
SentryEvent.ERROR_TYPE_SYNTAX_ERROR = 'SyntaxError';
SentryEvent.ERROR_TYPE_TYPE_SECURITY_VIOLATION = 'security_violation';
SentryEvent.TYPE_EXCEPTION = 0;
SentryEvent.TYPE_MESSAGE = 1;

module.exports = SentryEvent;
