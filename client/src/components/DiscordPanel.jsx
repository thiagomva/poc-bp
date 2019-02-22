import React, { Component } from 'react';
import { server_url } from '../config';
import Axios from 'axios';
import { loadUserData} from 'blockstack';

export default class DiscordPanel extends Component {
    constructor(props) {
        super(props);

        this.state = {
            subscribers: [],
            discordRoles: []
        };
    }

    render() {
        return(
            <div>
                <div className="card">
                    <div className="card-body discord-panel">
                        <div>Enable access to your server to add Discord role to your benefits.</div>
                        <div>Gives BitPatrons access to selected role on Discord.</div>
                        <div className="icon-btn discord-btn text-center my-5">
                            <div className={(this.userAlreadyConfiguredDiscord()) ? "btn btn-primary disabled" : "btn btn-primary"} onClick={e => {this.handleConnectToDiscord()}}>
                                <span>{this.userAlreadyConfiguredDiscord() ? "CONNECTED TO " : "CONNECT TO "}</span><img src="./images/icons/Icon_Discord_02.png"/>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="subscribers-title">
                    Active subscribers
                </div>
                <table className="table table-sm">
                    <thead className="thead-dark">
                        <tr>
                            <th scope="col">Username</th>
                            <th scope="col">Payment Date</th>
                            <th scope="col">Discord Username</th>
                            <th scope="col">Discord Email</th>
                            <th scope="col">Active Util</th>
                        </tr>
                    </thead>
                    <tbody>
                        {this.state.subscribers.map(subscriber => (
                        <tr key={subscriber.SubscriberUsername}>
                            <th scope="row">{subscriber.SubscriberUsername}</th>
                            <td>{this.formatToDate(subscriber.PaymentDate)}</td>
                            <td>{subscriber.DiscordUsername}</td>
                            <td>{subscriber.DiscordEmail}</td>
                            <td>{this.formatToDate(subscriber.ExpirationDate)}</td>
                        </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    }

    userAlreadyConfiguredDiscord(){
        return false;
    }

    handleConnectToDiscord(){

    }

    formatToDate(date){
        return new Date(date).toLocaleDateString({}, { year: 'numeric', month: 'short', day: 'numeric'})
    }

    componentWillMount(){
        this.listSubscribers();
        if (this.userAlreadyConfiguredDiscord()) {
            this.listRoles();
        }
    }

    listRoles(){
        var config={headers:{}};
        if(loadUserData()){
            config.headers["blockstack-auth-token"] = loadUserData().authResponseToken;
            
            var url = server_url + '/api/v1/discord/roles';
            Axios.get(url, config).then(response => {
                this.setState({discordRoles: response.data});
            });
        }
    }

    listSubscribers(){
        var config={headers:{}};
        if(loadUserData()){
            config.headers["blockstack-auth-token"] = loadUserData().authResponseToken;
            
            var url = server_url + '/api/v1/charges/subscribers';
            Axios.get(url, config).then(response => {
                this.setState({subscribers: response.data});
            });
        }
    }
}