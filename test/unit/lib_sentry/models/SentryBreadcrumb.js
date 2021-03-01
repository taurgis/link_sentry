'use strict';

const expect = require('chai').expect;
const proxyQuire = require('proxyquire').noCallThru();

require('app-module-path').addPath(process.cwd() + '/cartridges');

var SentryBreadcrumb = proxyQuire('lib_sentry/cartridge/models/SentryBreadcrumb', {
    '*/cartridge/scripts/util/collections': {
        forEach: (collection, callback) => {
            collection.forEach(callback);
        }
    }
});

describe('Model - Sentry Breadcrumb', () => {
    it('Should be empty if no parameters are passed.', () => {
        const result = new SentryBreadcrumb(null);

        expect(result).to.be.be.empty;
    });

    it('Should not set breadcrumbs when there is no click stream.', () => {
        var dummyRequest = {
            session: {
                clickStream: {
                    enabled: false
                }
            }
        };

        const result = new SentryBreadcrumb(dummyRequest);

        expect(result.values).to.be.be.length(0);
    });

    it('Should set breadcrumbs when there is a click stream', () => {
        var dummyRequest = {
            session: {
                clickStream: {
                    enabled: true,
                    clicks: [{
                        url: 'my-url',
                        timestamp: Date.now()
                    }]
                }
            }
        };

        const result = new SentryBreadcrumb(dummyRequest);

        expect(result.values).to.be.be.length(1);
        expect(result.values).to.deep.equal([{
            data: {
                from: null,
                to: 'my-url'
            },
            type: 'navigation',
            timestamp: Math.round(Date.now() / 1000)
        }]);
    });
});
