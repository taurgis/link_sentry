'use strict';

const expect = require('chai').expect;
const proxyQuire = require('proxyquire').noCallThru();

require('app-module-path').addPath(process.cwd() + '/cartridges');

const defaultUUID = 'xxxxxxxxxxxxxxxxxxxxxxxxxx';

var SentryId = proxyQuire('lib_sentry/cartridge/models/SentryId', {
    'dw/util/UUIDUtils': {
        createUUID: () => defaultUUID
    }
});

describe('Model - Sentry ID', () => {
    it('Should use a generated UUID if none is passed.', () => {
        var result = new SentryId();

        expect(result.uuid).to.equal('xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx');
    });

    it('Should not allow a short UUID to be used.', () => {
        try {
            new SentryId();
        } catch (e) {
            expect(e.message).to.equal('UUID needs to be 32 characters long.');
        }
    });

    it('Should allow for a custom UUID to be used.', () => {
        const customUUID = 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxyz';
        var result = new SentryId(customUUID);

        expect(result.uuid).to.equal(customUUID);
    });

    it('Should return the UUID when using toString.', () => {
        var result = new SentryId();

        expect(result.toString()).to.equal('xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx');
    });
});
