'use strict';

const expect = require('chai').expect;
const proxyQuire = require('proxyquire').noCallThru();

require('app-module-path').addPath(process.cwd() + '/cartridges');

const SentryException = proxyQuire('lib_sentry/cartridge/models/sentryException', {
    'dw/system/System': {
        getInstanceType: () => 0
    },
    'dw/util/UUIDUtils': {
        createUUID: () => 'xxxxxxxxxxxxxXxxxxxxxxxxxx'
    },
    '*/cartridge/scripts/helpers/sentryHelper': {
        getProjectName: () => 'projectid'
    },
    '*/cartridge/config/sentry': {
        'code-version': '5.3.0',
        'sentry-client': {
            name: 'SFRA',
            version: '5.3.0'
        }
    }
});

describe('Model - Sentry Exception', () => {
    before(() => {
        global.request = {
            httpPath: 'httpPath',
            httpHost: 'httpHost'
        };
    });

    it('Should create an empty object if no message is passed', () => {
        const result = new SentryException(null, null, null);

        expect(result).to.be.empty;
    });

    it('Should contain an automatic generated UUID', () => {
        const result = new SentryException(SentryException.LEVEL_INFO, 'My message', SentryException.TYPE_UNKNOWN);

        expect(result.event_id).to.equal('xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx');
    });

    it('Should contain an automatic generated timestamp representing the time now', () => {
        const result = new SentryException(SentryException.LEVEL_INFO, 'My message', SentryException.TYPE_UNKNOWN);

        expect(result.timestamp).to.equal(Date.now() / 1000);
    });

    it('Should contain the platform with the value "javascript"', () => {
        const result = new SentryException(SentryException.LEVEL_INFO, 'My message', SentryException.TYPE_UNKNOWN);

        expect(result.platform).to.equal('javascript');
    });

    it('Should contain the current request URL on which the exception is created', () => {
        const result = new SentryException(SentryException.LEVEL_INFO, 'My message', SentryException.TYPE_UNKNOWN);

        expect(result.transaction).to.equal(request.httpPath);
    });

    it('Should contain the current request host on which the exception is created', () => {
        const result = new SentryException(SentryException.LEVEL_INFO, 'My message', SentryException.TYPE_UNKNOWN);

        expect(result.server_name).to.equal(request.httpHost);
    });

    it('Should contain the release version based on the Sentry config file', () => {
        const result = new SentryException(SentryException.LEVEL_INFO, 'My message', SentryException.TYPE_UNKNOWN);

        expect(result.release).to.equal('projectid@5.3.0');
    });

    it('Should contain the current environment', () => {
        const result = new SentryException(SentryException.LEVEL_INFO, 'My message', SentryException.TYPE_UNKNOWN);

        expect(result.environment).to.equal('development');
    });

    it('Should mark the error as fatal if no level is passed', () => {
        const result = new SentryException(null, 'My message', SentryException.TYPE_UNKNOWN);

        expect(result.level).to.equal(SentryException.LEVEL_FATAL);
    });

    it('Should set the correct error level', () => {
        const result = new SentryException(SentryException.LEVEL_INFO, 'My message', SentryException.TYPE_UNKNOWN);

        expect(result.level).to.equal(SentryException.LEVEL_INFO);
    });

    it('Should set the exception based on the passed parameters', () => {
        const message = 'My message';
        const result = new SentryException(SentryException.LEVEL_INFO, message, SentryException.TYPE_UNKNOWN);

        expect(result.exception).to.deep.equal({
            values: [{
                type: SentryException.TYPE_UNKNOWN,
                value: message
            }]
        });
    });
});
