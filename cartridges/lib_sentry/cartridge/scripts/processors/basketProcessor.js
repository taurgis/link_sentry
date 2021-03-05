'use strict';

// eslint-disable-next-line no-unused-vars
var SentryOptions = require('*/cartridge/models/SentryOptions');
// eslint-disable-next-line no-unused-vars
var SentryEvent = require('*/cartridge/models/SentryEvent');

/**
 * Processor to add basket information to the user information.
 *
 * Note: This processor servers as an example on how to dynamically extend the event.
 *
 * @param {SentryOptions} options - The options
 * @constructor
 */
function BasketProcessor(options) {
    if (!options) {
        throw new Error('The sentryOptions is required.');
    }

    this.options = options;
}

/**
 * Processes the event.
 *
 * @param {SentryEvent} sentryEvent - The event to process
 *
 * @returns {SentryEvent} - The processed event
 */
BasketProcessor.prototype.process = function (sentryEvent) {
    var { getCurrentBasket } = require('dw/order/BasketMgr');
    var currentBasket = getCurrentBasket();
    var currentSentryEvent = sentryEvent;

    if (currentBasket && currentSentryEvent && currentSentryEvent.user) {
        var { map } = require('*/cartridge/scripts/util/collections');

        this.options.logger.debug('Sentry :: Setting basket information on event.');

        currentSentryEvent.user.basket_products = map(currentBasket.productLineItems, function (productLineItem) {
            return productLineItem.productName + ' (' + productLineItem.productID + ')';
        }).join(', ');
    }

    return currentSentryEvent;
};

module.exports = BasketProcessor;
