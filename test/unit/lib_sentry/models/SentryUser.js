'use strict';

const expect = require('chai').expect;
const proxyQuire = require('proxyquire').noCallThru();

require('app-module-path').addPath(process.cwd() + '/cartridges');

var SentryUser = proxyQuire('lib_sentry/cartridge/models/SentryUser', {
    '*/cartridge/scripts/util/collections': {
        map: (collection, callback) => {
            return collection.map(callback);
        }
    }
});

const userIpAddress = '127.0.0.1';
const dummyCustomer = {
    customerGroups: [{
        ID: 'customer_grp1'
    }, {
        ID: 'customer_grp2'
    }]
};

describe('Model - Sentry User', () => {
    it('Should set the correct user ip address', () => {
        const result = new SentryUser(userIpAddress, dummyCustomer);

        expect(result.ip_address).to.equal(userIpAddress);
    });

    it('Should set the correct user customer groups', () => {
        const result = new SentryUser(userIpAddress, dummyCustomer);

        expect(result.customer_groups).to.equal(
            dummyCustomer.customerGroups.map(((customerGroup) => customerGroup.ID)).join(', ')
        );
    });

    it('Should not set the customer number if the customer is not logged in, on the user', () => {
        dummyCustomer.authenticated = false;

        const result = new SentryUser(userIpAddress, dummyCustomer);

        expect(result.id).to.not.exist;
    });

    it('Should set the customer number if the customer is logged in, on the user', () => {
        dummyCustomer.authenticated = true;
        dummyCustomer.profile = {
            customerNo: '1234'
        };

        const result = new SentryUser(userIpAddress, dummyCustomer);

        expect(result.id).to.equal(dummyCustomer.profile.customerNo);
    });
});
