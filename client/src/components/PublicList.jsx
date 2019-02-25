import React, { Component } from 'react';
import Payment from './Payment.jsx';
import {
    loadUserData,
    getFile,
    getPublicKeyFromPrivate,
    lookupProfile,
    Person,
    decryptContent
  } from 'blockstack';
import { discord_auth_url } from '../config';
import DiscordPanel from './DiscordPanel.jsx';
import queryString from 'query-string';

const avatarFallbackImage = 'https://s3.amazonaws.com/onename/avatar-placeholder.png';

export default class PublicList extends Component {
    constructor(props) {
        super(props);

        var isSettingUpDiscord = false;
        if (this.props.location.search){
            var parsed = queryString.parse(this.props.location.search);
            isSettingUpDiscord = parsed.discord != null;
        }

        var defaultState = {
            currentFileContent:"",
            subscriptionFile: null,
            pageOwner: null,
            isLoading: false,            
            pageName: "",
            pageDescription: "",
            monthlyPrice: undefined,
            yearlyPrice: undefined,
            halfYearlyPrice: undefined,
            quarterlyPrice: undefined,
            files: {},
            pageUsername: "",
            isSettingUpDiscord: isSettingUpDiscord
        }
        var newState = this.getStateFromProps(props);
        
        this.state = Object.assign({}, defaultState, newState);

        this.subscriptionConfirmed = this.subscriptionConfirmed.bind(this);
    }

    render() {
        const { handleSignIn } = this.props;
        return (
            <div>
                <div className="row">
                    <div className="col-md-12">
                        {this.state.isLoading &&
                            <h1>Loading...</h1>
                        }
                        <div className="file-container">
                        <div className="row">
                            <div className="col-md-12 mb-2">
                                <div onClick={e => {this.activatePosts()}} className={"posts-title pull-left" + (this.state.isSettingUpDiscord ? '' : ' selected-tab')}>
                                    <i className="fa fa-bullhorn rotate-315"></i>POSTS
                                </div>
                                {this.isLoggedUserPage() && 
                                <div onClick={e => {this.activateDiscord()}} className={"posts-title pull-left" + (this.state.isSettingUpDiscord ? ' selected-tab' : '')}>
                                    <img src="/images/icons/Icon_Discord_01.png" />DISCORD
                                </div>
                                }
                                {this.isLoggedUserPage() && <div className="icon-btn pull-right">
                                    <div className='btn btn-primary' onClick={e => {this.props.handleNewPost()}}>
                                        <span>New Post</span>
                                    </div>
                                </div>}
                                {!this.isLoggedUserPage() && this.hasDiscord() &&
                                <div className="icon-btn discord-btn pull-right">
                                    <div title={(!this.state.subscriptionFile) ? "Subscribe to get access" : ""} className={(!this.state.subscriptionFile) ? "btn btn-primary disabled" : "btn btn-primary"} onClick={e => {this.handleConnectToDiscord()}}>
                                        <span>{this.userAlreadyJoinedDiscord() ? "ACCESS " : "CONNECT TO "}</span><img className="ml-1" src="./images/icons/Icon_Discord_02.png"/>
                                    </div>
                                </div>}
                            </div>
                        </div>
                        
                        {!this.state.isSettingUpDiscord && this.getFilesNamesDescOrderdByDate().map((fileName) => (<div key={fileName} className="card  mb-4">
                            <div className="card-body">
                                <div className="row">
                                    <div className="col-md">
                                        <a href={this.getPostUrl(fileName)} className="post-date pull-left">
                                        {this.state.files[fileName].postTime && new Date(this.state.files[fileName].postTime).toLocaleDateString({}, { year: 'numeric', month: 'short', day: 'numeric', hour:'numeric', minute:'numeric' })}
                                        </a>
                                        <div className="post-visibility float-right">
                                            {!this.state.files[fileName].isPublic && (this.isLoggedUserPage() || this.checkUserNotAllowed()) && <div><i className="fa fa-lock"></i> Locked</div>}
                                            {!this.state.files[fileName].isPublic && !this.checkUserNotAllowed() && !this.isLoggedUserPage() && <div><i className="fa fa-unlock"></i> Unlocked</div>}
                                            {this.state.files[fileName].isPublic && <div><i className="fa fa-globe"></i> Public</div>}
                                        </div>
                                        <div className="post-visibility edit-post float-right">
                                            {this.isLoggedUserPage() && <div onClick={e => {this.handleEditPost(fileName)}} ><i className="fa fa-edit"></i> Edit Post</div>}
                                        </div>
                                    </div>
                                </div>
                                <div className="post-title"> {this.state.files[fileName].title}</div>
                                <div className="post-description"> {this.state.files[fileName].description}</div>
                                {this.state.files[fileName].content && 
                                <div className="fr-view mt-4" dangerouslySetInnerHTML={{ __html: this.state.files[fileName].content + '&nbsp;<br>&nbsp;' }}></div>
                                }
                            </div>
                            <div className="card-footer">
                                <div className="pull-left post-user">
                                <img src={ (this.state.pageOwner && this.state.pageOwner.avatarUrl()) ? this.state.pageOwner.avatarUrl() : avatarFallbackImage }
                                    className="img-rounded avatar mini-avatar"
                                    id="avatar-image"/>
                                    Posted by {this.state.pageOwner && this.state.pageOwner.name() ? this.state.pageOwner.name() : this.state.pageUsername.split('.')[0]}
                                </div>
                                <div className="pull-right">
                                    {!this.state.files[fileName].isPublic && this.checkUserNotAllowed() && <Payment handleSignIn={handleSignIn} pageUsername={this.state.pageUsername}  monthlyPrice={this.state.monthlyPrice} yearlyPrice={this.state.yearlyPrice} halfYearlyPrice={this.state.halfYearlyPrice} quarterlyPrice={this.state.quarterlyPrice} confirmed={this.subscriptionConfirmed}></Payment>}
                                    {(this.state.files[fileName].isPublic || !this.checkUserNotAllowed()) && !this.state.files[fileName].content &&<div className='btn btn-primary' onClick={e => {if(!this.state.files[fileName].isPublic && this.checkUserNotAllowed()) this.handleRedirectSubscribe; else this.handleReadFile(fileName, this.state.files[fileName].isPublic)}}  ><span>Read More</span></div>}
                                </div>
                            </div>
                        </div>
                        ))}
                        {this.state.isSettingUpDiscord &&
                        <DiscordPanel discordInfo={this.props.discordInfo}></DiscordPanel>
                        }
                    </div>
                </div>
            </div>
        </div>
        

        );
    }

    activatePosts() {
        this.setState({
                isSettingUpDiscord: false
            });
    }

    activateDiscord() {
        this.setState({
                isSettingUpDiscord: true
            });
    }

    hasDiscord(){
        return this.props.discordInfo && this.props.discordInfo.hasDiscord && this.props.discordInfo.discordRole != null;
    }

    userAlreadyJoinedDiscord(){
        return this.hasDiscord() && this.props.discordInfo.userAlreadyJoined;
    }

    handleConnectToDiscord(){
        if(!this.userAlreadyJoinedDiscord() && this.state.subscriptionFile){
            var redirectUri = window.location.origin + "/discordAuth";
            var url = discord_auth_url.
                replace("{RESPONSE_TYPE}", "token").
                replace("{CLIENT_ID}", this.props.discordInfo.clientId).
                replace("{REDIRECT_URI}", redirectUri).
                replace("{STATE}", this.state.pageUsername).
                replace("{SCOPE}", "email identify guilds.join");
            window.location = url;
        }
        else{
            if(this.props.discordInfo && this.props.discordInfo.guildId){
                window.open("https://discordapp.com/channels/"+this.props.discordInfo.guildId, "_blank");
            }
        }
    }
    
    getPostUrl(fileName){
        return "/"+this.state.pageUsername+"/"+fileName+"/"+this.formatPostTitle(this.state.files[fileName].title);
    }
    
    formatPostTitle(title){
        return typeof title == "string" ? title.split(' ').join('-') : '';
    }

    getFilesNamesDescOrderdByDate(){
        var _this = this;
        return Object.keys(this.state.files).sort(function (a, b) { 
            var dif = (_this.state.files[b].postTime || 0) - (_this.state.files[a].postTime || 0);
            return dif;
        });
    }

    handleEditPost(fileName){
        this.props.handleEditPost(this.state.files[fileName]);
    }

    componentWillReceiveProps(nextProps) {
        this.fetchData(nextProps)
    }

    subscriptionConfirmed() {
        if (!this.state.subscriptionFile) {
            this.setSubscriptionFile();
        }
        return true;
    }

    fetchData(nextProps) {
        var newState = this.getStateFromProps(nextProps);        
        this.setState(newState, () => {
            if(nextProps.pageUsername != null && nextProps.pageUsername != "")
            {
                this.setSubscriptionData();
            }
        });
    }

    getStateFromProps(props){
        var newState = {}
        if(props.pageInfo != null){
            newState = {
                pageName: props.pageInfo.pageName,
                pageDescription: props.pageInfo.pageDescription,
                monthlyPrice: props.pageInfo.monthlyPrice,
                yearlyPrice: props.pageInfo.yearlyPrice,
                halfYearlyPrice: props.pageInfo.halfYearlyPrice,
                quarterlyPrice: props.pageInfo.quarterlyPrice,
                files: props.pageInfo.files ? props.pageInfo.files : {}
            }
        }
        if(props.pageUsername != null){
            newState["pageUsername"] = props.pageUsername;
        }
        if(props.pageOwner != null){
            newState["pageOwner"] = props.pageOwner;
        }
        return newState;
    }

    setSubscriptionData() {
        lookupProfile(this.state.pageUsername)
        .then((profile) => {
            var person = new Person(profile);
            this.setState(
                {
                    pageOwner: person,
                }, 
            );
           })
        .catch((error) => {
            console.log('could not resolve profile')
        });

        this.setSubscriptionFile();
    }

    setSubscriptionFile() {
        if (this.state.pageUsername && loadUserData()) {
            var loggedUserAppPrivateKey = loadUserData().appPrivateKey;
            var loggedUserAppPublicKey = getPublicKeyFromPrivate(loggedUserAppPrivateKey);
            const options = { username:  this.state.pageUsername, decrypt: false };
            getFile('bp/' + loggedUserAppPublicKey.toLowerCase() + '.json', options)
            .then(
                (file)=>{
                if (file) {
                    this.setState(
                        {
                            subscriptionFile: JSON.parse(file)
                        }
                    );
                } 
            })
            .catch((error) => {
                console.log(error);
            });
        }
    }

    getLoggedUsername(){
        var userData = loadUserData();
        if(userData){
            return userData.username;
        }
        return null;
    }

    isLoggedUserPage() {
        return this.state.pageUsername == this.getLoggedUsername();
    }

    checkUserNotAllowed() {
        return !this.isLoggedUserPage() && !this.state.subscriptionFile;
    }

    handleReadFile(fileName, isPublic){
        if (!isPublic && this.checkUserNotAllowed()) {
            alert("You need to subscribe to access this content");
            return;
        }
        if (isPublic) {
            this.handleSelectedFile(fileName, null, isPublic);
        } else if (!this.state.subscriptionFile) {
            getFile("myFilesPrivateKeys.json").then((file)=>{
                var keys = JSON.parse(file || "{}");
                this.handleSelectedFile(fileName, keys[fileName]);
              });
        } else {
            this.handleSelectedFile(fileName, this.state.subscriptionFile[fileName]);
        }
    }

    handleSelectedFile(fileName, file, isPublic) {
        if (!isPublic && file == null) {
            alert("You don't have access to this content");
            return;
        }
        
        const options = { username:  this.state.pageUsername, decrypt: false };
        getFile('myFiles.json', options).then(
            (fileWithEncryptedContent) => {
                var parsedFileWithEncryptedContent = JSON.parse(fileWithEncryptedContent || "{}");
                var fileContent = '';
                if (isPublic) {
                    fileContent = parsedFileWithEncryptedContent[fileName].content;
                } else {
                    var decryptedFilePrivateKey = null;

                    if (!this.state.subscriptionFile) {
                        decryptedFilePrivateKey = file.decryptionPrivateKey;
                    } else {
                        decryptedFilePrivateKey = decryptContent(file.decryptionPrivateKey,{privateKey:loadUserData().appPrivateKey});
                    }

                    fileContent = decryptContent(parsedFileWithEncryptedContent[fileName].content, {privateKey:decryptedFilePrivateKey});
                }
                
                var currentFileContent = JSON.parse(fileContent);
                
                var files = this.state.files;
                files[fileName].content = currentFileContent;
                this.setState(
                    {
                        files: files,
                        currentFileContent: currentFileContent
                    }
                );
            });
    }
}