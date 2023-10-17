const dev = {
    app: {
        port: process.env.DEV_APP_PORT || 3055
    },
    db: {
        host: process.env.DEV_DB_HOST || 'mongodb+srv://admin:admin@cluster0.nxcyn.mongodb.net/eCommerce-DATN?retryWrites=true&w=majority'
    }
}

const pro = {
    app: {
        port: process.env.PRO_APP_PORT || 3005
    },
    db: {
        host: process.env.PRO_DB_HOST || 'mongodb+srv://admin:admin@cluster0.nxcyn.mongodb.net/eCommerce-DATN?retryWrites=true&w=majority'
    }
}

const config = {dev, pro}
const env  = process.env.NODE_ENV || 'dev'
module.exports = config[env]