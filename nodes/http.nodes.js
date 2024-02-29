const debug = require("@nxn/debug")('Http');
const FlowNode = require("@nxn/boot/node");
const axios = require("axios").default;
const mapper = require("@nxn/ext/map.service");

/**
 * node for calling an API
 */
class HttpNode extends FlowNode
{
    constructor(instName) {
        super(instName);
    }

    async init(config,ctxt,...injections) {
        super.init(config,ctxt,injections);        

        // add specific node data here
        this.url = config.url || this.invalidParam("missing url");
        this.params = config.params || {};
        this.method = config.method;

        this.timeout = config.timeout || 0;
        this.withCredentials = config.withCredentials || false;
        this.responseType = config.responseType || 'json';
        this.responseEncoding = config.responseEncoding || 'utf8';
        this.headers = config.headers || null;

        this.onError = this.getInjection("errors");
    }

    async processMessage(message) {

        // do something here...
        const url = message.url || this.url;

        let method = message.method || this.method;
        if(!method)
            if(data)
                method = "post";
            else
                method = "get";

        method = method.toLowerCase();

        const params = message.params || this.params;
        const withCredentials = message.withCredentials || this.withCredentials;
        const timeout = message.timeout || this.timeout;
        const responseType = message.responseType || this.responseType;
        const responseEncoding = message.responseEncoding || this.responseEncoding;
        const headers = message.headers || this.headers;        
        let options = {url,method,params,withCredentials,timeout,responseType,responseEncoding,headers};

        if(!(method == 'get' || method == 'delete'))
        {
            // map message data
            if(this.config.data) 
            {
                // map message to config.data
                options.data = mapper.mapObj(this.config.data,message);
            }
            else
                // no specified mapping => send message.data
                options.data = message.data;
        }

        let outMsg;
        try 
        {       
            // log requests to injection requests if any
            await this.sendMessage(options,"requests");            

            const response = await axios(options);
            if(response.status == 200) 
            {
                outMsg = this.createMessage(response.data,message);
                await this.sendMessage(outMsg);
                return outMsg;
            }
            else
            {
                debug.error("URL = "+url+" error "+response.status);

                // send to injection "error" if any
                const data = {data: message.data, error:response};
                outMsg = this.createMessage(data,message);
                await this.sendMessage(outMsg,"error");
                
                return outMsg;
            }
        }
        catch (error) 
        {
            debug.log("ERROR :"+error.message+error.stack);
            debug.log("Sent :"+JSON.stringify(options));
        }
    }
}

class HttpNodeFactory
{
    constructor () {
        this.instances={};
    }
    getInstance(instName) {
        if(this.instances[instName])
            return this.instances[instName];

        return (this.instances[instName] = new HttpNode(instName));
    }
}

module.exports = new HttpNodeFactory();
