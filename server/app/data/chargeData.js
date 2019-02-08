const Sequelize = require('sequelize');
var DataAccess = require("./dataAccess.js");

class ChargeData{
    constructor(){
        this.Charge = DataAccess.define('Charge', {
            chargeId: {
                type: Sequelize.CHAR(36),
                primaryKey: true
            },
            username: Sequelize.STRING(50),
            appPublicKey: Sequelize.CHAR(66),
            status: Sequelize.STRING(15),
            periodType: Sequelize.INTEGER,
            subscriberUsername: Sequelize.STRING(50),
            amount: Sequelize.FLOAT,
        });
    }
    insert(charge){
        return this.Charge.create(charge);
    }
    update(charge){
        return charge.update(charge, { where: { chargeId: charge.chargeId }, fields: charge.changed() });
    }
    listPending(appPublicKey){
        const ne = Sequelize.Op.ne;
        return this.Charge.findAll({where: {
            appPublicKey: appPublicKey,
            status: {[ne]:"paid"}
        }});
    }
    listPaidFromUser(username){
        return this.Charge.findAll({where: {
            username: username,
            status: "paid"
        }});
    }
    listAllPending(){
        const ne = Sequelize.Op.ne;
        return this.Charge.findAll({where: {
            status: {[ne]:"paid"}
        }});
    }
    get(chargeId){
        return this.Charge.findById(chargeId);
    }
}

module.exports = ChargeData;