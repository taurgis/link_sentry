'use strict';

const expect = require('chai').expect;
const proxyQuire = require('proxyquire').noCallThru();
const sinon = require('sinon');

require('app-module-path').addPath(process.cwd() + '/cartridges');

let Sentry;
const sentryEventStub = sinon.stub();
const sentryOptionsStub = sinon.stub();
const eventProcessorsStub = sinon.stub();
const hasHookStub = sinon.stub();
const callHookStub = sinon.stub();
const sendEventStub = sinon.stub();

describe('Sentry', () => {
    beforeEach(() => {
        sentryEventStub.reset();
        sentryOptionsStub.reset();
        eventProcessorsStub.reset();
        hasHookStub.reset();
        callHookStub.reset();
        sendEventStub.reset();

        Sentry = proxyQuire('lib_sentry/cartridge/scripts/Sentry', {
            '*/cartridge/models/SentryEvent': sentryEventStub,
            '*/cartridge/models/SentryOptions': sentryOptionsStub,
            '*/cartridge/scripts/helpers/sentryHelper': {
                getDSN: () => 'DSN',
                getProjectName: () => 'ProjectID'
            },
            '*/cartridge/config/sentry': require('lib_sentry/cartridge/config/sentry')
        });
    });

    it('Should set initialized to false when calling Sentry.', () => {
        expect(Sentry.initialized).to.be.false;
    });

    it('Should set initialized to true when initializing Sentry.', () => {
        Sentry.init();
        expect(Sentry.initialized).to.be.true;
    });

    it('Should fall back to default options if no options are passed.', () => {
        Sentry.init();

        expect(sentryOptionsStub.calledOnce).to.be.true;
        expect(Sentry.options).to.not.be.null;
    });

    it('Should fall back to default options if no options are passed.', () => {
        const dummyOptions = {
            dsn: 'my_dsn'
        };

        Sentry.init(dummyOptions);

        expect(sentryOptionsStub.calledTwice).to.be.true;
        expect(sentryOptionsStub.calledWithExactly(dummyOptions)).to.be.true;
    });

    describe('SentryEvent - CaptureException', () => {
        beforeEach(() => {
            Sentry = proxyQuire('lib_sentry/cartridge/scripts/Sentry', {
                '*/cartridge/models/SentryEvent': sentryEventStub,
                '*/cartridge/models/SentryOptions': function () {
                    this.getEventProcessors = eventProcessorsStub;
                    this.release = '5.3.0';
                },
                '*/cartridge/scripts/helpers/sentryHelper': {
                    getDSN: () => 'DSN',
                    getProjectName: () => 'ProjectID',
                    sendEvent: sendEventStub
                },
                '*/cartridge/config/sentry': require('lib_sentry/cartridge/config/sentry'),
                'dw/system/HookMgr': {
                    hasHook: hasHookStub,
                    callHook: callHookStub
                }
            });
        });

        it('Should initialize Sentry with the default options if it has not been initialized.', () => {
            eventProcessorsStub.returns([]);
            Sentry.captureException(new Error('My Error'));

            expect(Sentry.initialized).to.be.true;
        });

        it('Should create the sentry event based on the error.', () => {
            eventProcessorsStub.returns([]);
            const dummyError = new Error('My Error');

            Sentry.captureException(dummyError);

            expect(sentryEventStub.calledWith(sinon.match({
                error: dummyError,
                eventType: undefined, // because of the stubbing
                release: '5.3.0',
                level: undefined // because of the stubbing
            }))).to.be.true;

            expect(sendEventStub.calledOnce).to.be.true;
        });

        it('Should process the created event with all registered processors.', () => {
            const dummyProcessor = {
                process: sinon.stub()
            };
            eventProcessorsStub.returns([dummyProcessor]);

            Sentry.captureException(new Error('My Error'));

            expect(dummyProcessor.process.calledOnce).to.be.true;
        });

        it('Should not call the beforeSend hook if no hook has been registered.', () => {
            eventProcessorsStub.returns([]);
            hasHookStub.returns(false);

            Sentry.captureException(new Error('My Error'));

            expect(hasHookStub.calledOnce).to.be.true;
            expect(callHookStub.calledOnce).to.be.false;
        });

        it('Should call the beforeSend hook if a hook has been registered.', () => {
            eventProcessorsStub.returns([]);
            hasHookStub.returns(true);

            Sentry.captureException(new Error('My Error'));

            expect(hasHookStub.calledOnce).to.be.true;
            expect(callHookStub.calledOnce).to.be.true;
        });
    });

    describe('SentryEvent - captureMessage', () => {
        beforeEach(() => {
            Sentry = proxyQuire('lib_sentry/cartridge/scripts/Sentry', {
                '*/cartridge/models/SentryEvent': sentryEventStub,
                '*/cartridge/models/SentryOptions': function () {
                    this.getEventProcessors = eventProcessorsStub;
                    this.release = '5.3.0';
                },
                '*/cartridge/scripts/helpers/sentryHelper': {
                    getDSN: () => 'DSN',
                    getProjectName: () => 'ProjectID',
                    sendEvent: sendEventStub
                },
                '*/cartridge/config/sentry': require('lib_sentry/cartridge/config/sentry'),
                'dw/system/HookMgr': {
                    hasHook: hasHookStub,
                    callHook: callHookStub
                }
            });
        });

        it('Should initialize Sentry with the default options if it has not been initialized.', () => {
            Sentry.captureMessage('My Message');

            expect(Sentry.initialized).to.be.true;
        });

        it('Should create the sentry event based on the error.', () => {
            const dummyMessage = 'My message';

            Sentry.captureMessage(dummyMessage);

            expect(sentryEventStub.calledWith(sinon.match({
                eventType: undefined, // because of the stubbing
                release: '5.3.0',
                message: dummyMessage,
                level: undefined // because of the stubbing
            }))).to.be.true;

            expect(sendEventStub.calledOnce).to.be.true;
        });
    });
});
