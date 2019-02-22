var JsonTokens = require('jsontokens');
var PageInfoData = require('../data/pageInfoData.js');
var DiscordPageInfoData = require('../data/discordPageInfoData.js');
var DiscordApiData = require('../data/discordApiData.js');
var SubscriberData = require('../data/subscriberData.js');
var PeriodType = require('./periodType.js');

class Pages {
    constructor(jwt, userBlockstackId, pageName, pageDescription, numberOfPosts, monthlyPrice, yearlyPrice,email, quarterlyPrice, halfYearlyPrice) {
        this.jwt = jwt;
        this.userBlockstackId = userBlockstackId;
        this.pageName = pageName ? pageName : '';
        this.pageDescription = pageDescription ? pageDescription : '';
        this.numberOfPosts = numberOfPosts ? numberOfPosts : 0;
        this.monthlyPrice = monthlyPrice;
        this.yearlyPrice = yearlyPrice;
        this.quarterlyPrice = quarterlyPrice;
        this.halfYearlyPrice = halfYearlyPrice;
        this.email = email;
    }

    listPages(cb) {
        new PageInfoData().list().then(result => {
            result = result.map(function(item) { 
                item = item.toJSON();
                delete item.jwt; 
                delete item.email;
                return item; 
            });
            cb(null, result);
        }).catch(err => cb(err));
    }

    getPageDiscordInfo(username, blockstackAuthToken, cb) {
        var decodedTokenPayload = (0, JsonTokens.decodeToken)(blockstackAuthToken).payload;
        var loggedUsername = decodedTokenPayload.username;
        var pageDiscordInfo = {
            hasDiscord: false,
            userAlreadyJoined: false
        }
        new DiscordPageInfoData().get(username).then(result => {
            pageDiscordInfo.hasDiscord = result && result.roleId;
            if(pageDiscordInfo.hasDiscord){
                new SubscriberData().getValid(username,loggedUsername).then(result => {
                    if(result && result.length > 0){
                        var subscriber = result[0];
                        var guildMemberUrl = "guilds/"+subscriber.guildId+"/members/"+subscriber.discordId;
                        new DiscordApiData().get(guildMemberUrl).then(result => {
                            pageDiscordInfo.userAlreadyJoined=true;
                            cb(null, pageDiscordInfo);
                        }).catch(e => {
                            cb(null, pageDiscordInfo);
                        })
                    }
                    else{
                        cb(null, pageDiscordInfo);
                    }
                })
            }
            else{
                cb(null, pageDiscordInfo);
            }
        }).catch(err => cb(err));
    }

    getNumberOfPostsResult(cb){
        var pageInfoData = new PageInfoData();
        var _this = this;
        pageInfoData.get(this.userBlockstackId).then(pageInfo => {
            if (_this.numberOfPosts != null) {
                pageInfo.numberOfPosts = _this.numberOfPosts;
            }
            pageInfoData.update(pageInfo).then(result => cb(null, null)).catch(err => cb(err));
        }).catch(err => cb(err));
    }

    getPagesResult(cb) {
        var pageInfoData = new PageInfoData();
        var _this = this;
        pageInfoData.get(this.userBlockstackId).then(pageInfo => {
            var shouldCreate = !pageInfo;
            if(shouldCreate){
                pageInfo = {};
            }

            pageInfo.username = _this.userBlockstackId;
            
            if(_this.jwt) {
                pageInfo.jwt = _this.jwt;
            }

            if(_this.pageName) {
                pageInfo.pageName = _this.pageName;
            }

            if(_this.pageDescription) {
                pageInfo.pageDescription = _this.pageDescription;
            }

            if (_this.numberOfPosts != null) {
                pageInfo.numberOfPosts = _this.numberOfPosts;
            }

            if (_this.monthlyPrice != null) {
                pageInfo.monthlyPrice = _this.monthlyPrice;
            }

            if (_this.yearlyPrice != null) {
                pageInfo.yearlyPrice = _this.yearlyPrice;
            }

            if (_this.quarterlyPrice != null) {
                pageInfo.quarterlyPrice = _this.quarterlyPrice;
            }

            if (_this.halfYearlyPrice != null) {
                pageInfo.halfYearlyPrice = _this.halfYearlyPrice;
            }

            if (_this.email != null) {
                pageInfo.email = _this.email;
            }
            if(shouldCreate){
                pageInfoData.insert(pageInfo).then(result => cb(null, null)).catch(err => cb(err));
            }
            else{
                pageInfoData.update(pageInfo).then(result => cb(null, null)).catch(err => cb(err));
            }
        }).catch(err => cb(err));
    }

    static GetPriceFromPeriodType(periodType, pageInfo){
        if(periodType == PeriodType.MONTHLY){
            return pageInfo.monthlyPrice;
        }
        else if(periodType == PeriodType.QUARTERLY){
            return pageInfo.quarterlyPrice;
        }
        else if(periodType == PeriodType.HALF_YEARLY){
            return pageInfo.halfYearlyPrice;
        }
        else if(periodType == PeriodType.YEARLY){
            return pageInfo.yearlyPrice;
        }
        return null;
    }
}

module.exports = Pages;