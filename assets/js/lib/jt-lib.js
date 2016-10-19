/*
    jt-lib.js for storing global level functions
 */
var jt = function () {
    return {
        log: function (_text) {
            if (_config.environment == 'dev') {
                console.log(_text);
            }
        }
    }
}
var jt = jt();