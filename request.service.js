const debug = require("@nxn/debug")('request');
var axios = require("axios");

class RequestInstance
{
    constructor(inst) {
        this.config = config || {};
    }

    init(config) {
        this.config = config;
    }

    put(url, payload,headers,method="put") {
        return this.post(url, payload,headers,method);
    }

    post(url, payload,headers,method="post") {

        let self = this;

        return new Promise(async function(resolve, reject) 
        {

            // get Auth/Bearer header
            const reqMeta = await jwt.getRequestMetadataAsync();

            var headers = { 
                "content-type": "application/json",
                ...headers // NB. new syntax ES6
            };

            method = method.toUpperCase();

            RequestP({
                uri: url,
                method: method,
                headers: headers,
                body: payload,
                json:true
            })
            .then((data)=>
            {
                resolve(data);
            })
            .catch( (resp)=>{
                reject(resp.error);
            });

        });
    }

    _send(url, params=null, data=null, method=null, headers=null, json=true) {

        let self = this;

        return new Promise(async function(resolve, reject) 
        {
            if(!method)
                if(!data)
                    method='get';
                else
                    method='post';

            method = method.toUpperCase();

            if(!headers)
                headers = {};

            if(json)
                headers["content-type"] = "application/json";

            RequestP({
                uri: url,
                method: method,
                headers: headers,
                body: payload,
                json:true
            })
            .then((data)=>
            {
                resolve(data);
            })
            .catch( (resp)=>{
                reject(resp.error);
            });

        });

    }

    get(url,headers) 
    {
        let self = this;

        return new Promise(async function(resolve, reject) 
        {
            var headers = { 
                "content-type": "application/json",
                ...headers // NB. new syntax ES6
            };

            RequestP({
                uri: url,
                method: 'GET',
                headers: headers,
                json:true
            })
            .then((data)=>
            {
                resolve(data);
            })
            .catch( (resp)=>{
                reject(resp.error);
            });

        });
    }

    delete(url,headers) 
    {
        let self = this;

        return new Promise(async function(resolve, reject) 
        {
            var headers = { 
                "content-type": "application/json",
                ...headers // NB. new syntax ES6
            };

            RequestP({
                uri: url,
                method: 'DELETE',
                headers: headers,
                // body: payload,
                json:true
            })
            .then((data)=>
            {
                resolve(data);
            })
            .catch( (resp)=>{
                reject(resp.error);
            });
        });
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

        return (this.instances[instName] = new RequestInstance(instName));
    }
}
