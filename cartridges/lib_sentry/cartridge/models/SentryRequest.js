'use strict';

var { forEach } = require('*/cartridge/scripts/util/collections');

/**
 * Gets the cookies from the HTTP request
 *
 * @param {dw.system.Request} request - The HTTP request
 * @return {string} - The cookies as a string separated by ;
 */
function getCookies(request) {
    var cookies = '';

    if (request.httpCookies) {
        // eslint-disable-next-line no-plusplus
        for (var i = 0; i < request.httpCookies.cookieCount; i++) {
            var currentCookie = request.httpCookies[i];

            cookies += currentCookie.name + '=' + currentCookie.value + '; ';
        }
    }
    return cookies;
}

/**
 * Gets the headers from the HTTP request
 *
 * @param {dw.system.Request} request - The HTTP request
 * @return {Object} - The headers as an object (key - value)
 */
function getHeaders(request) {
    var headers = {};

    if (request.httpHeaders) {
        forEach(request.httpHeaders.keySet(), function (httpHeader) {
            headers[httpHeader] = request.httpHeaders.get(httpHeader);
        });
    }
    return headers;
}

/**
 * Http request information.
 *
 * The Request interface contains information on a HTTP request related to the event.
 *
 * @param {dw.system.Request} request - The HTTP request
 * @constructor
 */
function SentryRequest(request) {
    if (!request) {
        return null;
    }

    this.method = request.httpMethod;
    this.url = request.httpURL.toString();
    this.query_string = request.httpQueryString;
    this.cookies = getCookies(request);
    this.env = {
        REMOTE_ADDR: request.httpRemoteAddress
    };

    this.headers = getHeaders(request);
}

module.exports = SentryRequest;