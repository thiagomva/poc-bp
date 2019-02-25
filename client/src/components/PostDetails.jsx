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
import { isNull } from 'util';

const avatarFallbackImage = 'https://s3.amazonaws.com/onename/avatar-placeholder.png';

export default class PostDetails extends Component {
    constructor(props) {
        super(props);

        var defaultState = {
            subscriptionFile: null,
            pageOwner: null,
            isLoading: true,            
            pageName: "",
            pageDescription: "",
            monthlyPrice: undefined,
            yearlyPrice: undefined,
            halfYearlyPrice: undefined,
            quarterlyPrice: undefined,
            file: null,
            pageUsername: ""
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
                            {this.state.isLoading ?
                                <h1>Loading...</h1> :
                            <div className="file-container">
                            
                            {this.state.file && <div className="card  mb-4">
                                <div className="card-body">
                                    <div className="row">
                                        <div className="col-md">
                                            <div className="post-date pull-left">
                                            {this.state.file.postTime && new Date(this.state.file.postTime).toLocaleDateString({}, { year: 'numeric', month: 'short', day: 'numeric', hour:'numeric', minute:'numeric' })}
                                            </div>
                                            <div className="post-visibility float-right">
                                                {!this.state.file.isPublic && (this.isLoggedUserPage() || this.checkUserNotAllowed()) && <div><i className="fa fa-lock"></i> Locked</div>}
                                                {!this.state.file.isPublic && !this.checkUserNotAllowed() && !this.isLoggedUserPage() && <div><i className="fa fa-unlock"></i> Unlocked</div>}
                                                {this.state.file.isPublic && <div><i className="fa fa-globe"></i> Public</div>}
                                            </div>
                                            <div className="post-visibility edit-post float-right">
                                                {this.isLoggedUserPage() && <div onClick={e => {this.handleEditPost()}} ><i className="fa fa-edit"></i> Edit Post</div>}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="post-title"> {this.state.file.title}</div>
                                    <div className="post-description"> {this.state.file.description}</div>
                                    {this.state.file.content && 
                                    <div className="fr-view mt-4" dangerouslySetInnerHTML={{ __html: this.state.file.content + '&nbsp;<br>&nbsp;' }}></div>
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
                                        {!this.state.file.isPublic && this.checkUserNotAllowed() && <Payment handleSignIn={handleSignIn} pageUsername={this.state.pageUsername}  monthlyPrice={this.state.monthlyPrice} yearlyPrice={this.state.yearlyPrice} halfYearlyPrice={this.state.halfYearlyPrice} quarterlyPrice={this.state.quarterlyPrice} confirmed={this.subscriptionConfirmed}></Payment>}
                                        {(this.state.file.isPublic || !this.checkUserNotAllowed()) && !this.state.file.content &&<div className='btn btn-primary' onClick={e => {if(!this.state.file.isPublic && this.checkUserNotAllowed()) this.handleRedirectSubscribe; else this.handleReadFile()}}  ><span>Read More</span></div>}
                                    </div>
                                </div>
                            </div>
                            }
                        </div>
                        }
                    </div>
            </div>
        </div>
        );
    }

    handleEditPost(){
        this.props.handleEditPost(this.state.file);
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
        this.setState({isLoading:true});
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
                quarterlyPrice: props.pageInfo.quarterlyPrice
            }
        }
        if(props.pageUsername != null){
            newState["pageUsername"] = props.pageUsername;
        }
        if(props.pageOwner != null){
            newState["pageOwner"] = props.pageOwner;
        }
        if(props.postId != null){
            newState["postId"] = props.postId;
            newState["file"] = props.pageInfo.files ? props.pageInfo.files[props.postId] : {};
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
                var parsedFile = null;
                if (file) {
                    parsedFile = JSON.parse(file)
                }
                this.setState(
                    {
                        subscriptionFile: parsedFile
                    },
                    () => {
                        this.handleReadFile()
                    }
                );
            })
            .catch((error) => {
                console.log(error);
            });
        }
        else{
            if(this.state.file.isPublic){
                this.handleReadFile()
            }
            else{
                this.setState({isLoading: false});
            }
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
        return (!this.isLoggedUserPage() && !this.state.subscriptionFile) || this.state.file.isPublic;
    }

    handleReadFile(){
        var fileName = this.state.postId;
        var isPublic = this.state.file.isPublic;

        if (!isPublic && this.checkUserNotAllowed()) {
            this.setState({isLoading:false});
            return;
        }
        if (isPublic) {
            this.handleSelectedFile(fileName, null, isPublic);
        } else if (!this.state.subscriptionFile) {
            getFile("myFilesPrivateKeys.json").then((file)=>{
                var keys = JSON.parse(file || "{}");
                this.handleSelectedFile(fileName, keys[fileName] ? keys[fileName].decryptionPrivateKey : null);
              });
        } else {
            this.handleSelectedFile(fileName, this.state.subscriptionFile[fileName] ? this.state.subscriptionFile[fileName].decryptionPrivateKey : isNull);
        }
    }

    handleSelectedFile(fileName, decryptionPrivateKey, isPublic) {
        if (!isPublic && decryptionPrivateKey == null) {
            alert("You don't have access to this content");
            this.setState({isLoading:false});
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
                        decryptedFilePrivateKey = decryptionPrivateKey;
                    } else {
                        decryptedFilePrivateKey = decryptContent(decryptionPrivateKey,{privateKey:loadUserData().appPrivateKey});
                    }

                    fileContent = decryptContent(parsedFileWithEncryptedContent[fileName].content, {privateKey:decryptedFilePrivateKey});
                }
                
                var currentFileContent = JSON.parse(fileContent);
                
                var file = this.state.file;
                file.content = currentFileContent;
                this.setState(
                    {
                        file: file,
                        isLoading:false
                    }
                );
            });
    }
}