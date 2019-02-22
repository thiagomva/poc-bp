const Sequelize = require('sequelize');
var DataAccess = require("./dataAccess.js");

class DiscordSubscriberInfoData{
    constructor(){
        this.DiscordSubscriberInfo = DataAccess.define('DiscordSubscriberInfo', {
            discordId: {
                type: Sequelize.STRING(50),
                primaryKey: true
            },
            email: Sequelize.CHAR(100),
            username: Sequelize.CHAR(50),
            blockstackUsername: Sequelize.CHAR(50)
        });
    }
    insert(discordSubscriberInfo){
        return this.DiscordSubscriberInfo.create(discordSubscriberInfo);
    }
    get(discordId){
        return this.DiscordSubscriberInfo.findOne({where:{ discordId: discordId }});
    }
    update(discordSubscriberInfo){
        return discordSubscriberInfo.update(discordSubscriberInfo, { where: { discordId: discordSubscriberInfo.discordId }, fields: discordSubscriberInfo.changed() });
    }
}

module.exports = DiscordSubscriberInfoData;