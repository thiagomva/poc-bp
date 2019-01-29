import React, { Component } from 'react';
import Topbar from './TopBar.jsx';
import {
    loadUserData
  } from 'blockstack';

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
}