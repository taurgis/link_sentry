'use strict';

var { createUUID } = require('dw/util/UUIDUtils');

/**
 * Generates a Sentry UUID according to specifications
 * @return {string} - The generated UUID
 */
function generateSentryUUID() {
    return (createUUID() + createUUID()).substring(0, 32).toLowerCase();
}

/**
 * Model representing a unique SentryId.
 * @param {string|null} uuid - The preferred UUID for a Sentry ID
 * @constructor
 */
function SentryId(uuid) {
    if (uuid && uuid.length !== 32) {
        throw new Error('UUID needs to be 32 characters long. Was given the value ' + uuid);
    }

    this.uuid = uuid || generateSentryUUID();
}

/**
 * Returns the SentryId as a String
 *
 * @return {*|string} - The SentryId
 */
SentryId.prototype.toString = function () {
    return this.uuid;
};

module.exports = SentryId;
