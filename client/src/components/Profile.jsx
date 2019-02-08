import React, { Component } from 'react';
import PageEdit from './PageEdit.jsx';
import NewPost from './NewPost.jsx';
import PublicList from './PublicList.jsx';
import Topbar from './TopBar.jsx';
import { server_url } from '../config';
import Axios from 'axios';
import Helmet from 'react-helmet';

import {
  isSignInPending,
  loadUserData,
  Person,
  getFile,
  putFile,
  lookupProfile,
  makeECPrivateKey,
  getPublicKeyFromPrivate,
  makeV1GaiaAuthToken,
  getOrSetLocalGaiaHubConnection,
  verifyProfileToken
} from 'blockstack';
import {decodeToken} from 'jsontokens';

import { listFiles, decryptContent, encryptContent } from 'blockstack/lib/storage';
import SubscriptionOptions from './SubscriptionOptions.jsx';

const avatarFallbackImage = 'https://s3.amazonaws.com/onename/avatar-placeholder.png';

export default class Profile extends Component {
  constructor(props) {
  	super(props);

  	this.state = {
      person: {
        name() {
          return 'Anonymous';
        },
        avatarUrl() {
          return avatarFallbackImage;
        },
      },
      username: "",
      pageUsername:"",
      newStatus: "",
      bitcoinWallet: "",
      statuses: [],
      statusIndex: 0,
      isLoading: false,
      isEditing: false,
      isCreatingPost: false,
      docPrivateKey: "",
      docPublicKey: "",
      pageInfo: null,
      subscriptionFile: null
    };

    if (!this.props.match.params.username && loadUserData() && loadUserData().username) {
      this.props.history.push('/'+loadUserData().username)
    }
  }

  render() {
    const { handleSignIn } = this.props;
    const { person } = this.state;
    const { username } = this.state;
    var handleNewPost = () =>{
      this.setState({isCreatingPost: true, editingFile: null});
    }

    var handleEditPost = (file) =>{
      this.setState({isCreatingPost: true, editingFile: file});
    }

    var handleNewPageSubmit = (pageInfo) =>{
      if(!pageInfo.files){
        pageInfo.files= {};
      }
      var isNewPost = this.state.pageInfo && this.state.pageInfo.files ? this.state.pageInfo.files.length != pageInfo.files.length : false;

      this.setState({isLoading: true});
      savePageInfoOnGaia(pageInfo)
        .then(() => {
          this.setState({pageInfo: pageInfo});
          if(isNewPost){
            var serverPageInfo = {
              numberOfPosts: Object.keys(pageInfo.files).length
            };
            var url = server_url + '/api/v1/pages/numberOfPosts';
            Axios.post(url, serverPageInfo).then(response => {}).finally(()=>{
              this.setState({isLoading: false,isEditing:false,isCreatingPost:false});
            });
          }
          else{
            var tokenPayload = decodeToken(loadUserData().authResponseToken).payload;
            var userEmail = tokenPayload.email;
            var serverPageInfo = {
              userBlockstackId: loadUserData().username,
              pageName: pageInfo.pageName,
              pageDescription: pageInfo.pageDescription,
              numberOfPosts: Object.keys(pageInfo.files).length,
              monthlyPrice: pageInfo.monthlyPrice,
              yearlyPrice: pageInfo.yearlyPrice,
              email: userEmail
            };
            var privateKey = loadUserData().appPrivateKey;
            let hubUrl = loadUserData().hubUrl;
            fetch(hubUrl + '/hub_info')
              .then(response => response.json())
              .then((hubInfo) => { 
                getOrSetLocalGaiaHubConnection().then(hubConfig => {
                  var scopes = [{
                    scope : "putFilePrefix",
                    domain : "bp/",
                    appPrivateKey: privateKey,
                    address: hubConfig.address,
                    hubServerUrl: hubUrl,
                    hubUrlPrefix: hubInfo.read_url_prefix
                  }];
                  var token = makeV1GaiaAuthToken(hubInfo, privateKey, hubUrl, null, scopes);
                  serverPageInfo.jwt = token;
                  savePageInfoOnServer(serverPageInfo);
            })})
            }          
        });
    }

    var savePageInfoOnGaia = (pageInfo) => {      
      let docOptions = {
        encrypt: false
      };
      return putFile('pageInfo.json', JSON.stringify(pageInfo), docOptions);
    }

    var savePageInfoOnServer = (pageInfo) => {
      var url = server_url + '/api/v1/pages';
      Axios.post(url, pageInfo).then(response => {}).finally(()=>{
        this.setState({isLoading: false,isEditing:false,isCreatingPost:false});
      });
    }

    var handleCancelEdition = () => {
      this.setState({isLoading: false,isEditing:false,isCreatingPost:false});
    }

    var pageName = this.state.pageInfo && this.state.pageInfo.pageName ? 
      this.state.pageInfo.pageName : person.name() ? person.name()
      : username && username.includes('.') ? username.split('.')[0]+"'s Page" : username;

    return (
      !isSignInPending() && person ?
      <div className="container">
        <Helmet>
          <title>{pageName + " | BitPatron"}</title>
          <meta property="og:site_name" content={pageName+" | BitPatron"}/>
          <meta property="og:title" content={pageName+" | BitPatron"}/>
          <meta name="description" content={this.state.pageInfo && this.state.pageInfo.pageDescription ? this.state.pageInfo.pageDescription : ""}/>
          <meta name="author" content={username ? (username.includes('.') ? username.split('.')[0] : username) : ""}/>
          <meta property="og:type" content="website"/>
          <meta property="og:description" content={"Become a BitPatron of "+pageName+" with Bitcoin."}/>
          <meta property="og:image" content="https://bitpatron.co/img/TW_BitPatron_Post1.png"/>
        </Helmet>
        <div className="row">
          <div className="col-md">
            {!this.showNewPostForm() && !this.showPageEdit() &&
            <div className="row header-section">
              <div className="title-section col-md-12">
                <div className="container no-padding">
                  <div className="row">
                    <div className="col-md-auto">
                      <img src={ this.state.pageImage ? this.state.pageImage : avatarFallbackImage } 
                      className="img-rounded avatar" id="avatar-image"/>
                    </div>
                    <div className="col-md">
                      <h1>
                        <span>
                        { 
                          this.state.isLoading ? "Loading..." :
                          this.state.pageInfo && this.state.pageInfo.pageName ? 
                          this.state.pageInfo.pageName : person.name() ? person.name()
                          : username && username.includes('.') ? username.split('.')[0]+"'s Page" : username }</span>&nbsp;&nbsp;
                        </h1>
                      <h4>
                        { this.state.pageInfo && this.state.pageInfo.pageDescription ? this.state.pageInfo.pageDescription : "" }
                      </h4>
                    </div>
                    {this.isLocal() && !this.showPageEdit() && <div className="col-md-auto">
                        <div className="btn btn-primary icon-btn" onClick={e => this.handleEditPage(e)}><i className="fa fa-edit"></i><span>Edit Page</span></div>
                      </div>
                    }
                  </div>
                  <hr className="divider"></hr>
                </div>
                
              </div>
            </div>
            }
            {this.showNewPostForm() && 
              <NewPost handleSavePage={handleNewPageSubmit} handleCancel={handleCancelEdition} editingFile={this.state.editingFile}/>
            }
            {this.showPageEdit() &&
              <PageEdit pageInfo={this.state.pageInfo} handleSavePage={handleNewPageSubmit} handleCancelEdition={handleCancelEdition}/>
            }
            <div className="col-md-12">
            {!this.showNewPostForm() &&  !this.showPageEdit() &&
              <PublicList handleSignIn={handleSignIn} handleEditPost={handleEditPost} handleNewPost={handleNewPost} pageInfo={this.state.pageInfo} pageUsername={this.state.pageUsername} pageOwner={this.state.person}/>
            }
          </div>
          </div>
          {!this.showNewPostForm() && !this.showPageEdit() && this.state.pageInfo && this.state.pageUsername &&
          <div className="col-md-4">
            <div>
              <div className="row header-section become-bitpatron" href="/">
                <img src="./images/Icon_Star.png"/>&nbsp;Become BitPatron
              </div>
              <div className="row pl-5 pt-3 mb-4">
                <span>Choose a subscription plan</span>
              </div>
              <SubscriptionOptions handleSignIn={handleSignIn} expirationDate={this.getExpirationDate()} radioGroupName="-side" monthlyPrice={this.state.pageInfo.monthlyPrice} yearlyPrice={this.state.pageInfo.yearlyPrice} pageUsername={this.state.pageUsername}></SubscriptionOptions>
              {this.checkUserIsPageOwner() && <div className="payout-box p-3 mt-3">
                <div className="box-label">Edit your payout</div>
                <input className="wallet-input" 
                  placeholder="Enter your wallet number"
                  value={this.state.bitcoinWallet}
                  onChange={e => this.handleBitcoinWalletChange(e)}></input>
                <div className="small-round-btn" onClick={e => this.updatePayoutWallet(e)}><i className="fa fa-arrow-right"></i></div>
              </div>}
            </div>
          </div>}
        </div>
      </div> : null
    );
  }

  getExpirationDate(){
    var duration = null;
    if(loadUserData()){
      var appPublicKey = getPublicKeyFromPrivate(loadUserData().appPrivateKey).toLowerCase();
      if (this.state.subscriptionFile && this.state.subscriptionFile[appPublicKey]) {
          duration = this.state.subscriptionFile[appPublicKey].expirationDate;
      }
    }
    return duration;
  }

  componentWillMount() {
    var userData = loadUserData();
    if(userData){
      this.setState({
        person: new Person(userData.profile),
        username: userData.username
      });
    }
  }

  componentDidMount() {
    if(this.props.location.search == "?handler=openNode"){
      this.setState({ isLoading: true });
      var url = server_url + '/api/v1/charges/check';
      var loggedUserAppPublicKey = getPublicKeyFromPrivate(loadUserData().appPrivateKey);
      Axios.post(url, {
        appPublicKey: loggedUserAppPublicKey
      }).then(response => {
        this.fetchData();
      }).catch((err) => {
        alert('Sorry, an error ocurred.');
      });
    }
    else{
      this.fetchData();
    }

    if (this.checkUserIsPageOwner()) {
      const script = document.createElement("script");

      script.src = "//s7.addthis.com/js/300/addthis_widget.js#pubid=ra-5c5dbb7e21461dc9";
      script.type = "text/javascript";

      document.body.appendChild(script);
    }
  }

  getLoggedUserName(){
    var userData = loadUserData();
    if(userData)
      return userData.username;
    return null;
  }

  handleNewStatusChange(event) {
    this.setState({newStatus: event.target.value})
  }

  handleEditPage(event){
    this.setState({isEditing: true})
  }

  handleBitcoinWalletChange(event) {
    this.setState({bitcoinWallet: event.target.value})
  }

  fetchData() {
    this.setState({ isLoading: true });
    var username = this.state.username;
    if (!this.isLocal()) {
     username = this.props.match.params.username
     lookupProfile(username)
       .then((profile) => {
         this.setState({
           person: new Person(profile),
           username: username
         });
        })
       .catch((error) => {
         console.log('could not resolve profile')
       })
    }
    else{
      this.getBitcointWallet();
    }
    this.setState({ pageUsername: username });
    this.getPageInfo(username);
    this.setSubscriptionFile(username);
    
  }

  getBitcointWallet(){
    getFile('bitcoinWallet').then(wallet => {
      this.setState({ bitcoinWallet: wallet });
    })
  }

  getPageInfo(username){
    const options = { username: username, decrypt: false }
    getFile('pageInfo.json', options)
      .then((file) => {
        var pageInfo = JSON.parse(file)
        this.setState({
          pageInfo: pageInfo
        })
        getFile('pageImage', options).then(result => {
          this.setState({ pageImage: result })
        }).finally(() => {
          this.setState({ isLoading: false })
        })
      })
      
  }

  isLocal() {
    return this.props.match.params.username ? (this.props.match.params.username == this.getLoggedUserName()) : true
  }

  isLocalAndHasConfiguredPage() {
    return this.isLocal() && this.state.pageInfo != null ? true : false
  }

  isLocalAndHasNotConfiguredPage() {
    return this.isLocal() && this.state.pageInfo == null ? true : false
  }

  showNewPost(){
    return !this.state.isLoading && this.isLocalAndHasConfiguredPage() && !this.state.isEditing;
  }

  showNewPostForm(){
    return !this.state.isLoading && this.isLocalAndHasConfiguredPage() && !this.state.isEditing && this.state.isCreatingPost;
  }

  showPageEdit(){
    return !this.state.isLoading && (this.isLocalAndHasNotConfiguredPage() || this.state.isEditing);
  }

  setSubscriptionFile(username) {
      if (username && loadUserData()) {
          var loggedUserAppPrivateKey = loadUserData().appPrivateKey;
          var loggedUserAppPublicKey = getPublicKeyFromPrivate(loggedUserAppPrivateKey);
          const options = { username:  username, decrypt: false };
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

  checkUserIsPageOwner() {
    return !this.props.match.params.username || (loadUserData() && loadUserData().username == this.props.match.params.username);
  }

  updatePayoutWallet() {
    putFile('bitcoinWallet', this.state.bitcoinWallet);
  }
}
