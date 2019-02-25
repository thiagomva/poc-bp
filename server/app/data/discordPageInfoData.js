const Sequelize = require('sequelize');
var DataAccess = require("./dataAccess.js");

class DiscordPageInfoData{
    constructor(){
        this.DiscordPageInfo = DataAccess.define('DiscordPageInfo', {
            username: {
                type: Sequelize.STRING(50),
                primaryKey: true
            },
            guildId: Sequelize.STRING(50),
            accessToken: Sequelize.STRING(50),
            refreshToken: Sequelize.STRING(50),
            expirationDate: Sequelize.DATE,
            roleId: Sequelize.STRING(50),
            roleName: Sequelize.STRING(50)
        });
    }
    insert(discordPageInfo){
        return this.DiscordPageInfo.create(discordPageInfo);
    }
    update(discordPageInfo){
        return discordPageInfo.update(discordPageInfo, { where: { username: discordPageInfo.username }, fields: discordPageInfo.changed() });
    }
    get(username){
        return this.DiscordPageInfo.findByPk(username);
    }
    list(){
        return this.DiscordPageInfo.findAll();
    }
}

module.exports = DiscordPageInfoData;