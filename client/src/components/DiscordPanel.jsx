import React, { Component } from 'react';

export default class DiscordPanel extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return(
            <div className="card">
                <div className="card-body discord-panel">
                    <div>Enable access to your server to add Discord roles to your benefits. Gives BitPatrons access to selected roles on Discord.</div>
                </div>
            </div>
        );
    }
}