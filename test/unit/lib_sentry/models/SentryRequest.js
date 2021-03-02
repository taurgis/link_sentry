'use strict';

const expect = require('chai').expect;
const proxyQuire = require('proxyquire').noCallThru();

require('app-module-path').addPath(process.cwd() + '/cartridges');

var SentryRequest = proxyQuire('lib_sentry/cartridge/models/SentryRequest', {
    '*/cartridge/scripts/util/collections': {
        forEach: (collection, callback) => {
            collection.forEach(callback);
        }
    }
});

describe('Model - Sentry Request', () => {
    let dummyRequest = {};

    beforeEach(() => {
        dummyRequest = {
            httpMethod: 'POST',
            httpURL: 'https://127.0.0.1',
            httpQueryString: 'test1=value1&test2=value2',
            httpRemoteAddress: '127.0.0.1'
        };
    });

    it('Should create an empty object if no parameter is passed.', () => {
        const result = new SentryRequest();

        expect(result).to.be.empty;
    });

    it('Should set the request method.', () => {
        const result = new SentryRequest(dummyRequest);

        expect(result.method).to.equal(dummyRequest.httpMethod);
    });

    it('Should set the request url.', () => {
        const result = new SentryRequest(dummyRequest);

        expect(result.url).to.equal(dummyRequest.httpURL);
    });

    it('Should set the request query string.', () => {
        const result = new SentryRequest(dummyRequest);

        expect(result.query_string).to.equal(dummyRequest.httpQueryString);
    });

    it('Should set the remote address.', () => {
        const result = new SentryRequest(dummyRequest);

        expect(result.env.REMOTE_ADDR).to.equal(dummyRequest.httpRemoteAddress);
    });

    it('Should not set the request headers if they are not present.', () => {
        const result = new SentryRequest(dummyRequest);

        expect(result.headers).to.be.empty;
    });

    it('Should set present headers.', () => {
        dummyRequest.httpHeaders = {
            keySet: () => ['header1', 'header2'],
            values: {
                header1: 'headervalue1',
                header2: 'headervalue2'
            },
            get: (key) => dummyRequest.httpHeaders.values[key]
        };

        const result = new SentryRequest(dummyRequest);

        expect(result.headers).to.deep.equal({
            header1: 'headervalue1',
            header2: 'headervalue2'
        });
    });
});
