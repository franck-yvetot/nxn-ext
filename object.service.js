// extensions for the Object
class ObjectSce
{
    constructor() {
        this.init();
    }

    init() {
        /*
        Object.prototype.forEachSync = function(cb) { 
            ObjectSce.forEachSync(this,cb); }
        Object.prototype.forEachAsync = function(cb) { ObjectSce.forEachAsync(this,cb); }
        */
    }

    // foreach(fn)
    forEachSync(obj, callback) {
        for (let p in obj) {
            const m = obj[p];
            callback(m, p,obj);
        }
    }

    // forEach asynchronous with await calls to function
    async forEachAsync(obj, callback) {
        for (let p in obj) {
            const m = obj[p];
            await callback(m, p,obj);
        }
    }

    clone(obj) {
        return { ... obj};
    }
}

module.exports = new ObjectSce();
