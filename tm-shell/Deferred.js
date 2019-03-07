#!/usr/bin/env node
'use strict';

/**
 * 封装promise类
 */
class Deferred {

    constructor(){
        this.promise = new Promise((resolve, reject)=>{
            this._resolve = resolve;
            this._reject = reject;
        });
    }

    resolve(value){
        this._resolve.call(this.promise, value)
    }

    reject(reason){
        this._reject.call(this.promise, reason);
    }
}

module.exports = Deferred
