import React, { Component } from 'react';
import PageEdit from './PageEdit.jsx';
import NewPost from './NewPost.jsx';
import PublicList from './PublicList.jsx';

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
  uploadToGaiaHub
} from 'blockstack';
import { listFiles, decryptContent, encryptContent } from 'blockstack/lib/storage';

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
      statuses: [],
      statusIndex: 0,
      isLoading: false,
      isEditing: false,
      docPrivateKey: "",
      docPublicKey: "",
      pageInfo: null
    };
  }

  render() {
    const { handleSignOut } = this.props;
    const { person } = this.state;
    const { username } = this.state;
    var handleNewPageSubmit = (pageInfo) =>{
      let docOptions = {
        encrypt: false
      };
      this.setState({isLoading: true});
      putFile('pageInfo.json', JSON.stringify(pageInfo), docOptions)
        .then(() => {
          this.setState({pageInfo: pageInfo});
        })
        .finally(()=>{
          this.setState({isLoading: false,isEditing:false});
        });
    }

    return (
      !isSignInPending() && person ?
      <div className="container">
        <div className="row">
          <div className="col-md-offset-3 col-md-6">
            <div className="col-md-12">
              <div className="avatar-section">
                <img
                  src={ person.avatarUrl() ? person.avatarUrl() : avatarFallbackImage }
                  className="img-rounded avatar"
                  id="avatar-image"
                />
                <div className="username">
                  <h1>
                    <span id="heading-name">{ person.name() ? person.name()
                      : 'Nameless Person' }</span>
                  </h1>
                  <span>{username}</span>
                  {this.isLocal() &&
                    <span>
                      &nbsp;|&nbsp;
                      <a onClick={ handleSignOut.bind(this) }>(Logout)</a>
                    </span>
                  }
                </div>
              </div>
              {
                this.isLocalAndHasConfiguredPage() && !this.state.isEditing &&
                <button
                className="btn btn-primary btn-lg pull-left"
                onClick={e => this.handleEditPage(e)}
                >
                Edit Page
                </button>
              }
            </div>
            {this.showNewPost() && 
              <NewPost handleSavePage={handleNewPageSubmit}/>
            }
            {this.showPageEdit() &&
              <PageEdit pageInfo={this.state.pageInfo} handleSavePage={handleNewPageSubmit}/>
            }
            
            {this.state.isLoading && <span>Loading...</span>}
            <div className="col-md-12 statuses">
            {
              !this.showPageEdit() && 
              <PublicList pageInfo={this.state.pageInfo} pageUsername={this.state.pageUsername}/>
            }
            </div>
          </div>
        </div>
      </div> : null
    );
  }

  componentWillMount() {
    this.setState({
      person: new Person(loadUserData().profile),
      username: loadUserData().username
    });
  }

  componentDidMount() {
    this.fetchData()

    
    this.saveJwtToken();
  }

  handleNewStatusChange(event) {
    this.setState({newStatus: event.target.value})
  }

  handleEditPage(event){
    this.setState({isEditing: true})
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
    this.setState({ pageUsername: username });
    this.getPageInfo(username);
  }

  getPageInfo(username){
    const options = { username: username, decrypt: false }
    getFile('pageInfo.json', options)
      .then((file) => {
        var pageInfo = JSON.parse(file)
        this.setState({
          pageInfo: pageInfo
        })
      })
      .finally(() => {
        this.setState({ isLoading: false })
      })
  }

  isLocal() {
    return this.props.match.params.username ? false : true
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

  showPageEdit(){
    return !this.state.isLoading && (this.isLocalAndHasNotConfiguredPage() || this.state.isEditing);
  }

  saveJwtToken() {
    let privateKey = loadUserData().appPrivateKey;
    let scopes = ['store_write', 'publish_data'];

    scopes = [
      {
        scope: 'putFilePrefix',
        domain: 'bitPatron/'
      }
    ]
    let hubUrl = loadUserData().hubUrl;
    fetch(hubUrl+'/hub_info')
    .then(response => response.json())
    .then((hubInfo) => {
            let token =  makeV1GaiaAuthToken(hubInfo, privateKey, hubUrl, null, scopes);
            this.writeUsingJwt(token)
          });
  }

  writeUsingJwt(){
      let jwtToken = "v1:eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NksifQ.eyJnYWlhQ2hhbGxlbmdlIjoiW1wiZ2FpYWh1YlwiLFwiMjAxOVwiLFwic3RvcmFnZTIuYmxvY2tzdGFjay5vcmdcIixcImJsb2Nrc3RhY2tfc3RvcmFnZV9wbGVhc2Vfc2lnblwiXSIsImh1YlVybCI6Imh0dHBzOi8vaHViLmJsb2Nrc3RhY2sub3JnIiwiaXNzIjoiMDNkYTdlODUxMGFiZWUxMjRlOTA2OGUyMDA4ZmUxYWRlM2FiYmI3ZTViM2U3ZDNmODhkY2EwMjNmYzg3ODJmMDU3Iiwic2FsdCI6IjEyMjY2YzZmYmRmZGY0MTQ3ZWM2ODkxZmI4ZGE1NzJmIiwiYXNzb2NpYXRpb25Ub2tlbiI6bnVsbCwic2NvcGVzIjpbeyJzY29wZSI6InB1dEZpbGVQcmVmaXgiLCJkb21haW4iOiJiaXRQYXRyb24vIn1dfQ.OLz3kgIOFBS-6XwacLnuTwiUCFDQ82HjSw7OablnYy_G9pz2e11KuuLMV4vo8K_vpk30VXOQgpOQ89ZZm9EsfQ";
      //jwtToken = "v1:eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NksifQ.eyJnYWlhQ2hhbGxlbmdlIjoiW1wiZ2FpYWh1YlwiLFwiMjAxOVwiLFwic3RvcmFnZTIuYmxvY2tzdGFjay5vcmdcIixcImJsb2Nrc3RhY2tfc3RvcmFnZV9wbGVhc2Vfc2lnblwiXSIsImh1YlVybCI6Imh0dHBzOi8vaHViLmJsb2Nrc3RhY2sub3JnIiwiaXNzIjoiMDNkYTdlODUxMGFiZWUxMjRlOTA2OGUyMDA4ZmUxYWRlM2FiYmI3ZTViM2U3ZDNmODhkY2EwMjNmYzg3ODJmMDU3Iiwic2FsdCI6IjljYTY4NzNiN2YyOTQxNzMwN2Y5MTE2MmNjMzc1ODI0In0.Y2l6Pnr8o4yQznPNp2rB1eWuDPLawXODOZ9V08z4zIc_MU804-G_2MUtzALyHAyZ7WpoOffxMzWXo6l_0xLVXQ"
      //jwtToken = "v1:eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NksifQ.eyJnYWlhQ2hhbGxlbmdlIjoiW1wiZ2FpYWh1YlwiLFwiMjAxOVwiLFwic3RvcmFnZTIuYmxvY2tzdGFjay5vcmdcIixcImJsb2Nrc3RhY2tfc3RvcmFnZV9wbGVhc2Vfc2lnblwiXSIsImh1YlVybCI6Imh0dHBzOi8vaHViLmJsb2Nrc3RhY2sub3JnIiwiaXNzIjoiMDNkYTdlODUxMGFiZWUxMjRlOTA2OGUyMDA4ZmUxYWRlM2FiYmI3ZTViM2U3ZDNmODhkY2EwMjNmYzg3ODJmMDU3Iiwic2FsdCI6IjljYTY4NzNiN2YyOTQxNzMwN2Y5MTE2MmNjMzc1ODI0In0.Y2l6Pnr8o4yQznPNp2rB1eWuDPLawXODOZ9V08z4zIc_MU804-G_2MUtzALyHAyZ7WpoOffxMzWXo6l_0xLVXQ"
    

    getOrSetLocalGaiaHubConnection().then( hubConfig => {
        hubConfig.token = jwtToken;
        hubConfig.address = "1D9RzJwNHhsmaE8j1CdJ4XZYLyzczURXNM"
        //hubConfig.server = TODO;
        uploadToGaiaHub('bitPatron/test2.html','<html><body> loaded at: ' + Date.toString() + '</body></html>', hubConfig)
          .then(res => alert(res));
      }
    )
  }
}
