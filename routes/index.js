const express = require('express');
const router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {

    /*
    var parser = require('rss-parser');

    var feeds = [];
    parser.parseURL('https://www.google.com/alerts/feeds/07343870387298935386/10121829463855570780', function(err, parsed) {
        parsed.feed.entries.forEach(function(entry) {
            feeds.push(entry)
        });
    });

    var callback = function(stats, accounts) {
        var open = parseFloat(stats.open).toFixed(2);
        var high = parseFloat(stats.high).toFixed(2);
        var low  = parseFloat(stats.low).toFixed(2);
        var last = parseFloat(stats.last).toFixed(2);


    };

    publicClient.getProduct24HrStats(function (err, response, data) {
        var stats = data;
        authedClient.getAccounts(function (err, response, data) {
            var accounts = data;
            callback(stats, accounts);
        });
        
    });

    */

    res.render('index', {
        title: 'EtherDesk',
        data: {
            open: open,
            high: high,
            low: low,
            last: last,
            feeds: feeds,
            accounts: accounts
        }
    });

});

module.exports = router;
