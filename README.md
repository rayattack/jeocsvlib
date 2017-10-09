JeoCSVLib NodeJS  
================

[![Build Status](https://travis-ci.org/rayattack/jeocsvlib.svg?branch=dev)](https://travis-ci.org/rayattack/jeocsvlib)

GeoCSVLIB implemented in NodeJS Version available on pip with a frontend built in express.

## Installation

Install with NPM.

```shell

npm install geocsvlib

```

## Parsing Geolocation CSV Data

```shell

geocsvlib data_dump.csv

```


#### Accessing GeoLocation Data

```node

/*
*  Get the geocsvlib
*/
const geocsvlib = require('geocsvlib')

geocsvlib.find('ip address', (result) => {
    //do something with result
});

/*
*  Dummy configuration file to use for initialization
*/
var configuration = {
    vendor: 'mongodb' //or sqlite,
    database: 'database name',
    port: 'database port',
    username: 'username',
    password: 'password'
};

//drop config.json file in project directory to configure

```


- The GeoCSV Library allows for database configuration via provision of a config.json file.

- In such scenarios you need to pass the location of the config.json file as the second argument in the terminal, or as a dictionary when loading geocsv via code.
