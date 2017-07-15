var Gdax = require('gdax');

var publicClient = new Gdax.PublicClient('ETH-USD', 'https://api.gdax.com');

var APIURL = 'https://api.gdax.com';
var sandboxURI = 'https://api-public.sandbox.gdax.com';

// Defaults to https://api.gdax.com if apiURI omitted
var authedClient = new Gdax.AuthenticatedClient(
    key, secret, passphrase, APIURL, 'ETH-USD');

var argv = require('minimist')(process.argv.slice(2));
var last_price;
var last_position = argv.p;
var last_action_at = parseFloat(argv.c);

// Size is equal to the amount of ETH to processes in a transaction
var DEFAULT_SIZE = '0.0911';
var SIZE_NUM = parseFloat(argv.s) || parseFloat(DEFAULT_SIZE);
var SIZE_STR = SIZE_NUM.toFixed(5);

// We do one cycle for sell / buy or buy / sell. Then reset to catch the next wave
var action_count = 0;
var callback = function(err, response, last) {
    if (err) {
        console.log(err);
        return;
    }

    var current = last;

    console.log([ "HIGH THRESHOLD", current + 0.1, "LOW THRESHOLD", current - 0.1 ]);

    if ( last_price ) {
        console.log("DECIDING ACTION");
        if ( current < last_action_at  ) {
            console.log("ACTIONS AVAILABLE [Buy]");
            if (last_position === 'sell') {
                IS_BUSY = true;
                attempt_buy(last);
            }
        }

        if ( current > last_action_at ) {
            console.log("ACTIONS AVAILABLE [Sell]");
            if ( last_position === 'buy' ) {
                IS_BUSY = true;
                attempt_sell(last);
            }
        }
        console.log("NO ACTION TAKEN");
    }

    last_price = last;
};

function attempt_buy(last_trade) {
    console.log('BUY ORDER: ' + last_trade);
    var request_price = last_trade;
    var sellParams = {
        'price': request_price, // USD,
        'type': 'limit',
        'side': 'buy',
        'size': SIZE_STR, // BTC
        'product_id': 'ETH-USD',
        'time_in_force': 'GTT',
        'cancel_after': 'min',
        'post_only': true
    };

    var callback = function(err, response, data) {
        if (err) {
            console.log('BUY ERROR: ' + err);
            IS_BUSY = false;
            return;
        }

        var orderCheck = function (err, response, data) {
            console.log(data);
            if ( data.message === 'NotFound' ) {
                IS_BUSY = false;
            }
            else if ( data.status === 'done' ) {
                if (data.settled) {
                    action_count = action_count + 1;
                    last_position = 'buy';
                    var order_price = parseFloat( parseFloat(data.price).toFixed(2) );
                    last_action_at = order_price;
                }
                IS_BUSY = false;
            }
            else if (data.status === 'rejected') {
                IS_BUSY = false;
            } else {
                setTimeout(function () {
                    authedClient.getOrder(orderID, orderCheck);
                }, 2000);
            }
        };

        var orderID = data.id;
        if ( orderID ) {
            authedClient.getOrder(orderID, orderCheck);
        }
    };

    authedClient.buy(sellParams, callback);
}

function attempt_sell(last_trade) {
    console.log('SELL ORDER: ' + last_trade);
    var request_price = last_trade;
    var sellParams = {
        'price': request_price, // USD,
        'type': 'limit',
        'side': 'sell',
        'size': SIZE_STR, // BTC
        'product_id': 'ETH-USD',
        'time_in_force': 'GTT',
        'cancel_after': 'min',
        'post_only': true
    };

    var callback = function(err, response, data) {
        if (err) {
            console.log('SELL ERROR ' + err);
            IS_BUSY = false;
            return;
        }

        var orderCheck = function (err, response, data) {
            console.log(data);
            if ( data.message === 'NotFound' ) {
                IS_BUSY = false;
            }
            else if (data.status === 'done') {
                if (data.settled) {
                    action_count = action_count + 1;
                    last_position = 'sell';
                    var order_price = parseFloat( parseFloat(data.price).toFixed(2) );
                    last_action_at = order_price;
                }
                IS_BUSY = false;
            }
            else if (data.status === 'rejected') {
                IS_BUSY = false;
            } else {
                setTimeout(function () {
                    authedClient.getOrder(orderID, orderCheck);
                }, 2000);
            }
        };

        var orderID = data.id;
        if ( orderID ) {
            authedClient.getOrder(orderID, orderCheck);
        }
    };

    authedClient.sell(sellParams, callback);
}

//publicClient.getProductTicker(callback);
var IS_BUSY;
var websocket = new Gdax.WebsocketClient(['ETH-USD']);

websocket.on('message', function(data) {
    // Next wave. 2 actions in a cycle
    if ( action_count === 2 ) {
        console.log('FULL CYCLE COMPLETE');
        process.exit(420);
    }

    if ( data.type === 'match'
        && !IS_BUSY
        && data.price
    ) {
        var last = parseFloat( parseFloat(data.price).toFixed(2) );
        console.log(['PRICE', last, 'LAST ACTION PRICE', last_action_at, 'LAST ACTION', last_position]);

        if (!last_action_at && !last_position) {
            IS_BUSY = true;
            // Start with a sell order
            //attempt_sell(last);
        } else {
            //callback(null, null, data.price);
        }
    }
});