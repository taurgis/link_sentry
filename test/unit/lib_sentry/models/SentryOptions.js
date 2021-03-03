'use strict';

const expect = require('chai').expect;
const proxyQuire = require('proxyquire').noCallThru();
const sinon = require('sinon');

require('app-module-path').addPath(process.cwd() + '/cartridges');

const defaultDSN = 'xxxxxxxxxxxxxXxxxxxxxxxxxx';
const defaultProject = 'project';
const defaultRelease = defaultProject + '@1.0.0';
const loggerSpy = sinon.spy();

var SentryOptions = proxyQuire('lib_sentry/cartridge/models/SentryOptions', {
    '*/cartridge/scripts/processors/duplicateEventProcessor': function () { },
    '*/cartridge/scripts/processors/cookieProcessor': function () { },
    'dw/system/Logger': {
        getLogger: loggerSpy
    }
});

describe('Model - Sentry Options', () => {
    it('Should use the DSN provided in the passed config.', () => {
        const dsn = 'my_dsn';

        var result = new SentryOptions({
            dsn,
            release: defaultRelease
        });

        expect(result.dsn).to.equal(dsn);
    });

    it('Should use the release provided in the passed config.', () => {
        const release = 'my_release';

        var result = new SentryOptions({
            dsn: defaultDSN,
            release
        });

        expect(result.release).to.equal(release);
    });

    it('Should be possible to register a custom event processor.', () => {
        var eventProcessor = sinon.spy();

        var result = new SentryOptions({
            dsn: defaultDSN,
            release: defaultRelease
        });
        result.addEventProcessor(eventProcessor);

        expect(result.eventProcessors).to.be.length(3);
        expect(eventProcessor.calledOnce).to.be.true;
        expect(eventProcessor.calledWith(result)).to.be.true;
    });

    it('Should be possible to get all event processors.', () => {
        var result = new SentryOptions({
            dsn: defaultDSN,
            release: defaultProject
        });

        expect(result.getEventProcessors()).to.be.length(2);
    });

    it('Should be possible to override the logger.', () => {
        var result = new SentryOptions({
            dsn: defaultDSN,
            release: defaultRelease
        });
        var customLogger = {
            debug: function () {}
        };
        result.setLogger(customLogger);

        expect(result.logger).to.equal(customLogger);
    });

    it('Should not be possible to override the logger with something that is not a logger.', () => {
        var result = new SentryOptions({
            dsn: defaultDSN,
            release: defaultRelease
        });
        var customLogger = {};
        result.setLogger(customLogger);

        expect(result.logger).to.not.equal(customLogger);
    });

    it('Should be possible to get the logger.', () => {
        var result = new SentryOptions({
            dsn: defaultDSN,
            release: defaultRelease
        });
        var customLogger = {
            debug: function () {}
        };
        result.setLogger(customLogger);

        expect(result.getLogger()).to.equal(customLogger);
    });
});
