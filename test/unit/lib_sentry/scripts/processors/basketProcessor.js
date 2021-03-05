'use strict';

const expect = require('chai').expect;
const proxyQuire = require('proxyquire').noCallThru();
const sinon = require('sinon');

require('app-module-path').addPath(process.cwd() + '/cartridges');

const getCurrentBasketStub = sinon.stub();
const dummySentryOptions = {
    logger: {
        debug: sinon.stub()
    }
};

var BasketProcessor = proxyQuire('lib_sentry/cartridge/scripts/processors/basketProcessor', {
    'dw/order/BasketMgr': {
        getCurrentBasket: getCurrentBasketStub
    },
    '*/cartridge/scripts/util/collections': {
        map: (collection, callback) => {
            return collection.map(callback);
        }
    },
    '*/cartridge/models/SentryOptions': {},
    '*/cartridge/models/SentryEvent': {}
});

describe('Processor - Basket Processor', () => {
    beforeEach(() => {
        getCurrentBasketStub.reset();
        dummySentryOptions.logger.debug.reset();
    });

    it('Should throw an exception if no Sentry Options are passed', () => {
        try {
            new BasketProcessor();
        } catch (e) {
            expect(e.message).to.equal('The sentryOptions is required.');
        }
    });

    it('Should set the Sentry Options', () =>{
        const result = new BasketProcessor(dummySentryOptions);

        expect(result.options).to.equal(dummySentryOptions);
    });

    describe('Process', () => {
        const basketProcessor = new BasketProcessor(dummySentryOptions);
        let sentryEvent = {
            user: {}
        };

        it('Should not set basket information if there is no basket.', () => {
            getCurrentBasketStub.returns(null);
            const result = basketProcessor.process(sentryEvent);

            expect(result.user.basket_products).to.not.exist;
            expect(dummySentryOptions.logger.debug.calledOnce).to.be.false;
        });

        it('Should set basket information if there is a basket.', () => {
            const dummyProductLineItems = [{
                productID: '1',
                productName: 'Product 1'
            }, {
                productID: '2',
                productName: 'Product 2'
            }];
            getCurrentBasketStub.returns({
                productLineItems: dummyProductLineItems
            });

            const result = basketProcessor.process(sentryEvent);

            expect(result.user.basket_products).to.equal(
                dummyProductLineItems.map(
                    (productLineItem) => `${productLineItem.productName} (${productLineItem.productID})`
                ).join(', ')
            );
            expect(dummySentryOptions.logger.debug.calledOnce).to.be.true;
        });
    });
});
