const debug = require("@nxn/debug")('Replacer');
const FlowNode = require("@nxn/boot/node");

/**
 * node that process messages and replace their content, then send to next node
 */
class ReplaceSce  extends FlowNode
{
    constructor(inst) {
        super(inst);
    }

    async init(config,ctxt,...injections) 
    {
        super.init(config,ctxt,injections);
    
        this.regs = this.getRegs(config.replace && config.replace.data || config.replace || {});
        this.regsName = this.getRegs(config.replace && config.replace.name || {});
    }

    getRegs(regs) 
    {
        let regs2 = [];
        for(let reg in regs)
        {
            let entry = 
            {
                reg : new RegExp(reg,"mg"),
                repl : regs[reg]
            }

            regs2.push(entry);            
        }

        return regs2;
    }

    async processMessage(message) 
    {
        try {
            // const {name,data,path} = message;
            let message2 = {};

            message2.data = this.replaceString(message.data.toString('utf8'),this.regs);
            message2.name = this.replaceString(message.name,this.regsName);
            message2.path = this.replaceString(message.path,this.regsName);

            if(this.canSendMessage())
            {
                await this.sendMessage2(message2);
            }
        } 
        catch(error) {
            let message = error.message || error;
            let code = parseInt(error.code||500, 10) || 500;
            debug.error(error.stack||error);
        }
    }

    replaceString(str,regs) 
    {
        for(const pattern of regs)
        {
            str = str.replace(pattern.reg,pattern.repl);
        }

        return str;
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

        return (this.instances[instName] = new ReplaceSce(instName));
    }
}

module.exports = new Factory();