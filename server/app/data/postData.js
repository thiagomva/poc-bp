const Sequelize = require('sequelize');
var DataAccess = require("./dataAccess.js");

class PostData{
    constructor(){
        this.Post = DataAccess.define('Post', {
            name:{
                type: Sequelize.INTEGER,
                primaryKey: true
            },
            username: {
                type: Sequelize.STRING(50),
                primaryKey: true
            },
            title: Sequelize.STRING(200),
            description: Sequelize.STRING(1000),
            isPublic: Sequelize.BOOLEAN,
            postTime: Sequelize.DECIMAL
        });
    }
    insert(post){
        return this.Post.create(post);
    }
    get(name, username){
        return this.Post.findOne({where:{ name: name, username: username }});
    }
    update(post){
        return post.update(post, { where: { name: post.name, username: post.username }, fields: post.changed() });
    }
    list(pageSize, lastPostTime){
        var where = {};
        if(lastPostTime){
            where.postTime = {[Sequelize.Op.lt]: lastPostTime}
        }

        return this.Post.findAll({where: where,
            limit: pageSize,
            order:[['postTime', 'DESC']]});
    }
}

module.exports = PostData;