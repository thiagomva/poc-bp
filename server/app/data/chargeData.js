const Sequelize = require('sequelize');
var DataAccess = require("./dataAccess.js");

class ChargeData{
    constructor(){
        this.Charge = sequelize.define('Charge', {
            chargeId: {
                type: Sequelize.CHAR(36),
                primaryKey: true
            },
            username: Sequelize.STRING(50),
            appPublicKey: Sequelize.CHAR(66),
            status: Sequelize.STRING(15),
            periodType: Sequelize.INTEGER
        });
    }
    insert(charge){
        return this.Charge.create(charge);
    }
    listPending(appPublicKey){
        return this.Charge.findAll({where: {
            appPublicKey: appPublicKey,
            status: {[ne]:"paid"}
        }});
    }
    get(chargeId){
        return this.Charge.findById(chargeId);
    }
}

module.exports = ChargeData;