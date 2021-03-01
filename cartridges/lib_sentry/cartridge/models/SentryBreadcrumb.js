'use strict';

var { forEach } = require('*/cartridge/scripts/util/collections');

/**
 * Series of application events based on the user who triggered the event.
 *
 * @param {dw.system.Request} request - The HTTP request
 * @constructor
 */
function SentryBreadcrumb(request) {
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

    this.values = values;
}

module.exports = SentryBreadcrumb;
