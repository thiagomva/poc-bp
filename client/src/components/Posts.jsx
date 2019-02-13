import React, { Component } from 'react';
import { server_url } from '../config';
import Axios from 'axios';

import {
    loadUserData,
    getFile,
    getPublicKeyFromPrivate,
    lookupProfile,
    Person,
    decryptContent
  } from 'blockstack';

const avatarFallbackImage = 'https://s3.amazonaws.com/onename/avatar-placeholder.png';

export default class Posts extends Component {
    constructor(props) {
        super(props);

        this.state = {
            isLoading: true,            
            files: {},
            profiles: {}
        }
    }

    render() {
        const { handleSignIn } = this.props;
        return (
            <div className="container">
                <div className="row">
                    <div className="col-md-12">
                        {this.state.isLoading &&
                            <h1>Loading...</h1>
                        }
                        <div className="file-container">
                            <div className="row">
                                <div className="col-md-12 mb-2">
                                    <div className="page-title">
                                        POSTS
                                    </div>
                                </div>
                            </div>
                            
                            {this.getFilesNamesDescOrderdByDate().map((fileName) => (<div key={fileName} className="card  mb-4">
                                <div className="card-body">
                                    <div className="row">
                                        <div className="col-md">
                                            <a href={this.getPostUrl(fileName)} className="post-date pull-left">
                                            {this.state.files[fileName].postTime && new Date(this.state.files[fileName].postTime).toLocaleDateString({}, { year: 'numeric', month: 'short', day: 'numeric', hour:'numeric', minute:'numeric' })}
                                            </a>
                                            <div className="post-visibility float-right">
                                                {!this.state.files[fileName].isPublic && <div><i className="fa fa-lock"></i> Locked</div>}
                                                {this.state.files[fileName].isPublic && <div><i className="fa fa-globe"></i> Public</div>}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="post-title"> {this.state.files[fileName].title}</div>
                                    <div className="post-description"> {this.state.files[fileName].description}</div>
                                </div>
                                <div className="card-footer">
                                    <div className="pull-left post-user">
                                    <img src={ (this.getProfileFromPostFileName(fileName) && this.getProfileFromPostFileName(fileName).avatarUrl()) ? this.getProfileFromPostFileName(fileName).avatarUrl() : avatarFallbackImage }
                                        className="img-rounded avatar mini-avatar"
                                        id="avatar-image"/>
                                        Posted by {this.getProfileFromPostFileName(fileName) && this.getProfileFromPostFileName(fileName).name() ? this.getProfileFromPostFileName(fileName).name() : this.state.files[fileName].ownerUsername.split('.')[0]}
                                    </div>
                                    <div className="pull-right">
                                        {!this.state.files[fileName].isPublic && <a href={this.getPostUrl(fileName)} className='btn btn-primary'><span><i className="fa fa-lock"></i> View Post</span></a>}
                                        {this.state.files[fileName].isPublic && <a href={this.getPostUrl(fileName)} className='btn btn-primary'><span>View Post</span></a>}
                                    </div>
                                </div>
                            </div>
                            ))}
                    </div>
                </div>
            </div>
        </div>
        );
    }

    getProfileFromPostFileName(fileName){
        return (this.state.files && this.state.files[fileName] &&
            this.state.files[fileName].ownerUsername && this.state.profiles) ? 
            this.state.profiles[this.state.files[fileName].ownerUsername] : null;
    }
    
    getPostUrl(fileName){
        return "/"+this.state.files[fileName].ownerUsername+"/"+fileName+"/"+this.formatPostTitle(this.state.files[fileName].title);
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

    componentWillMount(){
        this.fetchData();
    }

    fetchData() {
        var url = server_url + '/api/v1/posts';
        
        Axios.get(url).then(response => {
            this.setState({files:response.data},
                ()=>{
                    this.getProfileFromPosts();
                });
            });
    }

    getProfileFromPosts() {
        var usernames = new Set(Object.keys(this.state.files).map(filename => {return this.state.files[filename].ownerUsername}));
        var profiles = {};
        usernames.forEach(
            username => 
            {
                profiles[username] = null;
                lookupProfile(username)
                .then((profile) => {
                    var person = new Person(profile);
                    profiles[username] = person;
                    this.setState(
                        {
                            profiles: profiles,
                        }, 
                    );
                   })
                .catch((error) => {
                    console.log('could not resolve profile')
                });
            }
        );
    }
}