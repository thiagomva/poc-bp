var DiscordApiData = require('../data/discordApiData.js');
var JsonTokens = require('jsontokens');
var DiscordSubscriberInfoData = require('../data/discordSubscriberInfoData.js');
var DiscordPageInfoData = require('../data/discordPageInfoData.js');
var SubscriberData = require('../data/subscriberData.js');
var nconf = require('nconf');
var Charges = require('./Charges.js');

class Discord {
    constructor() {
    }

    getAccessToken(code, guild_id, authToken, cb) {
        var body = {
            client_id: nconf.get("DISCORD_CLIENT_ID"),
            client_secret: nconf.get("DISCORD_CLIENT_SECRET"),
            grant_type: 'authorization_code',
            code: code,
            redirect_uri: 'https://bitpatron.co'
        };

        new DiscordApiData().post('oauth2/token', body).then(
            result => {
                var loggedUsername = this.getUsernameFromAuthToken(authToken);
                var discordPageInfoData = new DiscordPageInfoData();
                var currentTime = new Date();
                var expiration = new Date(currentTime.setSeconds(currentTime.getSeconds() + result.expires_in));

                var discordPageInfo = {
                    username: loggedUsername, 
                    guildId: guild_id, 
                    accessToken: result.access_token,
                    refreshToken: result.refresh_token, 
                    expirationDate: expiration
                };

                discordPageInfoData.insert(discordPageInfo);

                cb(null, result)
        }).catch(e => cb(e));
    }

    joinServer(json, authToken, cb) {
        var loggedUsername = this.getUsernameFromAuthToken(authToken);
        var pageUsername = json.pageUsername;
        var discordAuthorization = json.discordAuthorization;

        new Charges().getUserPayment(loggedUsername, pageUsername).then(
            charge => {
                if(!charge){
                    throw new Error("payment not found");
                }
                new DiscordApiData().get('/users/@me', discordAuthorization, 'Bearer').then(
                    result => {
                        this.saveDiscordSubscriberInfo(result).then(() => {
                            this.saveSubscriber(charge, pageUsername, result.id).then(() => {
                                this.addSubscriberToDiscord(result.id, pageUsername, discordAuthorization).then(r=> cb(null,null)).catch(err => cb(err))
                            }).catch(err => cb(err))
                        }).catch(err => cb(err));
                    }   
                ).catch(err => cb(err))
            }
        ).catch(err => cb(err));
    }

    addSubscriberToDiscord(discordId, pageUsername,discordAuthorization){
        return new Promise(function(resolve,reject){
            var discordPageInfoData = new DiscordPageInfoData();
            discordPageInfoData.get(pageUsername).then(result => {
                var discordApi = new DiscordApiData();
                var guildMemberUrl = "guilds/"+result.guildId+"/members/"+discordId;
                var requestBody = {
                    access_token: discordAuthorization,
                    roles: [result.roleId]
                };
                var botAccessToken = nconf.get('DISCORD_BOT_AUTH_TOKEN');
                discordApi.get(guildMemberUrl, botAccessToken, 'Bot').then(result => {
                    requestBody.roles = result.roles.concat(requestBody.roles);
                    discordApi.patch(guildMemberUrl, requestBody, botAccessToken, 'Bot').then(e=>resolve()).catch(e=>reject(e));
                }).catch(error => {
                    if(error && error.response && error.response.status == 404){
                        discordApi.put(guildMemberUrl, requestBody, botAccessToken, 'Bot').then(e=>resolve()).catch(e=>reject(e));
                    }
                    else{
                        reject(e);
                    }
                })
            }).catch(e=>reject(e))
        });
    }

    saveSubscriber(charge, pageUsername, discordId){
        return new Promise(function(resolve,reject){
            var subscriberData = new SubscriberData();
            subscriberData.get(charge.chargeId, pageUsername, discordId).then(subscriber => {
                var shouldCreate = !subscriber;
                if(shouldCreate){
                    subscriber = {};
                }
                subscriber.chargeId = charge.chargeId;
                subscriber.pageUsername = pageUsername;
                subscriber.discordId = discordId;
                subscriber.expirationDate = Charges.GetExpirationDateFromCharge(charge);
                if(shouldCreate){
                    subscriberData.insert(subscriber).then(()=>resolve()).catch(e => reject(e));
                }
                else{
                    subscriberData.update(subscriber).then(()=>resolve()).catch(e => reject(e));
                }
            }).catch(e => reject(e));
        });
    }

    saveDiscordSubscriberInfo(discordResult){
        return new Promise(function(resolve, reject){
            var discordSubscriberInfoData = new DiscordSubscriberInfoData();
            discordSubscriberInfoData.get(discordResult.id).then(
            discordSubscriberInfo => {
                var shouldCreate = !discordSubscriberInfo;
                if(shouldCreate){
                    discordSubscriberInfo = {};
                }

                discordSubscriberInfo.discordId = discordResult.id;
                discordSubscriberInfo.email = discordResult.email;
                discordSubscriberInfo.username = discordResult.username;
                if(shouldCreate){
                    discordSubscriberInfoData.insert(discordSubscriberInfo).then(()=> resolve()).catch((e) => reject(e));
                }
                else{
                    discordSubscriberInfoData.update(discordSubscriberInfo).then(() => resolve())
                }
            }).catch((e) => reject(e));
        });
    }

    listRoles(authToken, cb) {
        var loggedUsername = this.getUsernameFromAuthToken(authToken);

        var discordPageInfoData = new DiscordPageInfoData();

        discordPageInfoData.get(loggedUsername).then(discordPageInfo => {
            var path = 'guilds/' + discordPageInfo.guildId + '/roles';

            new DiscordApiData().get(path, nconf.get('DISCORD_BOT_AUTH_TOKEN'), 'Bot').then(
                result => {
                    cb(null, result);
                }).catch(e => cb(e));
        });
    }

    updateRole(roleId, roleName, authToken, cb) {
        var loggedUsername = this.getUsernameFromAuthToken(authToken);

        var discordPageInfoData = new DiscordPageInfoData();

        discordPageInfoData.get(loggedUsername).then(discordPageInfo => {
            discordPageInfo.roleId = roleId;
            discordPageInfo.roleName = roleName;
            
            discordPageInfoData.update(discordPageInfo).then(
                result => {
                    cb(null, result);
                }).catch(e => cb(e));
        });
    }

    getUsernameFromAuthToken(authToken) {
        var decodedTokenPayload = (0, JsonTokens.decodeToken)(authToken).payload;
        return decodedTokenPayload.username;
    }
}

module.exports = Discord;