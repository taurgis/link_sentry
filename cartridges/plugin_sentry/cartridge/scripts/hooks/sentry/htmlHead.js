'use strict';

var Logger = require('dw/system/Logger').getLogger('sentry');

/**
 * Adds the Client Side JS for Sentry.
 */
function htmlHead() {
    var { getDSN } = require('*/cartridge/scripts/helpers/sentryHelper');
    var sentryConfig = require('*/cartridge/config/sentry');
    var DSN = getDSN();

    Logger.debug('Sentry :: DSN found with config value: {0}', DSN);

    if (!empty(DSN)) {
        var { renderTemplate } = require('dw/template/ISML');

        renderTemplate('sentry/tag', {
            DSN: DSN,
            codeVersion: sentryConfig['code-version']
        });
    }
}

module.exports = {
    htmlHead: htmlHead
};
