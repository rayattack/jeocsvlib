#!/usr/bin/env node

const fs = require('fs');
const os = require('os');

const validator = require('validator');
const yargs = require('yargs');
const csv = require('csv-parser');
const MongoClient = require('mongodb').MongoClient;
const MongoServer = require('mongodb').MongoServer;

/*
*  Application level constants
*/
const constants = require('./constants');
const mongoid = require('./dao/mongodb');


/*
*  File level constants
*/
const serverOptions = {
    auto_reconnect: true,
    poolSize: 10
};
const argv = yargs
    .demand(1, 'Please provide a csv file path/url to be parsed')
    .argv;
const csvFilePath = argv._[0];
const collectionName = 'geolocation';


//{ip, cc, cn, ct, lt, ln, mv}
var titles = [
    'ip_address', 'country_code', 'country_name', 'city',
    'latitude', 'longitude', 'mystery_value'
];

/*
* Non constant variables declaration area
*/
var cfg = constants.getConfiguration();
var host = cfg.host;
var port = cfg.port;
var database = cfg.database;
var vendor = cfg.vendor;



/*
* Additional but semantically separate variables
*/
var total = 0;
var success = 0;
var fail = 0;
var startTime = new Date();
var ipAddress, countryCode, countryName, city, latitude, longitude, mysteryValue;
var pipeline = [];


var getTime = () => {
    var totalTime = new Date() - startTime;
    return `${totalTime/1000} Secs`;
};//endTime()

var showStats = () => {
    console.log('---');
    console.log('Finished Parsing CSV File');
    console.log('-------------------------');
    console.log(`File Name: ${csvFilePath}`);
    console.log(`Records Parsed: ${total}`);
    console.log(`Records Passed: ${success}`);
    console.log(`Records Failed: ${fail}`);
    console.log(`Total Time: ${getTime()}`);
};//showStats()

var pushData = (data, callback) => {
    //validateData(data, saveData);
    pipeline.push(data);
    //console.log(data);
    callback(pipeline);
};

var duplicateData = (db, data) => {
    return db.collection(collectionName).find(data).nextObject();
};

var saveData = (db, data, callback) => {
    duplicateData(db, data)
    .then((doc) => {
        return console.log("Duplicate Data: ", doc);
    });
    db.collection(collectionName).insertOne({
        ip_address: data.ip_address,
        country_code: data.country_code,
        country_name: data.country_name,
        city: data.city,
        latitude: data.latitude,
        longitude: data.longitude,
        mystery_value: data.mystery_value
    }, (err, docs) => {
        if(err){
            return console.log('Unable to insert geolocation', err);
        }

        //final callback we call to log saved data
        callback();
    });
}

var validateData = (pipestack, callback) => {
    if(pipestack.length === 0){
        //we are done close the connection
        //callback withouth arguments or undefined
        callback();
    }
    //check data for something if isChuckNorris(data) etc
    //if good no missing ip and lat lng correct validator.isIP
    //then callback with the data callback(data);
    unverifiedData = pipestack.shift();
    console.log('This is the unverified data:', unverifiedData);

    if (validator.isIP(unverifiedData.ip_address) &&
        validator.isLatLong(`${unverifiedData.latitude}, ${unverifiedData.longitude}`)){
        verifiedData = {
            ip_address: unverifiedData.ip_address,
            country_name: unverifiedData.country_name,
            country_code: unverifiedData.country_code,
            city: unverifiedData.city,
            latitude: unverifiedData.latitude,
            longitude: unverifiedData.longitude,
            mystery_value: unverifiedData.mystery_value
        }
        console.log(verifiedData);
        callback(verifiedData);
    }
};

// try {
//     var mongoClient = MongoClient.connect(`${vendor}://${host}:${port}/${database}`, (err, db) => {
//         if(err){
//             console.log('Could not connect to mongodb with configuration:', cfg);
//         }
//         //create index before we move along
//         db.createIndex(collectionName, 'ip_address', {unique: true}, (err, name) => {
//             if(err){
//                 return console.log("Could not create an index:", err);
//             }
//             console.log(`Index Created with name: ${name}`);
//         });
//
//         try{
//             fs.createReadStream(csvFilePath)
//                 .pipe(csv())
//                 .on("data", function(data){
//                     pushData(data, (pipestack)=>{
//                         validateData(pipestack, (validData) => {
//                             if(validData){
//                                 saveData(db, validData, () => {
//                                     console.log("Saved");
//                                     success++;
//                                     total++;
//                                 });
//                             }
//                             fail++;
//                             total++;
//                         });
//                     });
//                 })
//                 .on("end", function(){
//                     db.close();
//                     showStats();
//             });
//         }
//         catch(err){
//             console.log("That file was not found");
//         }
//     });
// }
// catch(err){
//     console.log(`Could not connect fo ${cfg.vendor} with configuraion:`, cfg);
// }


parseCSV = (csvFileName) => {
    mongoid.getDbConnection((db) => {
        if(db){
            //Aye me laddies, need to set unique constraints fer duplicates prevention
            db.createIndex(collectionName, 'ip_address', {unique: true}, (err, name) => {
                if(err){ return console.log("Could not create an index:", err);}
                console.log(`Index Created with name: ${name}`);
            });

            try{
                fs.createReadStream(csvFilePath)
                    .pipe(csv())
                    .on("data", function(data){
                        pushData(data, (pipestack)=>{
                            validateData(pipestack, (validData) => {
                                if(validData){
                                    saveData(db, validData, () => {
                                        console.log("Saved");
                                        success++;
                                        total++;
                                    });
                                }
                                fail++;
                                total++;
                            });
                        });
                    })
                    .on("end", function(){
                        db.close();
                        showStats();
                });
            }
            catch(err){
                console.log("That file was not found");
            }//catch
        }//if(db)
        else {
            //do something else
        }
    });
};

//resolve with callback
var find = (ipAddress, callback) => {
    mongoid.getDbConnection((db)=>{
        if(db){
            duplicateData(db, {ip_address: ipAddress})
                .then((doc) => {
                    callback(doc);
                }, (err) => {
                    callback(undefined);
                });
        }
        else {
            return console.log("Could not find any records");
        }
    });
};

//resolve with Promise
var finding = (ipAddress, callback) => {
    mongoid.openDbConnection()
        .then((db) => {
            duplicateData(db, ipAddress)
                .then((doc) => {
                    db.close();
                    console.log("Found some data:", doc);
                    callback(doc);
                });
        }, (err) => {
            return console.log("Could not find any records");
    });
};

if(csvFilePath){
    parseCSV(csvFilePath);
}
else {
    console.log('NOTHING DEY HAPPEN? NOTHING DE PAR...');
}

module.exports = {
    getTime,
    validateData,
    saveData,
    duplicateData,
    find,
    finding
}
