const Sequelize = require('sequelize');
var DataAccess = require("./dataAccess.js");

class PageInfoData{
    constructor(){
        this.PageInfo = DataAccess.define('PageInfo', {
            username: {
                type: Sequelize.STRING(50),
                primaryKey: true
            },
            jwt: Sequelize.STRING(1000),
            pageName: Sequelize.STRING(50),
            pageDescription: Sequelize.STRING(300),
            numberOfPosts: Sequelize.INTEGER,
            monthlyPrice: Sequelize.DOUBLE,
            yearlyPrice: Sequelize.DOUBLE,
            email: Sequelize.STRING(100)
        });
    }
    insert(pageInfo){
        return this.PageInfo.create(pageInfo);
    }
    update(pageInfo){
        return pageInfo.update(pageInfo, { where: { username: pageInfo.username }, fields: pageInfo.changed() });
    }
    get(username){
        return this.PageInfo.findById(username);
    }
    list(){
        return this.PageInfo.findAll();
    }
}

module.exports = PageInfoData;