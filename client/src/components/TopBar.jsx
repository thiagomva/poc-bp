import React, { Component } from 'react';

export default class TopBar extends Component {
  constructor(props) {
  	super(props);

  	this.state = {
    };
  }

  render() {
    const { handleSignOut } = this.props;
    const { username } = this.props;

    return (
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark fixed-top">
        <div className="container">
          <a className="nav-logo" href="/"><img src="./images/logowhite.svg"/></a>
          <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarResponsive" aria-controls="navbarResponsive" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarResponsive">
            <ul className="navbar-nav ml-auto">
              {username && 
                <li className="nav-item active">
                  <a className="nav-link clickable" href="/"><span>PROFILE:</span><span className="username">{username}</span></a>
                </li>
              }
              <li className="nav-item active">
                <a className="nav-link" href="/all-pages">Explore</a>
              </li>
              <li className="nav-item ">
                <a className="nav-link clickable" onClick={handleSignOut.bind(this)}>Logout</a>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    );
  }
}
