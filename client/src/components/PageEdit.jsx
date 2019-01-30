import React, { Component } from 'react';
import {
  loadUserData,
  Person,
  makeV1GaiaAuthToken,
  lookupProfile,
  getOrSetLocalGaiaHubConnection
} from 'blockstack';
import Axios from 'axios';
import { server_url } from '../config';

export default class PageEdit extends Component {

  constructor(props) {
    super(props);
    
    this.noEthereumWalletWarningMessage = 'You should set an Ethereum Wallet in your Blockstack account to create a page';

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
      newPageName: "",
      newPageDescription: "",
      newMonthlyPrice:undefined,
      newYearlyPrice: undefined,
      isLoading: false,
      pageInfo: null,
      hasEthereumAddress: undefined
    };
  }

  render() {

    return (
      <div className="new-page">
        <div className="col-md-12">
          <input className="input-page-name"
            value={this.state.newPageName}
            onChange={e => this.handleNewPageNameChange(e)}
            placeholder="What's your page name?"
          />
        </div>
        <div className="col-md-12">
          <input className="input-page-description"
            value={this.state.newPageDescription}
            onChange={e => this.handleNewPageDescriptionChange(e)}
            placeholder="What's your page description?"
          />
        </div>
        <div className="col-md-6">
          <input className="input-page-price" type="number"
            value={this.state.newMonthlyPrice}
            onChange={e => this.handleNewMonthlyPriceChange(e)}
            placeholder="Monthly price (USD)"
          />
        </div>
        <div className="col-md-6">
          <input className="input-page-duration" type="number"
            value={this.state.newYearlyPrice}
            onChange={e => this.handleNewYearlyPriceChange(e)}
            placeholder="Yearly price (USD)"
          />
        </div>
        <div className="col-md-12 text-right">
        <button 
            className="btn btn-secondary btn-lg margin-right-10"
            onClick={e => this.props.handleCancelEdition()}
          >
            Cancel
          </button>
          <button 
            className="btn btn-primary btn-lg"
            onClick={e => this.handleNewPageSubmit(e)}
          >
            Save
          </button>
        </div>
      </div>
    );
  }

  componentWillMount() {
    this.setState({
      person: new Person(loadUserData().profile),
      username: loadUserData().username
    })

    if (this.props.pageInfo) {
      this.setState({
        newPageName : this.props.pageInfo.pageName,
        newPageDescription : this.props.pageInfo.pageDescription,
        newMonthlyPrice : this.props.pageInfo.monthlyPrice,
        newYearlyPrice : this.props.pageInfo.yearlyPrice,
      })
    }
   /* this.saveJwtToken();
    this.writeUsingJwt();*/

    lookupProfile(loadUserData().username)
    .then((profile) => {
      var owner = new Person(profile).toJSON();
      var hasEthereumAddress = false;
      if (owner && owner.profile && owner.profile.account) {
        for (var i = 0; i < owner.profile.account.length; ++i) {
          if (owner.profile.account[i].service == "ethereum") {
            hasEthereumAddress = true;
            break;
          }
        }
      }
      if (!hasEthereumAddress && this.state.hasEthereumAddress != undefined) {
        alert(this.noEthereumWalletWarningMessage);
      }
      this.setState({ hasEthereumAddress: hasEthereumAddress });
    })
    .catch((error) => {
        console.log('could not resolve profile')
    });
  }

  componentDidMount() {
  }
  
  handleNewPageNameChange(event) {
    this.setState({newPageName: event.target.value})
  }

  handleNewPageDescriptionChange(event) {
    this.setState({newPageDescription: event.target.value})
  }

  handleNewMonthlyPriceChange(event) {
    this.setState({newMonthlyPrice: event.target.value})
  }

  handleNewYearlyPriceChange(event) {
    this.setState({newYearlyPrice: event.target.value})
  }

  handleNewPageSubmit(event) {
    event.preventDefault();
    if (!this.state.hasEthereumAddress) {
      alert(this.noEthereumWalletWarningMessage);
      var win = window.open("https://browser.blockstack.org/profiles", '_blank');
      win.focus();
    } else {
      var url = server_url + '/api/v1/authentication';
      var privateKey = loadUserData().appPrivateKey;
      let hubUrl = loadUserData().hubUrl;
      fetch(hubUrl + '/hub_info')
        .then(response => response.json())
        .then((hubInfo) => { 
          getOrSetLocalGaiaHubConnection().then(hubConfig => {
            var scopes = [{
              scope : "putFilePrefix",
              domain : "bp/",
              appPrivateKey: privateKey,
              address: hubConfig.address,
              hubServerUrl: hubUrl,
              hubUrlPrefix: hubInfo.read_url_prefix
            }];
            var token = makeV1GaiaAuthToken(hubInfo, privateKey, hubUrl, null, scopes);
            Axios.post(url, {
              jwt: token,
              username: loadUserData().username
            }).then(response => {
              let pageInfo = {
                pageName: this.state.newPageName,
                pageDescription: this.state.newPageDescription,
                monthlyPrice: parseFloat(this.state.newMonthlyPrice),
                yearlyPrice: parseInt(this.state.newYearlyPrice),
                files: this.props.pageInfo ? this.props.pageInfo.files : {}
              };
              this.props.handleSavePage(pageInfo);
            });
          });
        });
    }
  }
}
