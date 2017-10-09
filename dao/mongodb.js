const MongoClient = require('mongodb').MongoClient;
const MongoServer = require('mongodb').MongoServer;



/*
*  Constants imports
*/
const constants = require('./../constants');


/*
* Non constant variables declaration area
*/
var cfg = constants.getConfiguration();
var host = cfg.host;
var port = cfg.port;
var database = cfg.database;
var vendor = cfg.vendor;


/*
*  Callback version of opening database connection
*/
var getDbConnection = (callback) => {
    try {
        var mongoClient = MongoClient.connect(`${vendor}://${host}:${port}/${database}`, (err, db) => {
            if(err){
                return console.log('Could not connect to mongodb with configuration:', cfg);
            }
            callback(db);
        });
    }
    catch(err){
        return console.log(`Could not connect fo ${cfg.vendor} with configuraion:`, cfg);
    }
};

/*
*  Promise version of getDbConnection
*/
var openDbConnection = () => {
    return new Promise((resolve, reject) => {
        try {
            var mongoClient = MongoClient.connect(`${vendor}://${host}:${port}/${database}`, (err, db) => {
                if(err){
                    db.close();
                    reject(`Could not connect to mongodb with configuration: ${cfg}`);
                }
                resolve(db);
            });
        }
        catch(err){
            reject(`Could not connect fo ${cfg.vendor} with configuraion: ${cfg}`);
        }
    });
};


module.exports = {
    getDbConnection,
    openDbConnection
}
