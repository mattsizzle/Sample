const Config = require('./config');
const Gdax = require('gdax');
const EventEmitter = require('events');

// Instance a new emitter
class GdaxEmitter extends EventEmitter {
    constructor() {
        super();
        let self = this;
    }
}

let publicClient, authedClient, webSocket;
try {
    publicClient = new Gdax.PublicClient(Config.product, Config.apiURI);
    authedClient = new Gdax.AuthenticatedClient(Config.key, Config.secret, Config.passphrase, Config.apiURI, Config.product);
    webSocket = new Gdax.WebsocketClient(Config.product);
    GdaxEmitter = new GdaxEmitter;

    webSocket.on('message', function(data) {
        handleSocketEmit(data);
    });

    webSocket.on('close', function(data) {
        webSocket = new Gdax.WebsocketClient(Config.product);
        webSocket.on('message', function(data) {
            handleSocketEmit(data);
        });
    });
}
catch (e) {
    // TODO: logError(e);
    console.log(e);
}

/**
 * handleSocketEmit
 * @param data Object
 */
function handleSocketEmit(data) {
    switch (data.type) {
        case 'change':
        case 'match':
        case 'done':
        case 'open':
            GdaxEmitter.emit('order', data);
            break;
        case 'error':
            // TODO: logError(data.message);
            console.error(data.message);
            break;
        case 'received': // Do nothing here we don't care about pending orders
            break;
        default:
            console.log('Unknown Message type received: ' + data.type);
    }

    // Dispatch Based on Type Attribute

}

/* Example Data Payload
 {
 type: 'open',
 side: 'sell',
 price: '271.88000000',
 order_id: 'dc63cba7-a1d5-4fd2-a709-954edf9dc044',
 remaining_size: '31.61597000',
 product_id: 'ETH-USD',
 sequence: 639725206,
 time: '2017-06-28T01:28:46.590000Z'
 }

 TODO:
     An algorithm to maintain an up-to-date order book is described below:
 */

module.exports = {
    // Inherit our APIs as properties
    publicClient: publicClient, // Public API
    authedClient: authedClient, // Authenticated API
    webSocket: webSocket, // Raw webSocket Stream,
    GdaxEmitter: GdaxEmitter // Our APPs event emitter
};
