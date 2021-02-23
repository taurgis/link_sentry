'use strict';

var DSN_REGEX = 'https://(.+)@.+/(.+)';

/**
 * Creates the service to add a new Sentry event.
 *
 * @param {Object} sentryException - The exception to post to Sentry
 *
 * @return {dw.svc.Service} - The service
 */
function sentryEvent(sentryException) {
    var { createService } = require('dw/svc/LocalServiceRegistry');
    var { getDSN } = require('*/cartridge/scripts/helpers/sentryHelper');
    var sentryConfig = require('*/cartridge/config/sentry');

    return createService('Sentry', {
        createRequest: function (svc) {
            var splitDSN = getDSN().match(DSN_REGEX);
            var key = splitDSN[1];
            var projectID = splitDSN[2];
            var url = getDSN().replace(projectID, '') + 'api/' + projectID + '/store/';

            svc.addHeader('X-Sentry-Auth', 'Sentry sentry_version=7,sentry_key= '
                + key + ',sentry_client=' + sentryConfig['sentry-client'].name + '/' + sentryConfig['sentry-client'].version
                + ',sentry_timestamp=' + sentryException.timeStamp);

            svc.setRequestMethod('POST');
            svc.setURL(url);

            return JSON.stringify(sentryException);
        },
        parseResponse: function (svc, client) {
            if (client.statusCode === 200) {
                return true;
            }

            return false;
        },
        mockCall: function () {
            return JSON.stringify({
                id: 'fd6d8c0c43fc4630ad850ee518f1b9d0'
            });
        }
    });
}

module.exports = {
    sentryEvent: sentryEvent
};
