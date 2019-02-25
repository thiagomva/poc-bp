const Sequelize = require('sequelize');
var DataAccess = require("./dataAccess.js");

class SubscriberData{
    constructor(){
        this.Subscriber = DataAccess.define('Subscriber', {
            chargeId:{
                type: Sequelize.CHAR(36),
                primaryKey: true
            },
            pageUsername: {
                type: Sequelize.STRING(50),
                primaryKey: true
            },
            discordId: {
                type: Sequelize.STRING(50),
                primaryKey: true
            }
        });
    }
    insert(subscriber){
        return this.Subscriber.create(subscriber);
    }
    get(chargeId, pageUsername, discordId){
        return this.Subscriber.findOne({where:{ chargeId: chargeId, pageUsername: pageUsername, discordId: discordId }});
    }
    getValid(pageUsername, subscriberUsername){
        var query = "SELECT DiscordPageInfo.GuildId, Subscriber.DiscordId FROM Charge ";
        query += " INNER JOIN Subscriber ON Charge.ChargeId = Subscriber.ChargeId ";
        query += " INNER JOIN PageInfo ON PageInfo.Username = Subscriber.PageUsername ";
        query += " INNER JOIN DiscordPageInfo ON DiscordPageInfo.Username = Subscriber.PageUsername ";
        query += " WHERE Charge.ExpirationDate > :currentDate " ;
        query += " AND Charge.SubscriberUsername = :subscriberUsername " ;
        query += " AND Charge.Username = :pageUsername " ;
        return DataAccess.query(query, {
            replacements:{
                pageUsername:pageUsername, 
                subscriberUsername:subscriberUsername, 
                currentDate: new Date()
            }, 
            type: Sequelize.QueryTypes.SELECT}
        );
    }

    update(subscriber){
        return subscriber.update(subscriber, { where: { chargeId: subscriber.chargeId, pageUsername: subscriber.pageUsername, discordId: subscriber.discordId }, fields: subscriber.changed() });
    }
}

module.exports = SubscriberData;