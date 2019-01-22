import React, { Component } from 'react';
import {
    loadUserData,
    getFile,
    getPublicKeyFromPrivate,
  } from 'blockstack';

export default class PublicList extends Component {
    constructor(props) {
        super(props);

        this.state = {
            pageUserName: "",
            isLoading: false,
            pageName: "",
            pageDescription: "",
            subscriptionPrice: 0,
            subscriptionDuration: 0,
            files: {},
            currentFileContent:""
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
                {this.state.subscriptionDuration > 0 &&
                <div>Price: {this.state.subscriptionPrice} ETH - Valid Until: {this.getFormattedDateFromDuration(this.state.subscriptionDuration)}</div>
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
        }
    }

    getFormattedDateFromDuration(duration) {
        var date = new Date(Date.now());
        date.setDate(date.getDate() + duration);
        return date.getFullYear() + '/' + (date.getMonth() + 1) + '/' + date.getDate();
    }

    handleReadFile(fileName){
        var loggedUserAppPrivateKey = loadUserData().appPrivateKey;
        var loggedUserAppPublicKey = getPublicKeyFromPrivate(loggedUserAppPrivateKey);
        const options = { username:  this.state.pageUsername, decrypt: false }
        getFile(loggedUserAppPublicKey, options).then(
            (file1)=>{
                if(file1 == null){
                    alert("You need to subscribe to access this content");
                    return;
                }
                var filesPrivateKeysList = JSON.parse(file1 || "{}");
                var currentFile = filesPrivateKeysList[fileName];
                if(currentFile == null){
                    alert("You don't have access to this content");
                    return;
                }

                var decryptedFilePrivateKey = decryptContent(currentFile.decryptionPrivateKey,{privateKey:loggedUserAppPrivateKey});

                getFile(fileName, options).then(
                (fileWithEncryptedContent) => {
                    var parsedFileWithEncryptedContent = JSON.parse(file|| "{}");
                    var fileContent = decryptContent(parsedFileWithEncryptedContent.content, {privateKey:decryptedFilePrivateKey});
                    this.setState(
                        {
                            currentFileContent: JSON.parse(fileContent)
                        }
                    );
                })
            }
        )
    }
}