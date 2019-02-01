import React, { Component } from 'react';
import Topbar from './TopBar.jsx';
import {
    loadUserData
  } from 'blockstack';
import Axios from 'axios';
import { server_url } from '../config';

export default class PageList extends Component {
    constructor(props) {
        super(props);

        this.state = {
            pages: []
        }
    }

    render() {
        const { handleSignOut } = this.props;
        return (
            <div>
                <Topbar handleSignOut={handleSignOut} username={loadUserData().username}/>
                <div className="container">
                    <div className="row">
                        <div className="col-md-12">
                            <div className="header-section title-section">
                                <div>
                                    <h1><span>All Pages</span></h1>
                                    <h4>Find the best content on BitPatron</h4>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-md-12">
                        {this.state.pages.map((page) => (
                            <a key={page.username} className="card clickable mb-4" href={"/"+page.username}>
                                <h3 className="card-header">{page.pageName}<i className="pull-right fa fa-external-link"></i></h3>
                                <div className="card-body">
                                    <h4>{page.pageDescription}</h4>
                                    <span>Number of Posts: {page.numberOfPosts}</span>
                                </div>
                            </a>
                        ))}
                        </div>
                    </div>
                </div>
            </div>
        );
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