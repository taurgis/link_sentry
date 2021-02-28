'use strict';

const expect = require('chai').expect;
const proxyQuire = require('proxyquire').noCallThru();
const sinon = require('sinon');

require('app-module-path').addPath(process.cwd() + '/cartridges');

const defaultDSN = 'xxxxxxxxxxxxxXxxxxxxxxxxxx';
const defaultProject = 'project';
const loggerSpy = sinon.spy();

var SentryOptions = proxyQuire('lib_sentry/cartridge/models/SentryOptions', {
    '*/cartridge/scripts/helpers/sentryHelper': {
        getDSN: () => defaultDSN,
        getProjectName: () => defaultProject
    },
    '*/cartridge/config/sentry': require('lib_sentry/cartridge/config/sentry'),
    '*/cartridge/scripts/processors/duplicateEventProcessor': function () { },
    'dw/system/Logger': {
        getLogger: loggerSpy
    }
});

describe('Model - Sentry Options', () => {
    it('Should fall back to the default if no options are passed.', () => {
        var result = new SentryOptions();

        expect(result.dsn).to.equal(defaultDSN);
        expect(result.release).to.include(defaultProject);
        expect(result.eventProcessors).to.be.length(1);
        expect(loggerSpy.calledOnce).to.be.true;
        expect(loggerSpy.calledWith('sentry')).to.be.true;
    });

    it('Should use the DSN provided in the passed config.', () => {
        const dsn = 'my_dsn';

        var result = new SentryOptions({
            dsn
        });

        expect(result.dsn).to.equal(dsn);
    });

    it('Should use the release provided in the passed config.', () => {
        const release = 'my_release';

        var result = new SentryOptions({
            release
        });

        expect(result.release).to.equal(release);
    });

    it('Should be possible to register a custom event processor.', () => {
        var eventProcessor = sinon.spy();

        var result = new SentryOptions();
        result.addEventProcessor(eventProcessor);

        expect(result.eventProcessors).to.be.length(2);
        expect(eventProcessor.calledOnce).to.be.true;
        expect(eventProcessor.calledWith(result)).to.be.true;
    });

    it('Should be possible to get all event processors.', () => {
        var result = new SentryOptions();

        expect(result.getEventProcessors()).to.be.length(1);
    });

    it('Should be possible to override the logger.', () => {
        var result = new SentryOptions();
        var customLogger = {
            debug: function() {}
        };
        result.setLogger(customLogger);

        expect(result.logger).to.equal(customLogger);
    });

    it('Should not be possible to override the logger with something that is not a logger.', () => {
        var result = new SentryOptions();
        var customLogger = {};
        result.setLogger(customLogger);

        expect(result.logger).to.not.equal(customLogger);
    });

    it('Should be possible to get the logger.', () => {
        var result = new SentryOptions();
        var customLogger = {
            debug: function() {}
        };
        result.setLogger(customLogger);

        expect(result.getLogger()).to.equal(customLogger);
    });
});
