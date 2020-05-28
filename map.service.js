const crypto = require('crypto')   
const {objectSce,stringSce} = require("@nxn/ext");
// const querystring = require("querystring");
const config = require('@nxn/config');

class MapSce
{
    constructor() {
        this.init();
    }

    init() {
        // set pipe functions
        this.pipes = {
            id : formatId,
            base64 : b64,
            decode64 : decodeB64,
            md5:md5,
            dateString:dateString,
            timestamp:timestamp,
            url_encode:encodeURIComponent,
            trim: v => v.trim(),
            lower: v => v.lower(),
            upper: v => v.upper(),
            env:env,
            no_accents : stringSce.removeAccents
        }
    }

    // add a custom pipe filter
    addFilter(k,f) {
        this.pipes[k] = f;
    }

    _mapPattern(pattern,obj)
    {
        let aPipes = pattern.split('|'); // supports yyy.xxx|id|lower|base64
        let patt = aPipes.shift(); 
        let attribs = patt.split('.'); // supports yyy.xxx
        
        // walk the object tree
        let obj2 = obj;
        attribs.forEach(k=> 
            obj2 && 
                (obj2=obj2[k])
                    || ''
        );

        // now pipe the value to filters
        aPipes.forEach(pipe => {
            if(this.pipes[pipe])
                obj2 = this.pipes[pipe](obj2);
            else
                throw new Error("invalid ammping pattern, unknown pipe "+pipe);
        });
        
        return obj2;
    }

    mapFieldMacros(fname,obj,map) {
        let pattern = map[fname];

        if(!pattern)
            return obj[fname]||null;

        if(pattern.startsWith && pattern.startsWith('='))
        {
            pattern = pattern.trim().slice(1);
            pattern = pattern || fname; // supports = or =name

            return this._mapPattern(pattern,obj);
        }       

        const rep =pattern.replace(/[%]([a-z 0-9_|]+)[%]/gi,
            (match,p1) => { 
                return this._mapPattern(p1,obj);
            });

        return rep;    
    }

    mapObj(map,from)
    {
        let to = {};

        objectSce.forEachSync(map,(v,k) => {
            if(typeof v =="string")
                to[k] = this.mapFieldMacros(k,from,map)
            else  if(typeof v =="object")
                to[k] = this.mapObj(v,from);
        });

        return to;
    }
}

// private functions
function formatId(itemId) {
    itemId = itemId.replace(/[_\-.\s]/g,"-");
    itemId = stringSce.removeAccents(itemId);
  
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
    return process.argv[v];
}

function include(path) {
    return config.loadConfig(path);
}

module.exports = new MapSce();
