var config = require('nconf');
var Error = require('../util/error.js');
var PageInfoData = require('../data/pageInfoData.js');
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