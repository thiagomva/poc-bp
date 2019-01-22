import React, { Component } from 'react';
import {
  loadUserData,
  Person,
  makeV1GaiaAuthToken,
  lookupProfile,
  getOrSetLocalGaiaHubConnection,
  uploadToGaiaHub
} from 'blockstack';

export default class PageEdit extends Component {
  constructor(props) {
  	super(props);

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
      newSubscriptionPrice:undefined,
      newSubscriptionDuration: undefined,
      isLoading: false,
      pageInfo: null,
      hasEthereumAddress: false
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
            value={this.state.newSubscriptionPrice}
            onChange={e => this.handleNewSubscriptionPriceChange(e)}
            placeholder="Subscription price (ETH)"
          />
        </div>
        <div className="col-md-6">
          <input className="input-page-duration" type="number"
            value={this.state.newSubscriptionDuration}
            onChange={e => this.handleNewSubscriptionDurationChange(e)}
            placeholder="Subscription duration (days)"
          />
        </div>
        <div className="col-md-12 text-right">
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
        newSubscriptionPrice : this.props.pageInfo.subscriptionPrice,
        newSubscriptionDuration : this.props.pageInfo.subscriptionDuration,
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
      this.setState(
        {
          hasEthereumAddress: hasEthereumAddress
        }
      );
      if (!hasEthereumAddress) {
        alert('You should set an Ethereum Wallet on your Blockstack account for create a page');
      }
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

  handleNewSubscriptionPriceChange(event) {
    this.setState({newSubscriptionPrice: event.target.value})
  }

  handleNewSubscriptionDurationChange(event) {
    this.setState({newSubscriptionDuration: event.target.value})
  }

  handleNewPageSubmit(event) {
    if (!this.state.hasEthereumAddress) {
      alert('You should set an Ethereum address on your Blockstack account for create a page');
    } else {
      let pageInfo = {
        pageName: this.state.newPageName,
        pageDescription: this.state.newPageDescription,
        subscriptionPrice: parseFloat(this.state.newSubscriptionPrice),
        subscriptionDuration: parseInt(this.state.newSubscriptionDuration),
        files: this.props.pageInfo ? this.props.pageInfo.files : {}
      };
     
      this.props.handleSavePage(pageInfo);
    }
  }

 /* saveJwtToken() {
    let privateKey = loadUserData().appPrivateKey;
    let scopes = ['store_write', 'publish_data'];
    let hubUrl = loadUserData().hubUrl;
    fetch(hubUrl+'/hub_info')
    .then(response => response.json())
    .then((hubInfo) => {
            let token =  makeV1GaiaAuthToken(hubInfo, privateKey, hubUrl, null, scopes);
          });
  }
  writeUsingJwt(){
    let jwtToken = "v1:eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NksifQ.eyJnYWlhQ2hhbGxlbmdlIjoiW1wiZ2FpYWh1YlwiLFwiMjAxOVwiLFwic3RvcmFnZTIuYmxvY2tzdGFjay5vcmdcIixcImJsb2Nrc3RhY2tfc3RvcmFnZV9wbGVhc2Vfc2lnblwiXSIsImh1YlVybCI6Imh0dHBzOi8vaHViLmJsb2Nrc3RhY2sub3JnIiwiaXNzIjoiMDNkYTdlODUxMGFiZWUxMjRlOTA2OGUyMDA4ZmUxYWRlM2FiYmI3ZTViM2U3ZDNmODhkY2EwMjNmYzg3ODJmMDU3Iiwic2FsdCI6IjFkMTc1ZGUzM2FlZWJlYzgwZjY1ZWJmMjMwOGNkMDQzIiwiYXNzb2NpYXRpb25Ub2tlbiI6bnVsbCwic2NvcGVzIjpbInN0b3JlX3dyaXRlIiwicHVibGlzaF9kYXRhIl19.5QG3-dYUtx_eJQX9u38189AKQbMYpkNzPh_ZaXmmgZGinS1AlJDC2ogrAZjrgtX7yPC_ieFmKUUJjzYQY_atug";
    getOrSetLocalGaiaHubConnection().then( hubConfig => {
        hubConfig.token = jwtToken;
        //hubConfig.server = TODO;
        uploadToGaiaHub('test.html','<html><body> loaded at: ' + Date.toString() + '</body></html>', hubConfig)
          .then(res => alert(res));
      }

    )
  }*/
}
