'use strict';

const expect = require('chai').expect;
const proxyQuire = require('proxyquire').noCallThru();

require('app-module-path').addPath(process.cwd() + '/cartridges');

const SentryEvent = proxyQuire('lib_sentry/cartridge/models/SentryEvent', {
    'dw/system/System': {
        getInstanceType: () => 0
    },
    '*/cartridge/models/SentryId': proxyQuire('lib_sentry/cartridge/models/SentryId', {
        'dw/util/UUIDUtils': {
            createUUID: () => 'xxxxxxxxxxxxxXxxxxxxxxxxxx'
        }
    }),
    '*/cartridge/models/SentryUser': proxyQuire('lib_sentry/cartridge/models/SentryUser', {
        '*/cartridge/scripts/util/collections': {
            map: (collection, callback) => {
                return collection.map(callback);
            }
        }
    }),
    '*/cartridge/models/SentryRequest': proxyQuire('lib_sentry/cartridge/models/SentryRequest', {
        '*/cartridge/scripts/util/collections': {
            forEach: (collection, callback) => {
                collection.forEach(callback);
            }
        }
    }),
    '*/cartridge/models/SentryBreadcrumb': proxyQuire('lib_sentry/cartridge/models/SentryBreadcrumb', {
        '*/cartridge/scripts/util/collections': {
            forEach: (collection, callback) => {
                collection.forEach(callback);
            }
        }
    })
});

describe('Model - Sentry Event', () => {
    before(() => {
        global.request = {
            httpPath: 'httpPath',
            httpHost: 'httpHost',
            httpMethod: 'POST',
            httpQueryString: 'test=value',
            httpRemoteAddress: '127.0.0°.1',
            httpHeaders: {
                keySet: () => ['header1', 'header2'],
                values: {
                    header1: 'headervalue1',
                    header2: 'headervalue2'
                },
                get: (key) => request.httpHeaders.values[key]
            },
            httpURL: 'httpURL',
            httpCookies: [{
                name: 'cookie1',
                value: 'value1'
            }, {
                name: 'cookie2',
                value: 'value2'
            }],
            session: {
                customer: {
                    customerGroups: [{
                        ID: 'customer_grp1'
                    }, {
                        ID: 'customer_grp2'
                    }]
                },
                clickStream: {
                    enabled: false
                }
            }
        };

        global.request.httpCookies.cookieCount = 2;
    });

    it('Should create an empty object if no parameter is passed', () => {
        const result = new SentryEvent();

        expect(result).to.be.empty;
    });

    it('Should create an empty object if no message is passed', () => {
        const result = new SentryEvent({
            release: 'project@version1'
        });

        expect(result).to.be.empty;
    });

    it('Should create an empty object if no release is passed', () => {
        const result = new SentryEvent({
            message: 'My message'
        });

        expect(result).to.be.empty;
    });

    it('Should contain an automatic generated UUID', () => {
        const result = new SentryEvent({
            error: new Error('My message'),
            release: 'project@version1'
        });

        expect(result.event_id).to.equal('xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx');
    });

    it('Should contain an automatic generated timestamp representing the time now', () => {
        const result = new SentryEvent({
            error: new Error('My message'),
            release: 'project@version1'
        });

        expect(result.timestamp).to.equal(Math.round(Date.now() / 1000));
    });

    it('Should contain the platform with the value "javascript"', () => {
        const result = new SentryEvent({
            error: new Error('My message'),
            release: 'project@version1'
        });

        expect(result.platform).to.equal('javascript');
    });

    it('Should contain the current request URL on which the exception is created', () => {
        const result = new SentryEvent({
            error: new Error('My message'),
            release: 'project@version1'
        });

        expect(result.transaction).to.equal(request.httpPath);
    });

    it('Should contain the current request host on which the exception is created', () => {
        const result = new SentryEvent({
            error: new Error('My message'),
            release: 'project@version1'
        });

        expect(result.server_name).to.equal(request.httpHost);
    });

    it('Should contain the release version based on the Sentry config file', () => {
        const projectId = 'project@version1';
        const result = new SentryEvent({
            error: new Error('My message'),
            release: projectId
        });

        expect(result.release).to.equal(projectId);
    });

    it('Should contain the current environment', () => {
        const result = new SentryEvent({
            error: new Error('My message'),
            release: 'project@version1'
        });

        expect(result.environment).to.equal('development');
    });

    it('Should mark the error as fatal if no level is passed', () => {
        const result = new SentryEvent({
            error: new Error('My message'),
            release: 'project@version1'
        });

        expect(result.level).to.equal(SentryEvent.LEVEL_FATAL);
    });

    it('Should set the correct error level', () => {
        const result = new SentryEvent({
            error: new Error('My message'),
            release: 'project@version1',
            level: SentryEvent.LEVEL_INFO
        });

        expect(result.level).to.equal(SentryEvent.LEVEL_INFO);
    });

    it('Should set the exception based on the passed parameters', () => {
        const error = new Error('My message');
        const result = new SentryEvent({
            error: error,
            release: 'project@version1',
            type: SentryEvent.ERROR_TYPE_UNKNOWN,
            eventType: SentryEvent.TYPE_EXCEPTION
        });

        expect(result.exception).to.deep.equal({
            values: [{
                type: 'Error',
                value: error.message + '\n' + error.stack
            }]
        });
    });

    describe('Model - Sentry Event - Request', () => {
        it('Should set the correct request method', () => {
            const result = new SentryEvent({
                error: new Error('My message'),
                release: 'project@version1',
                level: SentryEvent.LEVEL_INFO
            });

            expect(result.request.method).to.equal(request.httpMethod);
        });

        it('Should set the correct request URL', () => {
            const result = new SentryEvent({
                error: new Error('My message'),
                release: 'project@version1',
                level: SentryEvent.LEVEL_INFO
            });

            expect(result.request.url).to.equal(request.httpURL);
        });

        it('Should set the correct request query string', () => {
            const result = new SentryEvent({
                error: new Error('My message'),
                release: 'project@version1',
                level: SentryEvent.LEVEL_INFO
            });

            expect(result.request.query_string).to.equal(request.httpQueryString);
        });

        it('Should set the correct request cookies', () => {
            const result = new SentryEvent({
                error: new Error('My message'),
                release: 'project@version1',
                level: SentryEvent.LEVEL_INFO
            });

            expect(result.request.cookies).to.equal(
                request.httpCookies.map((cookie) => cookie.name + '=' + cookie.value).join('; ') + '; '
            );
        });

        it('Should set the correct request environment', () => {
            const result = new SentryEvent({
                error: new Error('My message'),
                release: 'project@version1',
                level: SentryEvent.LEVEL_INFO
            });

            expect(result.request.env.REMOTE_ADDR).to.equal(request.httpRemoteAddress);
        });

        it('Should set the correct request headers', () => {
            const result = new SentryEvent({
                error: new Error('My message'),
                release: 'project@version1',
                level: SentryEvent.LEVEL_INFO
            });

            expect(result.request.headers).to.deep.equal({
                header1: 'headervalue1',
                header2: 'headervalue2'
            });
        });
    });

    describe('Model - Sentry Event - User', () => {
        it('Should set the correct user ip address', () => {
            const result = new SentryEvent({
                error: new Error('My message'),
                release: 'project@version1',
                level: SentryEvent.LEVEL_INFO
            });

            expect(result.user.ip_address).to.equal(request.httpRemoteAddress);
        });

        it('Should set the correct user customer groups', () => {
            const result = new SentryEvent({
                error: new Error('My message'),
                release: 'project@version1',
                level: SentryEvent.LEVEL_INFO
            });

            expect(result.user.customer_groups).to.equal(
                request.session.customer.customerGroups.map(((customerGroup) => customerGroup.ID)).join(', ')
            );
        });

        it('Should not set the customer number if the customer is not logged in, on the user', () => {
            request.session.customer.authenticated = false;

            const result = new SentryEvent({
                error: new Error('My message'),
                release: 'project@version1',
                level: SentryEvent.LEVEL_INFO
            });

            expect(result.user.id).to.not.exist;
        });

        it('Should set the customer number if the customer is logged in, on the user', () => {
            request.session.customer.authenticated = true;
            request.session.customer.profile = {
                customerNo: '1234'
            };

            const result = new SentryEvent({
                error: new Error('My message'),
                release: 'project@version1',
                level: SentryEvent.LEVEL_INFO
            });

            expect(result.user.id).to.equal(request.session.customer.profile.customerNo);
        });
    });

    describe('Model - Sentry Event - Breadcrumb', () => {
        it('Should not set breadcrumbs when there is no click stream', () => {
            const result = new SentryEvent({
                error: new Error('My message'),
                release: 'project@version1',
                level: SentryEvent.LEVEL_INFO
            });

            expect(result.breadcrumbs.values).to.be.be.length(0);
        });

        it('Should set breadcrumbs when there is a click stream', () => {
            request.session.clickStream = {
                enabled: true,
                clicks: [{
                    url: 'my-url',
                    timestamp: Date.now()
                }]
            };

            const result = new SentryEvent({
                error: new Error('My message'),
                release: 'project@version1',
                level: SentryEvent.LEVEL_INFO
            });

            expect(result.breadcrumbs.values).to.be.be.length(1);
            expect(result.breadcrumbs.values).to.deep.equal([{
                data: {
                    from: null,
                    to: 'my-url'
                },
                type: 'navigation',
                timestamp: Math.round(Date.now() / 1000)
            }]);
        });
    });
});
