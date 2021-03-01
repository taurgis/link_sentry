'use strict';

const expect = require('chai').expect;
const proxyQuire = require('proxyquire').noCallThru();
const sinon = require('sinon');

require('app-module-path').addPath(process.cwd() + '/cartridges');

const dummySentryOptions = {
    logger: {
        debug: sinon.stub()
    }
};

const getCacheStub = sinon.stub();
const putCacheStub = sinon.stub();
const bytesStub = sinon.stub();

var DuplicateEventProcessor = proxyQuire('lib_sentry/cartridge/scripts/processors/duplicateEventProcessor', {
    '*/cartridge/models/SentryOptions': {},
    '*/cartridge/models/SentryEvent': {},
    'dw/system/CacheMgr': {
        getCache: function () {
            return {
                get: getCacheStub,
                put: putCacheStub
            };
        }
    },
    'dw/util/Bytes': bytesStub,
    'dw/crypto/MessageDigest': function () {
        this.digestBytes = function () {
            return 'DIGEST';
        };
    },
    'dw/crypto/Encoding': {
        toHex: () => 'HEX VALUE'
    }
});

describe('Processor - Duplicate Event Processor', () => {
    beforeEach(() => {
        dummySentryOptions.logger.debug.reset();
        getCacheStub.reset();
        putCacheStub.reset();
    });

    it('Should throw an exception if no Sentry Options are passed', () => {
        try {
            new DuplicateEventProcessor();
        } catch (e) {
            expect(e.message).to.equal('The sentryOptions is required.');
        }
    });

    it('Should set the Sentry Options', () =>{
        const result = new DuplicateEventProcessor(dummySentryOptions);

        expect(result.options).to.equal(dummySentryOptions);
    });

    describe('Process', () => {
        let sentryEvent = null;
        const duplicateEventProcessor = new DuplicateEventProcessor(dummySentryOptions);

        before(() => {
            global.request = {
                session: {
                    sessionID: 'MY_ID'
                }
            };
        });

        beforeEach(() => {
            sentryEvent = {
                error: new Error('dummy error')
            };
        });

        it('Should do nothing if the Sentry Event has no error.', () =>{
            delete sentryEvent.error;

            const result = duplicateEventProcessor.process(sentryEvent);

            expect(getCacheStub.notCalled).to.be.true;
            expect(putCacheStub.notCalled).to.be.true;
            expect(result).to.equal(sentryEvent);
        });

        it('Should store a event in the cache to prevent duplicate calls for that session.', () =>{
            duplicateEventProcessor.process(sentryEvent);

            expect(getCacheStub.called).to.be.true;
            expect(putCacheStub.called).to.be.true;
            expect(bytesStub.calledWith(
                request.session.sessionID + sentryEvent.error.message + sentryEvent.error.stack
            )).to.be.true;
            expect(putCacheStub.calledWith('HEX VALUE')).to.be.true;
        });
    });
});
