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
            paymentDate: Sequelize.DATE,
            expirationDate: Sequelize.DATE,
            withdrawalDate: Sequelize.DATE,
            blockstackStatus: Sequelize.INTEGER
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
    listPaidAndProcessingFromUserAndSubscriber(username, subscriberUsername){
        const ne = Sequelize.Op.ne;
        return this.Charge.findAll({where: {
            username: username,
            subscriberUsername: subscriberUsername,
            status: {[ne]:"unpaid"}
        }});
    }
    listAllPending(){
        const ne = Sequelize.Op.ne;
        return this.Charge.findAll({where: {
            status: {[ne]:"paid"}
        }});
    }
    listAllProcessingAndPaid(){
        const ne = Sequelize.Op.ne;
        return this.Charge.findAll({where: {
            status: {[ne]:"unpaid"}
        }});
    }
    listAllProcessingAndPaidAndPendingBlockstack(){
        const ne = Sequelize.Op.ne;
        return this.Charge.findAll({where: {
            status: {[ne]:"unpaid"},
            blockstackStatus:{[Sequelize.Op.or]:{[Sequelize.Op.eq]:null, [ne]:1}}
        }});
    }
    listSubscribers(pageUsername){
        var query = "SELECT Charge.SubscriberUsername, max(DiscordSubscriberInfo.Username) AS DiscordUsername, max(DiscordSubscriberInfo.Email) AS DiscordEmail, max(Charge.ExpirationDate) AS ExpirationDate, max(Charge.PaymentDate) AS PaymentDate  FROM Charge ";
        query += " LEFT JOIN Subscriber ON Charge.ChargeId = Subscriber.ChargeId ";
        query += " LEFT JOIN DiscordSubscriberInfo ON DiscordSubscriberInfo.DiscordId = Subscriber.DiscordId ";
        query += " LEFT JOIN PageInfo ON PageInfo.Username = Subscriber.PageUsername ";
        query += " LEFT JOIN DiscordPageInfo ON DiscordPageInfo.Username = Subscriber.PageUsername ";
        query += " WHERE Charge.Status != 'unpaid'";
        query += " AND Charge.Username = :pageUsername ";
        query += " GROUP BY SubscriberUsername ORDER BY PaymentDate DESC " ;
        return DataAccess.query(query, {
            replacements:{
                pageUsername:pageUsername
            }, 
            type: Sequelize.QueryTypes.SELECT}
        );
    }
    get(chargeId){
        return this.Charge.findByPk(chargeId);
    }
}

module.exports = ChargeData;