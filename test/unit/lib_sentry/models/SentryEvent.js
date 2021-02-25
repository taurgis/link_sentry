'use strict';

const expect = require('chai').expect;
const proxyQuire = require('proxyquire').noCallThru();

require('app-module-path').addPath(process.cwd() + '/cartridges');

const SentryEvent = proxyQuire('lib_sentry/cartridge/models/SentryEvent', {
    'dw/system/System': {
        getInstanceType: () => 0
    },
    'dw/util/UUIDUtils': {
        createUUID: () => 'xxxxxxxxxxxxxXxxxxxxxxxxxx'
    }
});

describe('Model - Sentry Event', () => {
    before(() => {
        global.request = {
            httpPath: 'httpPath',
            httpHost: 'httpHost'
        };
    });

    it('Should create an empty object if no message is passed', () => {
        const result = new SentryEvent();

        expect(result).to.be.empty;
    });

    it('Should contain an automatic generated UUID', () => {
        const result = new SentryEvent({
            message: 'My message',
            release: 'project@version1'
        });

        expect(result.event_id).to.equal('xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx');
    });

    it('Should contain an automatic generated timestamp representing the time now', () => {
        const result = new SentryEvent({
            message: 'My message',
            release: 'project@version1'
        });

        expect(result.timestamp).to.equal(Math.round(Date.now() / 1000));
    });

    it('Should contain the platform with the value "javascript"', () => {
        const result = new SentryEvent({
            message: 'My message',
            release: 'project@version1'
        });

        expect(result.platform).to.equal('javascript');
    });

    it('Should contain the current request URL on which the exception is created', () => {
        const result = new SentryEvent({
            message: 'My message',
            release: 'project@version1'
        });

        expect(result.transaction).to.equal(request.httpPath);
    });

    it('Should contain the current request host on which the exception is created', () => {
        const result = new SentryEvent({
            message: 'My message',
            release: 'project@version1'
        });

        expect(result.server_name).to.equal(request.httpHost);
    });

    it('Should contain the release version based on the Sentry config file', () => {
        const projectId = 'project@version1';
        const result = new SentryEvent({
            message: 'My message',
            release: projectId
        });

        expect(result.release).to.equal(projectId);
    });

    it('Should contain the current environment', () => {
        const result = new SentryEvent({
            message: 'My message',
            release: 'project@version1'
        });

        expect(result.environment).to.equal('development');
    });

    it('Should mark the error as fatal if no level is passed', () => {
        const result = new SentryEvent({
            message: 'My message',
            release: 'project@version1'
        });

        expect(result.level).to.equal(SentryEvent.LEVEL_FATAL);
    });

    it('Should set the correct error level', () => {
        const result = new SentryEvent({
            message: 'My message',
            release: 'project@version1',
            level: SentryEvent.LEVEL_INFO
        });

        expect(result.level).to.equal(SentryEvent.LEVEL_INFO);
    });

    it('Should set the exception based on the passed parameters', () => {
        const message = 'My message';
        const result = new SentryEvent({
            message: message,
            release: 'project@version1',
            type: SentryEvent.ERROR_TYPE_UNKNOWN,
            eventType: SentryEvent.TYPE_EXCEPTION
        });

        expect(result.exception).to.deep.equal({
            values: [{
                type: SentryEvent.ERROR_TYPE_UNKNOWN,
                value: message
            }]
        });
    });
});
