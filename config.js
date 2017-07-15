function _getAPIURL() {
    var self = this;

    var uri;
    if ( self.debug ) {
        uri = self.sandboxURI;
    } else {
        uri = self.productionURI;
    }

    self.apiURI = uri;
}

var Config = {
    productionURI: 'https://api.gdax.com',
    sandboxURI: 'https://api-public.sandbox.gdax.com',
    passphrase: '',
    secret: '==',
    key: '',
    product: 'ETH-USD',
    debug: false,
    apiURI: null // Build later, here for definition
};

_getAPIURL.call(Config);

module.exports = Config;
