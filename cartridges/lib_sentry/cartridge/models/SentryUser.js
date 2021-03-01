'use strict';

var { map } = require('*/cartridge/scripts/util/collections');

/**
 * Information about the user who triggered an event.
 *
 * @param {string} ipAddress - The IP Address of the customer
 * @param {dw.customer.Customer} customer - The customer object
 * @constructor
 */
function SentryUser(ipAddress, customer) {
    this.ip_address = ipAddress;

    if (customer) {
        this.customer_groups = map(customer.customerGroups, function (customerGroup) {
            return customerGroup.ID;
        }).join(', ');

        if (customer.authenticated) {
            var profile = customer.profile;

            if (profile) {
                this.id = profile.customerNo;
            }
        }
    }
}

module.exports = SentryUser;
