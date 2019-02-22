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
    return (<div></div>);
  }

  componentWillMount() {
    var parsed = queryString.parse(this.props.location.hash);
    console.log(parsed);
    var data = {
      pageUsername: parsed.state,
      discordAuthorization: parsed.access_token
    };
    var config={headers:{}};
    config.headers["blockstack-auth-token"] = loadUserData().authResponseToken;
    var url = server_url + '/api/v1/discord/join';
    Axios.post(url, data, config).then(response => {
      window.location = parsed.state;
    });
  }
}
