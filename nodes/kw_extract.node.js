
const debug = require("@nxn/debug")('Kw_extract');
const FlowNode = require("@nxn/boot/node");

class Kw_extractNode extends FlowNode
{
    /**
     * @type {{re,target}[]}
     */
    map;

    /**
     * @type {FlowNode[]}
     */
    foundTagsNodes;

    constructor(instName) {
        super(instName);
    }

    async init(config,ctxt,...injections) 
    {
        super.init(config,ctxt,injections);        

        // add specific node data here
        let map = config.map;
        let regexArray = [];

        for (let target in map) 
        {
            let keyw = map[target];

            regexArray.push(
                {
                    re: new RegExp("\\b("+keyw+")\\b", 'ig'),
                    target:target
                }                
            );
        }
        
        this.regexArray = regexArray;
    }

    name() {
        return this.config.name ||"Kw_extract";
    }

    /**
     * 
     * @param {*} string 
     * @returns {Record<string,{target:string,found:string[]}}
     */
    extractKeywords(string) 
    {
        let results = {};

        this.regexArray.forEach(desc => 
        {
            // match ?
            let match;
            while ((match = desc.re.exec(string)) !== null) 
            {
                if(!results[desc.target])
                    results[desc.target] = {target:desc.target, found:[]};

                // get keyword
                results[desc.target].found.push(match[1]); // Assuming capturing group is used to capture the keyword
            }
        });

        return results;
    }

    async processMessage(message) 
    {
        try 
        {
            let data = message.data || message.string;

            if(data)
            {
                let keywords = this.extractKeywords(data.toString());
                message.keywords = keywords;
                message.tags = Object.keys(keywords).join(",");    
            }
            else
            {
                message.keywords = null;
                message.tags = '';
            }

            if(this.canSendMessage()) 
            {
                try {
                    await this.sendMessage(message);
                } catch (error) {
                    debug.log("ERROR :"+error.message+error.stack);
                }
            }

            if(message.tags && this.foundTagsNodes)
            {
                try 
                {
                    await this.sendMessage(message,this.foundTagsNodes);
                } 
                catch (error) {
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

class Kw_extractNodeFactory
{
    constructor () {
        this.instances={};
    }
    getInstance(instName) {
        if(this.instances[instName])
            return this.instances[instName];

        return (this.instances[instName] = new Kw_extractNode(instName));
    }
}

module.exports = new Kw_extractNodeFactory();
module.exports.Kw_extractNode = Kw_extractNode;