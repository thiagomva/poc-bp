import React, { Component } from 'react';
import { server_url } from '../config';
import Axios from 'axios';
import { loadUserData} from 'blockstack';
import { discord_auth_url } from '../config';
import Modal from 'react-bootstrap/Modal';


export default class DiscordPanel extends Component {
    constructor(props) {
        super(props);

        this.handleClose = this.handleClose.bind(this);

        this.state = {
            subscribers: [],
            discordRoles: [],
            showModal: false,
            selectedRoleId:"",
            selectedRoleName:"",
            savedRole: false
        };
    }

    handleClose() {
        this.setState({ showModal: false });
    }

    render() {
        return(
            <div>
                <div className="card">
                    <div className="card-body discord-panel mb-4">
                        <div>Enable access to your server to add Discord role to your benefits.</div>
                        <div>Gives BitPatrons access to selected role on Discord.</div>
                        <div className="icon-btn discord-btn text-center mt-5">
                            <div className={(this.userAlreadyConfiguredDiscord()) ? "btn btn-primary disabled" : "btn btn-primary"} onClick={e => {this.handleConnectToDiscord()}}>
                                <span>{this.userAlreadyConfiguredDiscord() ? "CONNECTED TO " : (this.props.discordInfo ? "CONNECT TO " : "LOADING...")}</span>{this.props.discordInfo && <img src="./images/icons/Icon_Discord_02.png"/>}
                            </div>
                        </div>
                        {this.userAlreadyConfiguredDiscord() && 
                        (<div>
                            <div className="icon-btn discord-btn text-center">
                                <div className="btn btn-link new-server my-1" onClick={e => {this.handleConnectToNewDiscordServer()}}>
                                    <span>Connect to new discord server</span>
                                </div>
                            </div>
                            <div className="section-separator"></div>
                            <div>
                                <div className="give-bot-permissions-title">Give the BitPatron Bot the required permissions</div>
                                <div className="row">
                                    <div className="col-md">
                                        <div className="give-bot-permissions-description">
                                            Navigate to the Roles section of your Discord server settings.
                                        </div>
                                        <div className="give-bot-permissions-description">
                                            Find the new role "BitPatron Bot", and drag it above the role you’d like to give to your patrons.
                                        </div>
                                    </div>
                                    <div onClick={e => {this.setState({showModal:true})}} className="img-hint-div">
                                        <i className="fa fa-plus-circle plus-img-icon"></i>
                                        <img className="role-config-img-sm" src="./images/RoleConfig.png"></img>
                                    </div>
                                    <Modal onClick={e => {this.setState({showModal:false})}} centered size="lg" show={this.state.showModal} onHide={this.handleClose}>
                                        <Modal.Body>
                                            <img className="role-config-img" src="./images/RoleConfig.png"></img>
                                        </Modal.Body>
                                    </Modal>
                                </div>
                            </div>
                            <div className="section-separator"></div>
                            <label className="discord-roles mr-4" htmlFor="discordRolesSelect">Discord Roles:</label>
                            <label>Gives Patrons access to selected Discord Role</label>
                            <div className="text-center">
                                <div className="form-group">
                                    <select className={this.state.savedRole ? 'form-control is-valid' : 'form-control'} value={this.state.selectedRoleId} onChange={e=>this.onSelectedRoleChanged(e)} id="discordRolesSelect">
                                        <option value="">Select role</option>
                                        {this.state.discordRoles.map(role => (
                                            <option key={role.id} value={role.id}>{role.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div onClick={e => {this.saveSelectedRole()}} className="btn btn-outline-primary">SAVE</div>
                            </div>
                        </div>)}
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

    onSelectedRoleChanged(e){
        var selectedRoleId = e.target.value;
        var selectedRoleName = this.getSelectedRoleName(selectedRoleId);
        this.setState({selectedRoleId: e.target.value, selectedRoleName: selectedRoleName, savedRole:false });
    }

    getSelectedRoleName(selectedRoleId){
        for(var i =0; i< this.state.discordRoles.length;i++){
            if(this.state.discordRoles[i].id == selectedRoleId){
                return this.state.discordRoles[i].name;
            }
        }
        return "";
    }

    userAlreadyConfiguredDiscord(){
        return this.checkIfHasDiscord(this.props);
    }

    checkIfHasDiscord(props){
        return props.discordInfo && props.discordInfo.hasDiscord;
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
    }

    componentWillReceiveProps(nextProps){
        if (!this.checkIfHasDiscord(this.props) && this.checkIfHasDiscord(nextProps)) {
            this.listRoles();
        }
    }

    listRoles(){
        var config={headers:{}};
        if(loadUserData()){
            config.headers["blockstack-auth-token"] = loadUserData().authResponseToken;
            
            var url = server_url + '/api/v1/discord/roles';
            Axios.get(url, config).then(response => {
                var discordRoles = response.data;
                var selectedRoleId = "";
                var selectedRoleName = "";
                if(this.props.discordInfo.discordRole){
                    selectedRoleId = this.props.discordInfo.discordRole.id;
                    selectedRoleName = this.props.discordInfo.discordRole.name;
                }
                this.setState({discordRoles: discordRoles, selectedRoleId: selectedRoleId, selectedRoleName: selectedRoleName});
            });
        }
    }

    saveSelectedRole() {
        if(!this.state.selectedRoleId){
            alert("Please select the discord role to give Patrons access.");
            return;
        }

        var config={headers:{}};
        if(loadUserData()){
            config.headers["blockstack-auth-token"] = loadUserData().authResponseToken;

            var data = {
                roleId: this.state.selectedRoleId,
                roleName: this.state.selectedRoleName
            };
            
            var url = server_url + '/api/v1/discord/roles';
            Axios.patch(url, data, config).then(response => {
                this.setState({savedRole: true});
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