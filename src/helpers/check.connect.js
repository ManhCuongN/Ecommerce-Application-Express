'use strict'

const mongoose = require('mongoose')
const _SECOND = 5000
const os = require('os')
const process = require('process')

const countConnect = () => {
    const numConnect = mongoose.connections.length
    return numConnect
}

//check over load
const checkOverload = () => {
    setInterval(()=> {
    const numConnect = mongoose.connections.length
    const numCores = os.cpus().length
    const memoryUsage = process.memoryUsage().rss;
    //Example maximum 
    const maxConnections = numCores * 5
    console.log(`Active Connections::${numConnect}`);
    console.log(`Memory Usage:: ${memoryUsage / 1024 /1024} MB`);
    
    if(numConnect > maxConnections) {
        console.log(`Connection overload detected`);
    }  
    }, _SECOND)
}

module.exports = {countConnect, checkOverload}