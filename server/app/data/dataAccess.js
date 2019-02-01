const Sequelize = require('sequelize');
const config = require('nconf');
const sequelize = new Sequelize(config.get("DB_NAME"), config.get("DB_USER"), config.get("DB_PASSWORD"), {
    host: config.get("DB_HOST"),
    dialect: 'mssql',
    dialectOptions:{
        encrypt: true
    },
    operatorsAliases: false,
    define:{
        timestamps:false,
        freezeTableName: true
    } 
});

module.exports = sequelize;