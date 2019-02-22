import React, { Component } from 'react';
import { server_url } from '../config';
import Axios from 'axios';
import { loadUserData} from 'blockstack';
import { discord_auth_url } from '../config';


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
                        <div className="icon-btn discord-btn text-center mt-5">
                            <div className={(this.userAlreadyConfiguredDiscord()) ? "btn btn-primary disabled" : "btn btn-primary"} onClick={e => {this.handleConnectToDiscord()}}>
                                <span>{this.userAlreadyConfiguredDiscord() ? "CONNECTED TO " : (this.props.discordInfo ? "CONNECT TO " : "LOADING...")}</span>{this.props.discordInfo && <img src="./images/icons/Icon_Discord_02.png"/>}
                            </div>
                        </div>
                        {this.userAlreadyConfiguredDiscord() && 
                        <div className="icon-btn discord-btn text-center mb-5">
                            <div className="btn btn-link new-server my-1" onClick={e => {this.handleConnectToNewDiscordServer()}}>
                                <span>Connect to new discord server</span>
                            </div>
                        </div>
                        }
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
        return this.props.discordInfo && this.props.discordInfo.hasDiscord;
    }

    handleConnectToDiscord(){
        if(!this.userAlreadyConfiguredDiscord()){
            this.handleConnectToNewDiscordServer();
        }
    }

    handleConnectToNewDiscordServer(){
        if(this.props.discordInfo){
            var redirectUri = window.location.origin + "/discordAuth/owner";
            var url = discord_auth_url.
                    replace("{RESPONSE_TYPE}", "code").
                    replace("{CLIENT_ID}", this.props.discordInfo.clientId).
                    replace("{REDIRECT_URI}", redirectUri).
                    replace("{STATE}", loadUserData().username).
                    replace("{SCOPE}", "bot");
            window.location = url + "&permissions=268435457";
        }
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

    saveSelectedRole() {
        var config={headers:{}};
        if(loadUserData()){
            config.headers["blockstack-auth-token"] = loadUserData().authResponseToken;

            var data = {
                roleId: this.state.selectedRoleId,
                roleName: this.state.selectedRoleName
            };
            
            var url = server_url + '/api/v1/discord/roles';
            Axios.patch(url, data, config).then(response => {
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