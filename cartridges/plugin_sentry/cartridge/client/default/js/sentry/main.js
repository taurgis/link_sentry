'use strict';
const { init } = require('@sentry/browser');

function determineInstanceType () {
    const instanceCode = $('meta[name=sentry-instance]').attr('content');
    const instanceMapping = {
        0: 'development',
        1: 'staging',
        2: 'production'
    };


    if (instanceCode) {
        return instanceMapping[instanceCode];
    }

    return 'unknown';
}

/**
 * Initializes Sentry
 */
function initSentry() {
    const DSN = $('meta[name=sentry-dsn]').attr('content');
    const codeVersion = $('meta[name=sentry-version]').attr('content');

    init({
        dsn: DSN,
        release: codeVersion,
        environment: determineInstanceType()
    });
}

module.exports = {
    init: initSentry
};
