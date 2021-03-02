'use strict';

const expect = require('chai').expect;
const proxyQuire = require('proxyquire').noCallThru();
const sinon = require('sinon');

require('app-module-path').addPath(process.cwd() + '/cartridges');

const cookiesAllowedStub = sinon.stub();
const dummySentryOptions = {
    logger: {
        debug: sinon.stub()
    }
};

var CookieProcessor = proxyQuire('lib_sentry/cartridge/scripts/processors/cookieProcessor', {
    '*/cartridge/scripts/helpers/sentryHelper': {
        getCookiesAllowed: cookiesAllowedStub
    },
    '*/cartridge/models/SentryOptions': {},
    '*/cartridge/models/SentryEvent': {}
});

describe('Processor - Cookie Processor', () => {
    beforeEach(() => {
        cookiesAllowedStub.reset();
        dummySentryOptions.logger.debug.reset();
    });

    it('Should throw an exception if no Sentry Options are passed', () => {
        try {
            new CookieProcessor();
        } catch (e) {
            expect(e.message).to.equal('The sentryOptions is required.');
        }
    });

    it('Should set the Sentry Options', () =>{
        const result = new CookieProcessor(dummySentryOptions);

        expect(result.options).to.equal(dummySentryOptions);
    });

    describe('Process', () => {
        const cookieProcessor = new CookieProcessor(dummySentryOptions);
        let sentryEvent = null;

        before(()=> {
            global.request = {
                httpCookies: [{
                    name: 'header1',
                    value: 'value1'
                }, {
                    name: 'header2',
                    value: 'value2'
                }]
            };

            global.request.httpCookies.cookieCount = 2;
        });

        beforeEach(() => {
            sentryEvent = {
                request: {}
            };
        });

        it('Should not set cookies if it is not allowed.', () => {
            cookiesAllowedStub.returns(false);
            const result = cookieProcessor.process(sentryEvent);

            expect(result.request.cookies).to.not.exist;
            expect(dummySentryOptions.logger.debug.calledOnce).to.be.true;
        });

        it('Should set cookies if it is allowed.', () => {
            cookiesAllowedStub.returns(true);
            const result = cookieProcessor.process(sentryEvent);

            expect(result.request.cookies).to.equal(request.httpCookies.map((cookie) => cookie.name + '=' + cookie.value).join('; ') + '; ');
            expect(dummySentryOptions.logger.debug.calledOnce).to.be.true;
        });
    });
});
