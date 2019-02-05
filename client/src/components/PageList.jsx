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
                            <div className="page-title">
                                EXPLORE
                            </div>
                        </div>
                    </div>
                    <div className="row">
                    {this.state.pages.map((page) => (
                        <div className="col-md-4">
                            <a key={page.username} className="page-card card mb-4">
                                <div className="card-body">
                                    <div className="card-title">{page.pageName}</div>
                                    <hr></hr>
                                    <div className="card-description multiline-truncate">{page.pageDescription}</div>
                                </div>
                                <div className="card-footer">
                                    <a className="btn btn-outline-primary" href={"/"+page.username}>EXPLORE</a>  
                                </div>
                            </a>
                        </div>
                    ))}
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