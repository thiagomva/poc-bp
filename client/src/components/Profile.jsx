import React, { Component } from 'react';
import PageEdit from './PageEdit.jsx';
import NewPost from './NewPost.jsx';
import PublicList from './PublicList.jsx';
import Topbar from './TopBar.jsx';
import { server_url } from '../config';
import Axios from 'axios';

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
      isCreatingPost: false,
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
      if(!pageInfo.files){
        pageInfo.files= {};
      }
      let docOptions = {
        encrypt: false
      };
      this.setState({isLoading: true});
      putFile('pageInfo.json', JSON.stringify(pageInfo), docOptions)
        .then(() => {
          this.setState({pageInfo: pageInfo});
          var url = server_url + '/api/v1/pages';
          Axios.post(url, {
            userBlockstackId: loadUserData().username,
            pageName: pageInfo.pageName,
            pageDescription: pageInfo.pageDescription,
            numberOfPosts: Object.keys(pageInfo.files).length
          }).then(response => {
            
          });
        })
        .finally(()=>{
          this.setState({isLoading: false,isEditing:false,isCreatingPost:false});
        });
    }

    var handleCancelEdition = () => {
      this.setState({isLoading: false,isEditing:false,isCreatingPost:false});
    }

    return (
      !isSignInPending() && person ?
	  <div>
		<Topbar handleSignOut={handleSignOut} username={loadUserData().username}/>
		<div className="container">
			<div className="row">
			  <div className="col-md-12">
				<div className="row header-section">
				  <div className="title-section col-md-8">
					  <div className="">
                <h1>
                  <span>
                  { 
                    this.state.isLoading ? "Loading..." :
                    this.state.pageInfo && this.state.pageInfo.pageName ? 
                    this.state.pageInfo.pageName : person.name() ? person.name()
                    : username.split('.')[0]+"'s Page" }</span>&nbsp;&nbsp;
                  </h1>
                <h4>
                  { this.state.pageInfo && this.state.pageInfo.pageDescription ? this.state.pageInfo.pageDescription : "" }
                </h4>
              </div>
				  </div>
				  <div className="col-md-4">
				  {this.showNewPost() &&
					<button
					className="btn btn-primary pull-right"
					onClick={e => this.handleNewPost(e)}
					>
					{this.state.isCreatingPost ? 'Cancel' : 'New Post'}
					</button>
          }
          {
					this.isLocalAndHasConfiguredPage() && !this.state.isEditing &&
					<button
					className="btn btn-primary pull-right margin-right-10"
					onClick={e => this.handleEditPage(e)}
					>
					Edit Page
					</button>
				  }
				  </div>
				</div>
            
				{this.showNewPostForm() && 
				  <NewPost handleSavePage={handleNewPageSubmit}/>
				}
				{this.showPageEdit() &&
				  <PageEdit pageInfo={this.state.pageInfo} handleSavePage={handleNewPageSubmit} handleCancelEdition={handleCancelEdition}/>
				}
				<div className="col-md-12">
				{ 
				  <PublicList pageInfo={this.state.pageInfo} pageUsername={this.state.pageUsername}/>
				}
				</div>
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
    this.fetchData();
  }

  handleNewStatusChange(event) {
    this.setState({newStatus: event.target.value})
  }

  handleEditPage(event){
    this.setState({isEditing: true})
  }

  handleNewPost(event){
    this.setState({isCreatingPost: !this.state.isCreatingPost})
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

  showNewPostForm(){
    return !this.state.isLoading && this.isLocalAndHasConfiguredPage() && !this.state.isEditing && this.state.isCreatingPost;
  }

  showPageEdit(){
    return !this.state.isLoading && (this.isLocalAndHasNotConfiguredPage() || this.state.isEditing);
  }
}
