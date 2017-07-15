const redis = require('redis');
const moment = require('moment');

const client = redis.createClient();
const TIME_OUT_SECONDS = (60 * 24 * 30);
const LOG_DATABASE_INDEX = 13;
const DATABASE_INDEX = 14;

client.on('connect', function() {
    writeLogEntry('connect', moment().format());
});

function writeLogEntry(action, timestamp) {
    client.select(LOG_DATABASE_INDEX, function() {
        let logMessage = {
            action: action
        };

        client.hmset(timestamp, logMessage, function(err, response) {
            console.log([err, response]);
        });
    });
}

function insertRecord(recordKey, obj) {
    client.select(DATABASE_INDEX, function() {
        let logMessage = {
            type: obj.type,
            action: 'insertRecord',
            data: data,
            timestamp: Date.now()
        };

        client.hmset(logMessage.timestamp, logMessage, function(err, response) {
            console.log([err, response]);
            client.expire(recordKey, TIME_OUT_SECONDS);
        });
    });
}

function retrieveRecord(recordKey) {
    client.select(DATABASE_INDEX, function() {
        client.hgetall(recordKey, function (err, obj) {
            console.dir(obj);
            return obj;
        });
    });
}