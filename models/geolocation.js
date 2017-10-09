var mongoose = require('mongoose');
var constants = require('./../constants');


/*
*  Model interface for querying and possibly persistence that has to do
*  with limited amounts of documents. Mongoose does however have a memory leak.
*/
var Geolocation = mongoose.model(constants.COLLECTION, {
    ip_address: {
        type: String,
        validate: (v) => validator.isIP(v, 4)
    },
    country_code: {
        type: String
    },
    country_name: {
        type: String
    },
    city: {
        type: String
    },
    latitude: {
        type: String,
        required: true,
        validator: (v) => validator.isLatLong(v)
    },
    longitude: {
        type: String
    },
    mystery_value: {
        type: Number
    }
});


module.exports = {Geolocation}
