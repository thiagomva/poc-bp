import React, { Component } from 'react';
import Payment from './Payment.jsx';
import {
    loadUserData,
    getFile,
    getPublicKeyFromPrivate,
    lookupProfile,
    Person
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
                    <span>Price: {this.state.subscriptionPrice} ETH - Valid Until: {this.getFormattedDateFromDuration(this.state.subscriptionDuration)}</span>
                    {!this.state.pageUserAddress && <span><br/><b><u>Ethereum address not defined.</u></b></span>}
                    {this.state.pageUserAddress && this.state.pageUsername != loadUserData().username && !this.state.subscriptionFile && <Payment pageUsername={this.state.pageUsername} address={this.state.pageUserAddress} amount={this.state.subscriptionPrice}></Payment>}
                    {(this.state.pageUsername == loadUserData().username || this.state.subscriptionFile) && <span><br/><b><u>Subscribed</u></b></span>}
                </div>
                }
                <div className="file-container">
                {Object.keys(this.state.files).map((fileName) => (
                
                    <div key={fileName} className="file-card" onClick={e => this.handleReadFile(fileName)}>{this.state.files[fileName].title}</div>
                ))}
                </div>

                <div>{this.state.currentFileContent}</div>
            </div>
        );
    }

    componentWillReceiveProps(nextProps) {
        this.fetchData(nextProps)
    }

    fetchData(nextProps) {
        if(nextProps.pageInfo != null){
            this.setState(
                {
                    pageName: nextProps.pageInfo.pageName,
                    pageDescription: nextProps.pageInfo.pageDescription,
                    subscriptionPrice: nextProps.pageInfo.subscriptionPrice,
                    subscriptionDuration: nextProps.pageInfo.subscriptionDuration,
                    files: nextProps.pageInfo.files
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

    getFormattedDateFromDuration(duration) {
        var date = new Date(Date.now());
        date.setDate(date.getDate() + duration);
        return date.getFullYear() + '/' + (date.getMonth() + 1) + '/' + date.getDate();
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

        var loggedUserAppPrivateKey = loadUserData().appPrivateKey;
        var loggedUserAppPublicKey = getPublicKeyFromPrivate(loggedUserAppPrivateKey);
        const options = { username:  this.state.pageUsername, decrypt: false };
        getFile(loggedUserAppPublicKey, options)
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

    handleReadFile(fileName){
        if (!this.state.subscriptionFile) {
            alert("You need to subscribe to access this content");
            return;
        }
        var currentFile = this.state.subscriptionFile[fileName];
        if(currentFile == null){
            alert("You don't have access to this content");
            return;
        }

        var decryptedFilePrivateKey = decryptContent(currentFile.decryptionPrivateKey,{privateKey:loggedUserAppPrivateKey});

        getFile(fileName, options).then(
            (fileWithEncryptedContent) => {
                var parsedFileWithEncryptedContent = JSON.parse(fileWithEncryptedContent || "{}");
                var fileContent = decryptContent(parsedFileWithEncryptedContent.content, {privateKey:decryptedFilePrivateKey});
                this.setState(
                    {
                        currentFileContent: JSON.parse(fileContent)
                    }
                );
            });
    }
}