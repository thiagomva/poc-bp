import React, { Component } from 'react';
import FroalaView from 'react-froala-wysiwyg';
import Payment from './Payment.jsx';
import {
    loadUserData,
    getFile,
    getPublicKeyFromPrivate,
    lookupProfile,
    Person,
    decryptContent
  } from 'blockstack';

const avatarFallbackImage = 'https://s3.amazonaws.com/onename/avatar-placeholder.png';

export default class PublicList extends Component {
    constructor(props) {
        super(props);

        this.state = {
            pageUsername: "",
            pageOwner: null,
            isLoading: false,
            pageName: "",
            pageDescription: "",

            subscriptionPrice: undefined,
            subscriptionDuration: undefined,
            files: {},
            currentFileContent:"",
            pageUserAddress: undefined,
            subscriptionFile: null
        }

        this.subscriptionConfirmed = this.subscriptionConfirmed.bind(this);
    }

    render() {
        return (
            <div>
                <div className="row">
                    <div className="col-md-8">
                            {this.state.isLoading &&
                                <h1>Loading...</h1>
                            }
                            <div className="file-container">
                            {Object.keys(this.state.files).reverse().map((fileName) => (<div className="card  mb-4">
                                <div key={fileName} className="card-body">
                                    <h2 className="card-title"> {this.state.files[fileName].title}</h2>
                                    <p className="card-text"> {this.state.files[fileName].description}</p>
                                    {this.state.files[fileName].content && 
                                    <FroalaView 
                                        model={this.state.files[fileName].content}
                                        config={{
                                            toolbarButtons: [],
                                            events : {
                                                'froalaEditor.initialized' : function(e, editor) {
                                                editor.edit.off();
                                                }
                                            }
                                        }}
                                    />
                                    }

                                    {this.checkUserNotAllowed() && <Payment pageUsername={this.state.pageUsername} address={this.state.pageUserAddress} amount={this.state.subscriptionPrice} subscriptionDuration={this.state.subscriptionDuration} confirmed={this.subscriptionConfirmed} subscriptionMode={true}></Payment>}
                                    {!this.checkUserNotAllowed() &&<div className='btn btn-primary' onClick={e => {if(this.checkUserNotAllowed()) this.handleRedirectSubscribe; else this.handleReadFile(fileName)}}  ><span>Read More  →</span></div>}
                                </div>
                                <div className="card-footer text-muted">Posted by <a href="#">{this.state.pageOwner.name() ? this.state.pageOwner.name() : this.state.pageUsername.split('.')[0]}</a>
                                </div>
                              </div> 
                                  
            //<div key={fileName} className={"file-card" + (this.checkUserNotAllowed() ? " locked" : "")} onClick={e => this.handleReadFile(fileName)}>{this.state.files[fileName].title}</div>

                            
                            ))}
                            </div>
                    </div>
                <div className="col-md-4">
                <div className="card">
                    <h5 className="card-header">{"Content Creator"} </h5>
                    <div className="card-body">
                        <img
                            src={ (this.state.pageOwner && this.state.pageOwner.avatarUrl()) ? this.state.pageOwner.avatarUrl() : avatarFallbackImage }
                            className="img-rounded avatar"
                            id="avatar-image"
                        />
                        <h5 className="card-title ">{this.state.pageOwner && this.state.pageOwner.name()}</h5>
                    </div>
                </div>
                {this.state.subscriptionDuration && this.state.pageUserAddress && 
                    this.state.pageUsername != loadUserData().username && 
                    !this.state.subscriptionFile &&                            
                    <div className="card my-4">
                        <h5 className="card-header">{"Become BitPatron"}</h5>
                        <div className="card-body">
                            <div className="row">
                            <div className="col-lg-12">
                                {!this.state.pageUserAddress && <span><br/><b><u>Ethereum address not defined.</u></b></span>}
                                {this.state.pageUserAddress && this.state.pageUsername != loadUserData().username && !this.state.subscriptionFile && <Payment pageUsername={this.state.pageUsername} address={this.state.pageUserAddress} amount={this.state.subscriptionPrice} subscriptionDuration={this.state.subscriptionDuration} confirmed={this.subscriptionConfirmed} subscriptionMode={false}></Payment>}
                                {(this.state.pageUsername == loadUserData().username || this.state.subscriptionFile) && <span><br/><b><u>Subscribed</u></b></span>}
                            </div>
                            </div>
                        </div>
                    </div>
                }
                </div>
            </div>
        </div>
        

        );
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
        if(nextProps.pageInfo != null){
            this.setState(
                {
                    pageName: nextProps.pageInfo.pageName,
                    pageDescription: nextProps.pageInfo.pageDescription,
                    subscriptionPrice: nextProps.pageInfo.subscriptionPrice,
                    subscriptionDuration: nextProps.pageInfo.subscriptionDuration,
                    files: nextProps.pageInfo.files ? nextProps.pageInfo.files : {}
                }
            );
        }
        if(nextProps.pageUsername != null){
            this.setState(
                {
                    pageUsername: nextProps.pageUsername
                }
            );
            this.setSubscriptionData();
        }
    }

    getFormattedDateFromDuration() {
        var duration;
        var appPublicKey = getPublicKeyFromPrivate(loadUserData().appPrivateKey).toLowerCase();
        if (this.state.subscriptionFile && this.state.subscriptionFile[appPublicKey]) {
            duration = this.state.subscriptionFile[appPublicKey].expirationDate;
        } else {
            duration = (new Date()).getTime() + (this.state.subscriptionDuration * 86400000);
        }
        var date = new Date(duration);
        return date.toLocaleDateString();
    }

    setSubscriptionData() {
        lookupProfile(this.state.pageUsername)
        .then((profile) => {
            var owner = new Person(profile).toJSON();
            this.setState(
                {
                    pageOwner: new Person(profile)
                }
            );
            var address = null;
            if (owner && owner.profile && owner.profile.account) {
                for (var i = 0; i < owner.profile.account.length; ++i) {
                    if (owner.profile.account[i].service == "ethereum") {
                        address = owner.profile.account[i].identifier;
                        break;
                    }
                }
            }
            if (address) {
                this.setState(
                    {
                        pageUserAddress: address
                    }
                );
            }
           })
        .catch((error) => {
            console.log('could not resolve profile')
        });

        this.setSubscriptionFile();
    }

    setSubscriptionFile() {
        if (this.state.pageUsername) {
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

    checkUserNotAllowed() {
        return this.state.pageUsername != loadUserData().username && !this.state.subscriptionFile;
    }

    handleReadFile(fileName){
        if (this.checkUserNotAllowed()) {
            alert("You need to subscribe to access this content");
            return;
        }
        if (!this.state.subscriptionFile) {
            getFile("myFilesPrivateKeys.json").then((file)=>{
                var keys = JSON.parse(file || "{}");
                this.handleSelectedFile(fileName, keys[fileName]);
              });
        } else {
            this.handleSelectedFile(fileName, this.state.subscriptionFile[fileName]);
        }
    }

    handleSelectedFile(fileName, file) {
        if (file == null) {
            alert("You don't have access to this content");
            return;
        }
        var decryptedFilePrivateKey = null;
        if (!this.state.subscriptionFile) {
            decryptedFilePrivateKey = file.decryptionPrivateKey;
        } else {
            decryptedFilePrivateKey = decryptContent(file.decryptionPrivateKey,{privateKey:loadUserData().appPrivateKey});
        }
        const options = { username:  this.state.pageUsername, decrypt: false };
        getFile('myFiles.json', options).then(
            (fileWithEncryptedContent) => {
                var parsedFileWithEncryptedContent = JSON.parse(fileWithEncryptedContent || "{}");
                var fileContent = decryptContent(parsedFileWithEncryptedContent[fileName].content, {privateKey:decryptedFilePrivateKey});
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