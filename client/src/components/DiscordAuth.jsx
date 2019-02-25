import React, { Component } from 'react';
import queryString from 'query-string';
import { server_url } from '../config';
import Axios from 'axios';
import {
  loadUserData,
} from 'blockstack';

export default class DiscordAuth extends Component {
  constructor(props) {
    super(props);
    
  	this.state = {      
    };
  }

  render() {
    return (<div className="discord-auth-msg">Joining Discord Channel... You will be redirected when it's done.</div>);
  }

  componentWillMount() {
    var config={headers:{}};
    config.headers["blockstack-auth-token"] = loadUserData().authResponseToken;
    if(this.props.match.params.owner){
      var parsed = queryString.parse(this.props.location.search);
      var data = {
        code: parsed.code,
        guildId: parsed.guild_id,
        redirectUri: window.location.origin + window.location.pathname
      };

      var url = server_url + '/api/v1/discord/';
      Axios.post(url, data, config).then(response => {
        window.location = window.location.origin + "/" + parsed.state + "?discord=true";
      });
    }
    else{  
      var parsed = queryString.parse(this.props.location.hash);
      var data = {
        pageUsername: parsed.state,
        discordAuthorization: parsed.access_token
      };
      
      var url = server_url + '/api/v1/discord/join';
      Axios.post(url, data, config).then(response => {
        window.location = parsed.state;
      });
    }
  }
}
