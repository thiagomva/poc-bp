const axios = require('axios');

class DiscordApiData {
    constructor(){
        this.baseDiscordUrl = 'https://discordapp.com/api/v6/';
    }

    postDiscord(path, reqBody, authorizationHeader) {
        var url = this.baseDiscordUrl + path;

        let httpConfig = {
            headers: {
                Authorization: authorizationHeader,
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        };

        axios.post(url, reqBody, httpConfig).then(response => {
        })
        .catch(error => { cb(error); });
    }
}

module.exports = DiscordApiData;