import React, { Component, Link } from 'react';
import { Switch, Route } from 'react-router-dom'
import Profile from './Profile.jsx';
import TopBar from './TopBar.jsx';
import Site from './Site.jsx';
import DiscordAuth from './DiscordAuth.jsx';

import {
  isSignInPending,
  isUserSignedIn,
  redirectToSignIn,
  handlePendingSignIn,
  signUserOut,
} from 'blockstack';
import PageList from './PageList.jsx';

export default class App extends Component {

  constructor(props) {
  	super(props);
  }

  handleSignIn(e) {
    if(e && e.preventDefault){
      e.preventDefault();
    }
    const origin = window.location.origin
    redirectToSignIn(origin, origin + '/manifest.json', ['store_write', 'publish_data', 'email'])
  }

  handleSignOut(e) {
    e.preventDefault();
    signUserOut(window.location.origin);
  }

  render() {
    return (
      <div className="site-wrapper">
        <TopBar handleSignOut={this.handleSignOut} handleSignIn={ this.handleSignIn }/>
        <div className="site-wrapper-inner">
          {
            <Switch>
              <Route path='/explore'
                render={
                  routeProps => <PageList handleSignOut={ this.handleSignOut } {...routeProps} />
                }
              />
              <Route
                path='/discordAuth/:owner?'
                render={
                  routeProps => <DiscordAuth handleSignIn={ this.handleSignIn } {...routeProps} />
                }
              />
              <Route
                path='/:username/:postId?/:postTitle?'
                render={
                  routeProps => <Profile handleSignIn={ this.handleSignIn } {...routeProps} />
                }
              />              
              {!isUserSignedIn() ?
              <Route path='/' render={routeProps => <Site handleSignIn={ this.handleSignIn } />}/>
              : <Route path='/' render={routeProps => <Profile handleSignIn={ this.handleSignIn } {...routeProps}/>}/>
              }
            </Switch>
          }
        </div>
      </div>
    );
  }

  componentWillMount() {
    if (isSignInPending()) {
      handlePendingSignIn().then((userData) => {
        window.location = window.location.origin;
      });
    }
  }
}
