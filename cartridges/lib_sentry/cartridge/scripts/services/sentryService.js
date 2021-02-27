'use strict';

var Logger = require('dw/system/Logger').getLogger('sentry');
var DSN_REGEX = 'https://(.+)@.+/(.+)';

/**
 * Creates the service to add a new Sentry event.
 *
 * @param {Object} sentryEvent - The exception to post to Sentry
 * @param {string} dsn - The DSN to call
 * @return {dw.svc.Service} - The service
 */
function sentryEventService(sentryEvent, dsn) {
    var { createService } = require('dw/svc/LocalServiceRegistry');
    var sentryConfig = require('*/cartridge/config/sentry');

    return createService('Sentry', {
        createRequest: function (svc) {
            var splitDSN = dsn.match(DSN_REGEX);
            var key = splitDSN[1];
            var projectID = splitDSN[2];
            var url = dsn.replace(projectID, '') + 'api/' + projectID + '/store/';

            svc.addHeader('X-Sentry-Auth', 'Sentry sentry_version=7,sentry_key= '
                + key + ',sentry_client=' + sentryConfig['sentry-client'].name + '/' + sentryConfig['sentry-client'].version
                + ',sentry_timestamp=' + sentryEvent.timeStamp);

            svc.setRequestMethod('POST');
            svc.setURL(url);

            return JSON.stringify(sentryEvent);
        },
        parseResponse: function (svc, client) {
            try {
                if (client.statusCode === 200) {
                    Logger.debug('Sentry :: Sentry successfully processed our request.');

                    return JSON.parse(client.text).id;
                }
            } catch (e) {
                Logger.error(e);
            }

            return null;
        },
        mockCall: function () {
            if (sentryEvent.exception.values[0].value === 'retry_header') {
                return {
                    statusCode: 429,
                    statusMessage: 'Maintenance',
                    responseHeaders: {
                        'Retry-After': 1000
                    },
                    text: JSON.stringify({
                        id: 'fd6d8c0c43fc4630ad850ee518f1b9d0'
                    }),
                    errorText: 'Maintenance'
                };
            }

            return {
                statusCode: 200,
                statusMessage: 'Success',
                text: JSON.stringify({
                    id: 'fd6d8c0c43fc4630ad850ee518f1b9d0'
                })
            };
        }
    });
}

module.exports = {
    sentryEvent: sentryEventService
};
