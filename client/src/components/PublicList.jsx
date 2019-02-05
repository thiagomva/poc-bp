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

            monthlyPrice: undefined,
            yearlyPrice: undefined,
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
                    <div className="col-md-12">
                            {this.state.isLoading &&
                                <h1>Loading...</h1>
                            }
                            <div className="file-container">
                            <div class="posts-title">
                                <i className="fa fa-bullhorn rotate-315"></i>POSTS
                            </div>
                            {Object.keys(this.state.files).reverse().map((fileName) => (<div key={fileName} className="card  mb-4">
                                <div className="card-body">
                                    <div className="row">
                                        <div className="col-md">
                                            <div className="post-date pull-left">
                                            {this.state.files[fileName].postTime && new Date(this.state.files[fileName].postTime).toLocaleDateString({}, { year: 'numeric', month: 'short', day: 'numeric', hour:'numeric', minute:'numeric' })}
                                            </div>
                                            <div className="post-visibility float-right"><i class="fa fa-lock"></i>&nbsp;Locked</div>
                                        </div>
                                    </div>
                                    <div className="post-title"> {this.state.files[fileName].title}</div>
                                    <div className="post-description"> {this.state.files[fileName].description}</div>
                                    {this.state.files[fileName].content && 
                                    <div className="fr-view" dangerouslySetInnerHTML={{ __html: this.state.files[fileName].content + '&nbsp;<br>&nbsp;' }}></div>
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
                                        {!this.state.files[fileName].isPublic && this.checkUserNotAllowed() && <Payment pageUsername={this.state.pageUsername} address={this.state.pageUserAddress} monthlyPrice={this.state.monthlyPrice} yearlyPrice={this.state.yearlyPrice} confirmed={this.subscriptionConfirmed} subscriptionMode={true}></Payment>}
                                        {(this.state.files[fileName].isPublic || !this.checkUserNotAllowed()) && !this.state.files[fileName].content &&<div className='btn btn-primary' onClick={e => {if(!this.state.files[fileName].isPublic && this.checkUserNotAllowed()) this.handleRedirectSubscribe; else this.handleReadFile(fileName, this.state.files[fileName].isPublic)}}  ><span>Read More</span></div>}
                                    </div>
                                </div>
                            </div>
                            ))}
                        </div>
                    </div>
                <div className="col-md-4">
                {this.state.yearlyPrice && this.state.pageUserAddress && 
                    this.state.pageUsername != loadUserData().username && 
                    !this.state.subscriptionFile &&                            
                    <div className="card my-4">
                        <h5 className="card-header">{"Become BitPatron"}</h5>
                        <div className="card-body">
                            <div className="row">
                            <div className="col-lg-12">
                                {!this.state.pageUserAddress && <span><br/><b><u>Ethereum address not defined.</u></b></span>}
                                {this.state.pageUserAddress && this.state.pageUsername != loadUserData().username && !this.state.subscriptionFile && <Payment pageUsername={this.state.pageUsername} address={this.state.pageUserAddress} monthlyPrice={this.state.monthlyPrice} yearlyPrice={this.state.yearlyPrice} confirmed={this.subscriptionConfirmed} subscriptionMode={false}></Payment>}
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
        var newState = {}
        if(nextProps.pageInfo != null){
            newState = {
                pageName: nextProps.pageInfo.pageName,
                pageDescription: nextProps.pageInfo.pageDescription,
                monthlyPrice: nextProps.pageInfo.monthlyPrice,
                yearlyPrice: nextProps.pageInfo.yearlyPrice,
                files: nextProps.pageInfo.files ? nextProps.pageInfo.files : {}
            }
        }
        if(nextProps.pageUsername != null){
            newState["pageUsername"] = nextProps.pageUsername;
            
        }
        
        this.setState(newState, () => {
            if(nextProps.pageUsername != null)
            {
                this.setSubscriptionData();
            }
        });
    }

    getFormattedDateFromDuration() {
        var duration;
        var appPublicKey = getPublicKeyFromPrivate(loadUserData().appPrivateKey).toLowerCase();
        if (this.state.subscriptionFile && this.state.subscriptionFile[appPublicKey]) {
            duration = this.state.subscriptionFile[appPublicKey].expirationDate;
        } else {
            duration = (new Date()).getTime() + (this.state.yearlyPrice * 86400000);
        }
        var date = new Date(duration);
        return date.toLocaleDateString();
    }

    setSubscriptionData() {
        lookupProfile(this.state.pageUsername)
        .then((profile) => {
            var person = new Person(profile);
            var ownerJson = person.toJSON();
            var address = null;
            if (ownerJson && ownerJson.profile && ownerJson.profile.account) {
                for (var i = 0; i < ownerJson.profile.account.length; ++i) {
                    if (ownerJson.profile.account[i].service == "ethereum") {
                        address = ownerJson.profile.account[i].identifier;
                        break;
                    }
                }
            }
            var pageUserAddress = address ? address : this.state.pageUserAddress;
            this.setState(
                {
                    pageOwner: person,
                    pageUserAddress: pageUserAddress
                }, 
            );
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