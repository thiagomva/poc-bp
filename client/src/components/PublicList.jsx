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

export default class PublicList extends Component {
    constructor(props) {
        super(props);

        this.state = {
            pageUsername: "",
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
            <div className="panel-landing" id="section-1">
                {this.state.isLoading &&
                <h1>Loading...</h1>
                }
                <h1 className="landing-heading">{this.state.pageName}</h1>
                <h2>{this.state.pageDescription}</h2>
                {this.state.subscriptionDuration &&
                <div>
                    <span>Price: {this.state.subscriptionPrice} ETH</span>
                    {this.state.pageUsername != loadUserData().username && <span> - Valid Until: {this.getFormattedDateFromDuration()}</span>}
                    {!this.state.pageUserAddress && <span><br/><b><u>Ethereum address not defined.</u></b></span>}
                    {this.state.pageUserAddress && this.state.pageUsername != loadUserData().username && !this.state.subscriptionFile && <Payment pageUsername={this.state.pageUsername} address={this.state.pageUserAddress} amount={this.state.subscriptionPrice} confirmed={this.subscriptionConfirmed}></Payment>}
                    {(this.state.pageUsername == loadUserData().username || this.state.subscriptionFile) && <span><br/><b><u>Subscribed</u></b></span>}
                </div>
                }
                <div className="file-container">
                {Object.keys(this.state.files).map((fileName) => (
                
                    <div key={fileName} className={"file-card" + (this.checkUserNotAllowed() ? " locked" : "")} onClick={e => this.handleReadFile(fileName)}>{this.state.files[fileName].title}</div>
                ))}
                </div>
                {this.state.currentFileContent &&
                <FroalaView
                model={this.state.currentFileContent}
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
                this.setState(
                    {
                        currentFileContent: JSON.parse(fileContent)
                    }
                );
            });
    }
}