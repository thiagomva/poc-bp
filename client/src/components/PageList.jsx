import React, { Component } from 'react';
import Topbar from './TopBar.jsx';
import {
    loadUserData
  } from 'blockstack';
import Axios from 'axios';
import { server_url } from '../config';
import Helmet from 'react-helmet';

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
                <Helmet>
                    <title>BitPatron</title>
                    <meta property="og:site_name" content="BitPatron - The Bitcoin censorship-free Patreon alternative"/>
                    <meta property="og:title" content="BitPatron - The Bitcoin censorship-free Patreon alternative"/>
                    <meta name="description" content="Express your voice, without being controlled by big corporates. Help us shape the future of Free Speech and Bitcoin adoption to get a lifetime fee discount."/>
                    <meta name="author" content="BitPatron"/>
                    <meta property="og:type" content="website"/>
                    <meta property="og:description" content="Express your voice, without being controlled by big corporates. Help us shape the future of Free Speech and Bitcoin adoption to get a lifetime fee discount."/>
                    <meta property="og:image" content="https://bitpatron.co/img/FB_BitPatron_1200x600.png"/>
                </Helmet>
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