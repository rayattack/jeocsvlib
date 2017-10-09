/*
*  Application level constants
*/
const fs = require('fs');
const path = require('path');
const validator = require('validator');

/*
*  Public constants in capitals
*/
const COLLECTION = 'geolocation';

/*
*  Private constants in small case
*/
const filename = 'config.json'
const configuration = {
    vendor: 'mongodb',
    database: 'nodishdb',
    port: 27017,
    host: 'localhost'
}

/*
*  local variable declarations
*/
var configFilePath = path.join(__dirname, '..', 'config.json');


/*
*  Get the configuration for the entire library if provided
*  otherwise get defaults
*  @return {object} - The configuration object to customize app behaviour
*/
var getConfiguration = () => {
    try {
        var noteString = fs.readFileSync(configFilePath);
        var config = JSON.parse(noteString);
        if(isGoodConfiguration(config)){
            return config;
        }
        throw Error("Vendor not recognized, falling back to defaults");
    } catch (e) {
        console.log(e.message);
        return configuration;
    } finally {
        //Clean up any resources that need cleaning
    }
};

/*
*  Checks if the configuration object provided is good enough
*  @param {object} configurationObject - the parsed config
*/
var isGoodConfiguration = (configurationObject) => {
    //this is subject to whatever internal policy you can subject it to
    approvedVendors = ['mongodb', 'sqllite'];
    return validator.isIn(configurationObject.vendor, approvedVendors);
}



module.exports = {
    COLLECTION,
    getConfiguration,
}
