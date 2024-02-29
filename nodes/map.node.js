const debug = require("@nxn/debug")('Map');
const FlowNode = require("@nxn/boot/node");
const objectSce = require("@nxn/ext/object.service");
const mapper = require("@nxn/ext/map.service");

class MapNode extends FlowNode
{
    constructor() {
        super();
    }

    async init(config,ctxt,...injections) {
        super.init(config,ctxt,injections);
        
        this.map = config.map || config.message || {};
    }

    async processMessage(message) {

        try {

            // map msg to new msg2
            const map = this.map;

            const msg2 = mapper.mapObj(map,message);

            if(this.canSendMessage()) {
                try {
                    await this.sendMessage(msg2);
                } catch (error) {
                    debug.log("ERROR :"+error.message+error.stack);
                }
            }
        }

        catch(error) {
            let message = error.message || error;
            let code = parseInt(error.code||500, 10) || 500;
            debug.error(error.stack||error);
        }        
    }
}

class Factory
{
    constructor () {
        this.instances={};
    }
    getInstance(instName) {
        if(this.instances[instName])
            return this.instances[instName];

        return (this.instances[instName] = new MapNode(instName));
    }
}

module.exports = new Factory();