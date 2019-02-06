import React, { Component } from 'react';
import {
  isUserSignedIn,
  isSignInPending,
  loadUserData
} from 'blockstack';
import NavLink from './NavLink.jsx';

export default class TopBar extends Component {
  constructor(props) {
  	super(props);

  	this.state = {
    };
  }

  render() {
    const { handleSignOut } = this.props;
    const { handleSignIn } = this.props;
    var username = null;
    if(isUserSignedIn()){
      username = loadUserData().username;
    }

    return (
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark fixed-top">
        <div className="container">
          <a className="nav-logo" href="/"><img src="./images/logowhite.svg"/></a>
          <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarResponsive" aria-controls="navbarResponsive" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarResponsive">
            <ul className="navbar-nav mr-auto ml-5">
              <NavLink to="/" title="HOME"></NavLink>
              <NavLink to="/explore" title="EXPLORE"></NavLink>
            </ul>
            <ul className="navbar-nav ml-auto">
              <li className="nav-item twitter-nav-item">
                <a className="nav-link clickable" href="https://twitter.com/BitPatronCo" target="_blank"><i className="fa fa-twitter"></i></a>
              </li>
              <div className="nav-separator mx-2"></div>
              {username && 
                <li className="nav-item">                  
                  <a className="nav-link clickable" href="/"><i className="fa fa-user-circle mx-1"></i><span>{username}</span></a>
                </li>
              }
              {username && 
                <li className="nav-item ">
                  <a className="nav-link clickable" onClick={handleSignOut.bind(this)}>Logout</a>
                </li>
              }
              {!username && 
              <li className="nav-item ">
                <a className="nav-link clickable" onClick={handleSignIn.bind(this)}>Login</a>
              </li>
              }
            </ul>
          </div>
        </div>
      </nav>
    );
  }
}
