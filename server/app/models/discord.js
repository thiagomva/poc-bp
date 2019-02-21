var DiscordApiData = require('../data/discordApiData.js');
var JsonTokens = require('jsontokens');
var DiscordSubscriberInfoData = require('../data/discordSubscriberInfoData.js');
var DiscordPageInfoData = require('../data/discordPageInfoData.js');
var nconf = require('nconf');
var Charges = require('./charges.js');

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
                var decodedTokenPayload = (0, JsonTokens.decodeToken)(authToken).payload;
                var loggedUsername = decodedTokenPayload.username;
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
        var decodedTokenPayload = (0, JsonTokens.decodeToken)(authToken).payload;
        var loggedUsername = decodedTokenPayload.username;
        var pageUsername = json.pageUsername;
        var discordAuthorization = json.discordAuthorization;

        new Charges().getUserPayment(loggedUsername, pageUsername).then(
            charge => {
                if(!charge){
                    throw new Error("payment not found");
                }
                new DiscordApiData().get('/users/@me', discordAuthorization, 'Bearer').then(
                    result => {
                        saveDiscordSubscriberInfo(result).then(
                            saveSubscriber(charge, pageUsername, result.id).then(
                                addSubscriberToDiscord(result.id, pageUsername, discordAuthorization)
                            )
                        );
                    }   
                )
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
                discordApi.get(guildMemberUrl, result.AccessToken, 'Bot').then(result => {
                    requestBody.roles = result.roles.concat(requestBody.roles);
                    discordApi.patch(guildMemberUrl, requestBody, result.AccessToken, 'Bot').then(result);
                }).catch(error => {
                    discordApi.put(guildMemberUrl, requestBody, result.AccessToken, 'Bot').then(result);
                })
            })
        });
    }

    saveSubscriber(charge, pageUsername, discordId){
        return new Promise(function(resolve,reject){
            var subscriber = {};
            subscriber.chargeId = charge.chargeId;
            subscriber.pageUsername = pageUsername;
            subscriber.discordId = discordId;
            subscriber.expirationDate = Charges.GetExpirationDateFromCharge(charge);
            var subscriberData = new SubscriberData();
            subscriberData.insert(subscriber).then(resolve).catch(reject);
        });
    }

    saveDiscordSubscriberInfo(discordResult){
        return new Promise(function(resolve, reject){
            var discordSubscriberInfoData = new DiscordSubscriberInfoData();
            discordSubscriberInfoData.get(result.id).then(
            discordSubscriberInfo => {
                var shouldCreate = !discordSubscriberInfo;
                if(shouldCreate){
                    discordSubscriberInfo = {};
                }

                discordSubscriberInfo.id = discordResult.id;
                discordSubscriberInfo.email = discordResult.email;
                discordSubscriberInfo.username = discordResult.username;                    
                if(shouldCreate){
                    discordSubscriberInfoData.insert(discordSubscriberInfo).then(resolve).catch(reject);
                }
                else{
                    discordSubscriberInfoData.update(discordSubscriberInfo).then(resolve).catch(reject);
                }
            })
        });
    }

    listRoles(authToken, cb) {
        var decodedTokenPayload = (0, JsonTokens.decodeToken)(authToken).payload;
        var loggedUsername = decodedTokenPayload.username;

        var discordPageInfoData = new DiscordPageInfoData();

        discordPageInfoData.get(loggedUsername).then(discordPageInfo => {
            var path = 'guilds/' + discordPageInfo.guildId + '/roles';

            new DiscordApiData().get(path, nconf.get('DISCORD_BOT_AUTH_TOKEN'), 'Bot').then(
                result => {
                    cb(null, result);
                }).catch(e => cb(e));
        });
    }
}

module.exports = Discord;