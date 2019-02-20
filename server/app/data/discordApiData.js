const axios = require('axios');

class DiscordApiData {
    constructor(){
        this.baseDiscordUrl = 'https://discordapp.com/api/v6/';
    }

    callDiscordApi(method, path, body, authorizationType, authorizationToken){
        return new Promise(function(resolve, reject){
            var url = this.baseDiscordUrl + path;
            var contentType = 'application/json';
            if(method == 'POST'){
                contentType = 'application/x-www-form-urlencoded'
            }
            let httpConfig = {
                headers: {
                    'Content-Type': contentType
                }
            };
            if(authorizationType && authorizationToken){
                httpConfig.headers['Authorization'] = authorizationType + ' '+ authorizationToken;
            }

            var apiPromise = null;
            if(method == 'POST'){
                apiPromise = axios.post(url, body, httpConfig);
            }else if(method == 'PUT'){
                apiPromise = axios.put(url, body, httpConfig);
            }else if(method == 'GET'){
                apiPromise = axios.get(url, httpConfig);
            }else if(method == 'PATCH'){
                apiPromise = axios.patch(url, body, httpConfig);
            }else if(method == 'DELETE'){
                apiPromise = axios.post(url, httpConfig);
            }
            
            apiPromise.then(response => {
                resolve(response);
            })
            .catch(reject);
        });
    }

    post(path, reqBody) {
        return callDiscordApi('POST', path, reqBody);
    }

    get(path, authorizationToken, authorizationType){
        return callDiscordApi('GET', path, null, authorizationToken, authorizationType);
    }

    delete(path, authorizationToken, authorizationType){
        return callDiscordApi('DELETE', path, null, authorizationToken, authorizationType);
    }

    put(path, body, authorizationToken, authorizationType){
        return callDiscordApi('PUT', path, body, authorizationToken, authorizationType);
    }

    patch(path, body, authorizationToken, authorizationType){
        return callDiscordApi('PATCH', path, body, authorizationToken, authorizationType);
    }
}

module.exports = DiscordApiData;