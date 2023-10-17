'use strict'

const mongoose = require('mongoose')
const connectString = `mongodb+srv://admin:admin@cluster0.nxcyn.mongodb.net/eCommerce-DATN?retryWrites=true&w=majority`

class Database {
    constructor (){
        this.connect()
    }

    //connect
    connect(type='mongodb') {
        if(1===1) {
            mongoose.set('debug', true)
            mongoose.set('debug',{color: true})
        }
        mongoose.connect(connectString,{
            maxPoolSize: 50
        })
        .then(_ => 
            
            console.log("Connect Database Success"))
        .catch((err) => console.log("Error Connect!", err))                              
    }

    static getInstance() {
        if(!Database.instance) {
            Database.instance = new Database()
        }
        return Database.instance
    }
}

const instanceMongodb = Database.getInstance()
module.exports = instanceMongodb