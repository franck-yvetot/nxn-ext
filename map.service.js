const crypto = require('crypto')   
const {objectSce,arraySce} = require("@nxn/ext");
const stringSce = require("@nxn/ext/string.service");

// const querystring = require("querystring");
const config = require('@nxn/config');

const pipes = {
    id : formatId,
    base64 : b64,
    decode64 : decodeB64,
    md5:md5,
    dateString:dateString,
    timestamp:timestamp,
    date: d => new Date(d),
    now: d => new Date(),

    url_encode:encodeURIComponent,
    trim: v => v.trim(),
    lower: v => v.lower(),
    upper: v => v.upper(),
    no_accents : stringSce.removeAccents,
    nl: nl,

    env:env,
    capitalise:capitalize,
    capitalize:capitalize,
    argv: i => argv(i)
};

class MapSce
{
    constructor() {
        this.init();
    }

    init() {
        // set pipe functions
        this.pipes = pipes;
    }

    // add a custom pipe filter
    addFilter(k,f) {
        this.pipes[k] = f;
    }

    execPipe(s,pipe) {
        if(this.pipes[pipe])
            return this.pipes[pipe](s);
        else
            throw new Error("Unknown map pipe "+pipe);
    }

    mapPattern(pattern,obj)
    {
        let aPipes = pattern.split('|'); // supports yyy.xxx|id|lower|base64
        let patt = aPipes.shift(); 
        let attribs = patt.split('.'); // supports yyy.xxx
        
        // walk the object tree
        let obj2 = obj;
        attribs.forEach(k=> {
            try {
                obj2 = 
                    obj2 && typeof obj2 === 'object' &&
                            ((k in obj2) && obj2[k])
                            || '';
            }
            catch(error) {
                debug.log("map error "+error.message);
            }
        } 
        );

        // now pipe the value to filters
        aPipes.forEach(pipe => {
            if(pipe.startsWith("="))
            {
                if(!obj)
                obj2 = pipe.trim().slice(1);
            }
            else if(pipe.indexOf("(")!=-1)
            {
                const matches = pipe.match(/([^()]+\([^()]*\))/);
                if(!matches)
                    throw new Error("invalid pipe syntax "+pipe);

                pipe = matches[1];
                let params = matches[2];
                aParams = params.split(",");

                if(this.pipes[pipe])
                    obj2 = this.pipes[pipe](obj2,...aParams);
            }
            else
            if(this.pipes[pipe])
                obj2 = this.pipes[pipe](obj2);
            else
                    obj2 = pipe;
                // throw new Error("invalid ammping pattern, unknown pipe "+pipe);
        });
        
        return obj2;
    }

    mapFieldMacros(fname,obj,map,reg) {
        let pattern = map[fname];

        if(!pattern)
            return obj[fname]||null;

        if(pattern.startsWith && pattern.startsWith('='))
        {
            pattern = pattern.trim().slice(1);
            pattern = pattern || fname; // supports = or =name

            return this.mapPattern(pattern,obj);
        }       

        reg = reg || /[%]([a-z 0-9_|=.]+)[%]/gi;
        const rep =pattern.replace(reg,
            (match,p1) => { 
                return this.mapPattern(p1,obj);
            });

        return rep;    
    }

    mapString(pattern,map,reg) {
        if(!pattern)
            return null;

        reg = reg || /[%]([a-z 0-9_|=.]+)[%]/gi;
        const rep =pattern.replace(reg,
            (match,p1) => { 
                return this.mapPattern(p1,map);
            });

        return rep;    
    }

    mapAttribute(pattern,map,reg) 
    {
        if(!pattern)
            return null;

        reg = reg || /[%]([a-z 0-9_|=.]+)[%]/gi;
        let p = reg.exec(pattern);
        if(p)
        {
            let rep ='';
            let p1 = p[1];
            let rep2 = this.mapPattern(p1,map);
            if(rep && typeof rep2 == 'string')
            {
                if(p[0] == pattern)
                    // a single string replace
                    rep = rep2;
                else
                    // complex string
                    rep = this.mapString(pattern,map,reg);
            }
            else
                // object
                rep = rep2;    
            return rep;
        }

    return pattern;                
    }    

    mapObj(map,from,reg)
    {
        let to = {};

        objectSce.forEachSync(map,(v,k) => {
            if(typeof v =="string")
                to[k] = this.mapFieldMacros(k,from,map,reg)
            else if(v instanceof Array)
                to[k] = this.mapArray(v,from,reg);
            else  if(typeof v =="object")
                to[k] = this.mapObj(v,from,reg);
        });

        return to;
    }

    mapArray(map,from,reg)
    {
        let to = [];

        arraySce.forEachSync(map,(v,k) => {
            if(typeof v =="string")
                to[k] = this.mapFieldMacros(k,from,map,reg)
            else if(v instanceof Array)
                to[k] = this.mapArray(v,from,reg);
            else  if(typeof v =="object")
                to[k] = this.mapObj(v,from,reg);
        });

        return to;
    }
}

// private functions
function formatId(itemId) {
    itemId = stringSce.removeAccents(itemId);
    itemId = itemId.replace(/[^a-z0-9.]/gi,"-");
    itemId = itemId.replace(/[-]+/g,"-");
    itemId = itemId.toLowerCase();
  
    return itemId;
  }

  
function md5(s)
{
    return crypto.createHash('md5').update(s).digest("hex");
}

function b64(s) {
    return Buffer.from(s).toString('base64'); 
}
  
function decodeB64(s) {
// return Buffer.from(s).toString('ascii'); 
return Buffer.from(s, 'base64').toString('ascii');
}
  
function timestamp(date) {
    const d = date || new Date();
    return d.getTime();
}
  
  function dateString(date,withSec) {
    const d = date || new Date();
  
    return d.getUTCFullYear() + 
        ("0" + (d.getUTCMonth()+1)).slice(-2) + 
        ("0" + d.getUTCDate()).slice(-2) +
        ("0" + d.getUTCHours()).slice(-2) +
        ("0" + d.getUTCMinutes()).slice(-2) +
        ("0" + d.getUTCSeconds()).slice(-2);     
  }

function urlEncode(s) {
    return 
}  

function env(v) {
    return process.env[v];
}

function argv(v) {
    const i = parseInt(v);
    return process.argv[v];
}

function include(path) {
    return config.loadConfig(path);
}

function capitalize(s) {
    if (typeof s !== 'string') return ''
    return s.charAt(0).toUpperCase() + s.slice(1)
}

function nl(s) {
    if (typeof s !== 'string') 
        return '';

    return s+"\n";
}


module.exports = new MapSce();