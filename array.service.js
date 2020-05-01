const debug = require("nxn-boot/debug.service")('array');

class ArraySce
{
    constructor() {
        this.init();
    }

    init() {
        /*
        Array.prototype.forEachSync = function(cb) { 
            arraySce.forEachSync(this,cb); }
        Array.prototype.forEachAsync = function(cb) { arraySce.forEachAsync(this,cb); }
        */
    }

    forEachSync(array, callback) {
        if(array.length)
            for (let index = 0; index < array.length; index++) {
            callback(array[index], index, array);
            }
    }
    
    async forEachAsync(array, callback) {
        for (let index = 0; index < array.length; index++) {
          await callback(array[index], index, array);
        }
    }
}

module.exports = new ArraySce();
