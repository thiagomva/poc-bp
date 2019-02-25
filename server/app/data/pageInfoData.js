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
            pageDescription: Sequelize.STRING(500),
            numberOfPosts: Sequelize.INTEGER,
            monthlyPrice: Sequelize.DOUBLE,
            yearlyPrice: Sequelize.DOUBLE,
            quarterlyPrice: Sequelize.DOUBLE,
            halfYearlyPrice: Sequelize.DOUBLE,
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
        return this.PageInfo.findByPk(username);
    }
    list(){
        return this.PageInfo.findAll();
    }
}

module.exports = PageInfoData;