import React, { Component } from 'react';
import Posts from './Posts.jsx';
import {
    loadUserData
  } from 'blockstack';
import Axios from 'axios';
import { server_url } from '../config';

export default class PageList extends Component {
    constructor(props) {
        super(props);

        this.state = {
            pages: [],
            posts: [],
            showPosts: true,
        }
    }

    render() {
        const { handleSignOut } = this.props;
        return (
            <div>
                <div className="container">
                    <div className="row">
                        <div className="col-md-12">                      
                            <div className="page-title">
                                EXPLORE
                            </div>
                            <ul className="nav nav-pills mb-4">
                                <li className="nav-item">
                                    <a href="#" className={"nav-link "+ (this.state.showPosts ? "active":"")} onClick={e => this.showPosts()}>Posts</a>
                                </li>
                                <li className="nav-item">
                                    <a href="#" className={"nav-link "+ (!this.state.showPosts ? "active":"")} onClick={e => this.showCreators()}>Creators</a>
                                </li>
                            </ul>
                        </div>
                    </div>
                    <div className="row">
                    {this.state.showPosts && 
                        <Posts></Posts>
                    }
                    {!this.state.showPosts && this.state.pages.map((page) => (
                        <div key={page.username} className="col-md-4">
                            <div className="page-card card mb-4">
                                <div className="card-body">
                                    <div className="card-title">{page.pageName}</div>
                                    <hr></hr>
                                    <div className="card-description multiline-truncate">{page.pageDescription}</div>
                                </div>
                                <div className="card-footer">
                                    <a className="btn btn-outline-primary" href={"/"+page.username}>EXPLORE</a>  
                                </div>
                            </div>
                        </div>
                    ))}
                    </div>
                </div>
            </div>
        );
    }

    showPosts(){
        var shouldLoad = this.state.posts.length ==0;
        this.setState({showPosts:true, isLoading:shouldLoad});
    }

    showCreators(){
        var shouldLoad = this.state.pages.length == 0;
        this.setState({showPosts:false, isLoading:shouldLoad});
    }

    componentDidMount() {
      this.fetchData();
    }

    fetchData() {
        var url = server_url + '/api/v1/pages';

        Axios.get(url).then(response => {
            this.setState({pages:response.data});
          });
    }
}