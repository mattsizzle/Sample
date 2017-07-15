var express = require('express');
var Gdax = require('gdax');

var publicClient = new Gdax.PublicClient('ETH-USD', 'https://api.gdax.com');

var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
    var callback = function(err, response, data) {
        res.send(data);
    };

    publicClient.getProduct24HrStats(callback);
});

module.exports = router;
