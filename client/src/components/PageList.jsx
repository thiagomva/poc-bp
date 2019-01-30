import React, { Component } from 'react';
import Topbar from './TopBar.jsx';
import {
    loadUserData
  } from 'blockstack';
import Axios from 'axios';
import { server_url } from '../config';

export default class PageList extends Component {
    constructor(props) {
        super(props);

        this.state = {
            pages: {}
        }
    }

    render() {
        const { handleSignOut } = this.props;
        return (
            <div>
                <Topbar handleSignOut={handleSignOut} username={loadUserData().username}/>
                <div>Page List Works!</div>
            </div>
        );
    }

    fetchData() {
        var url = server_url + '/api/v1/pages';

        Axios.get(url).then(response => {
            this.state.pages = response;
          });
    }
}