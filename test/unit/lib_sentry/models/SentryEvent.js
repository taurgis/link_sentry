'use strict';

const expect = require('chai').expect;
const proxyQuire = require('proxyquire').noCallThru();
const sinon = require('sinon');

require('app-module-path').addPath(process.cwd() + '/cartridges');

const breadcrumbsStub = sinon.stub();
const userStub = sinon.stub();

const SentryEvent = proxyQuire('lib_sentry/cartridge/models/SentryEvent', {
    'dw/system/System': {
        getInstanceType: () => 0
    },
    '*/cartridge/models/SentryId': proxyQuire('lib_sentry/cartridge/models/SentryId', {
        'dw/util/UUIDUtils': {
            createUUID: () => 'xxxxxxxxxxxxxXxxxxxxxxxxxx'
        }
    }),
    '*/cartridge/models/SentryUser': userStub,
    '*/cartridge/models/SentryRequest': proxyQuire('lib_sentry/cartridge/models/SentryRequest', {
        '*/cartridge/scripts/util/collections': {
            forEach: (collection, callback) => {
                collection.forEach(callback);
            }
        }
    }),
    '*/cartridge/models/SentryBreadcrumb': breadcrumbsStub
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
                customer: {}
            }
        };

        global.request.httpCookies.cookieCount = 2;
    });

    beforeEach(() => {
        breadcrumbsStub.reset();
        userStub.reset();
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

    it('Should generate breadcrumbs.', () => {
        new SentryEvent({
            error: new Error('My message'),
            release: 'project@version1',
            level: SentryEvent.LEVEL_INFO
        });

        expect(breadcrumbsStub.calledOnce).to.be.true;
        expect(breadcrumbsStub.calledWith(request)).to.be.true;
    });

    it('Should generate user info.', () => {
        new SentryEvent({
            error: new Error('My message'),
            release: 'project@version1',
            level: SentryEvent.LEVEL_INFO
        });

        expect(userStub.calledOnce).to.be.true;
        expect(userStub.calledWith(request.httpRemoteAddress, request.session.customer)).to.be.true;
    });

    describe('Model - Sentry Event - Request', () => {
        it('Should set the correct request method.', () => {
            const result = new SentryEvent({
                error: new Error('My message'),
                release: 'project@version1',
                level: SentryEvent.LEVEL_INFO
            });

            expect(result.request.method).to.equal(request.httpMethod);
        });

        it('Should set the correct request URL.', () => {
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
});
