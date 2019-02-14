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
            files: [],
            profiles: {},
            currentPage: 0,
            pageSize: 20,
        }
    }

    render() {
        const { handleSignIn } = this.props;
        return (
            <div className="container">                            
                {this.state.files.map((file) => (<div key={file.name+"_"+file.username} className="card  mb-4">
                    <div className="card-body">
                        <div className="row">
                            <div className="col-md">
                                <a href={this.getPostUrl(file)} className="post-date pull-left">
                                {file.postTime && new Date(file.postTime).toLocaleDateString({}, { year: 'numeric', month: 'short', day: 'numeric', hour:'numeric', minute:'numeric' })}
                                </a>
                                <div className="post-visibility float-right">
                                    {!file.isPublic && <div><i className="fa fa-lock"></i> Locked</div>}
                                    {file.isPublic && <div><i className="fa fa-globe"></i> Public</div>}
                                </div>
                            </div>
                        </div>
                        <div className="post-title"> {file.title}</div>
                        <div className="post-description"> {file.description}</div>
                    </div>
                    <div className="card-footer">
                        <div className="pull-left post-user">
                        <img src={ (this.getProfileFromPostFileName(file) && this.getProfileFromPostFileName(file).avatarUrl()) ? this.getProfileFromPostFileName(file).avatarUrl() : avatarFallbackImage }
                            className="img-rounded avatar mini-avatar"
                            id="avatar-image"/>
                            Posted by {this.getProfileFromPostFileName(file) && this.getProfileFromPostFileName(file).name() ? this.getProfileFromPostFileName(file).name() : file.username.split('.')[0]}
                        </div>
                        <div className="pull-right">
                            {!file.isPublic && <a href={this.getPostUrl(file)} className='btn btn-primary'><span><i className="fa fa-lock"></i> View Post</span></a>}
                            {file.isPublic && <a href={this.getPostUrl(file)} className='btn btn-primary'><span>View Post</span></a>}
                        </div>
                    </div>
                </div>
                ))}
                <div className="text-center mb-4">
                    {!this.state.isLoading && this.state.files.length == (this.state.currentPage * this.state.pageSize) && 
                        <div onClick={e => this.fetchData()} className='btn btn-primary'><span>Load More</span></div>
                    }
                    {this.state.isLoading &&
                        <span>Loading...</span>
                    }
                </div>
            </div>
        );
    }

    getProfileFromPostFileName(file){
        return (file && file.username && this.state.profiles) ? 
            this.state.profiles[file.username] : null;
    }
    
    getPostUrl(file){
        return "/"+file.username+"/"+file.name+"/"+this.formatPostTitle(file.title);
    }
    
    formatPostTitle(title){
        return typeof title == "string" ? title.split(' ').join('-') : '';
    }

    componentWillMount(){
        this.fetchData();
    }

    fetchData() {
        this.setState({isLoading:true});
        var lastPostTime = null;
        if(this.state.files && this.state.files.length > 0){
            lastPostTime = this.state.files[this.state.files.length-1].postTime;
        }
        var url = server_url + '/api/v1/posts?pageSize='+this.state.pageSize;
        if(lastPostTime){
            url+='&lastPostTime='+lastPostTime;
        }        
        
        Axios.get(url).then(response => {
            var concatFiles = this.state.files.concat(response.data);
            var currentPage = this.state.currentPage+1;
            this.setState({files:concatFiles,currentPage:currentPage, isLoading:false},
                ()=>{
                    this.getProfileFromPosts();
                });
            }).finally(()=>this.setState({isLoading:false}));
    }

    getProfileFromPosts() {
        var usernames = new Set(this.state.files.map(file => {return file.username}));
        var profiles = this.state.profiles;
        usernames.forEach(
            username => 
            {
                if(profiles[username] == null){
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
            }
        );
    }
}