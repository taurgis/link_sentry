'use strict';

const expect = require('chai').expect;
const proxyQuire = require('proxyquire').noCallThru();
const sinon = require('sinon');

require('app-module-path').addPath(process.cwd() + '/cartridges');

var createServiceStub = sinon.stub();

var sentryService = proxyQuire('lib_sentry/cartridge/scripts/services/sentryService', {
    '*/cartridge/config/sentry': { },
    'dw/svc/LocalServiceRegistry': {
        createService: createServiceStub
    },
    'dw/system/Logger': {
        getLogger: () => {}
    }
});

describe('Sentry Service', () => {
    it('should create the service to be called.', () => {
        sentryService.sentryEvent(null, 'dns');

        expect(createServiceStub.calledOnce).to.be.true;
        expect(createServiceStub.calledWith('Sentry')).to.be.true;
    });
});
