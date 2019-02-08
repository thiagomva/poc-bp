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
import ImageUploader from './ImageUploader.jsx';

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
      newMonthlyPrice:undefined,
      newYearlyPrice: undefined,
      isLoading: false
    };
  }

  render() {

    return (
      <div className="new-page">
        <div className="row">
            <div className="col-md-12">
                {this.props.pageInfo ? <div className="page-title">
                    EDIT PAGE
                </div> :
                <div className="page-title">
                    CREATE PAGE
                </div>}
            </div>
        </div>
        <div className="row">
          <div className="col-lg-2">
            <div className="row">
              <div className="col-md-12 paid-subscription-title">&nbsp;</div>
              <div className="col-md-12">
                <ImageUploader></ImageUploader>
              </div>
            </div>
          </div>
          <div className="col-lg-6">
            <div className="row">
              <div className="col-md-12 paid-subscription-title">&nbsp;</div>
              <div className="col-md-12 mb-3">
                <input className="form-control input-page-name" type="text"
                  value={this.state.newPageName}
                  onChange={e => this.handleNewPageNameChange(e)}
                  placeholder="What's your page name?"
                />
              </div>
              <div className="col-md-12">
                <textarea className="form-control input-page-description"
                  value={this.state.newPageDescription}
                  onChange={e => this.handleNewPageDescriptionChange(e)}
                  placeholder="What's your page description?"
                />
              </div>
            </div>
          </div>
          <div className="col-lg-4">
            <div className="row">
              <div className="col-md-12 paid-subscription-title">Set up paid subscriptions</div>
              <div className="col-md-12 mb-3">
                <div className="input-group">
                  <div className="input-group-prepend">
                    <span className="input-group-text">$</span>
                  </div>
                  <input className="form-control input-page-price" type="number"
                    value={this.state.newMonthlyPrice}
                    onChange={e => this.handleNewMonthlyPriceChange(e)}
                    placeholder="Monthly price (USD)"
                  />
                  <div className="input-group-append">
                    <span className="input-group-text">per month</span>
                  </div>
                </div>
              </div>
              <div className="col-md-12 mb-3">
              <div className="input-group">
                  <div className="input-group-prepend">
                    <span className="input-group-text">$</span>
                  </div>
                  <input className="form-control input-page-yearly" type="number"
                    value={this.state.newYearlyPrice}
                    onChange={e => this.handleNewYearlyPriceChange(e)}
                    placeholder="Yearly price (USD)"
                    aria-describedby="yearlyPriceHelp"
                  />
                  <div className="input-group-append">
                    <span className="input-group-text">per year</span>
                  </div>
                </div>
                <small id="yearlyPriceHelp" className="form-text text-muted text-center">We recommend less than 10x monthly price</small>
              </div>
              <div className="col-md-12 text-center buttons-row">
                {this.props.pageInfo && <button 
                    className="btn btn-secondary btn-lg margin-right-10"
                    onClick={e => this.props.handleCancelEdition()}
                  >
                    Cancel
                  </button>
                }
                <button className="btn btn-primary btn-lg my-4" 
                  onClick={e => this.handleNewPageSubmit(e)}>
                  Save
                </button>
              </div>
            </div>
          </div>        
        </div>
        <div className="col-md-12 text-right">
        
          
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

    lookupProfile(loadUserData().username)
    .then((profile) => {
      var owner = new Person(profile).toJSON();
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
    let pageInfo = {
      pageName: this.state.newPageName,
      pageDescription: this.state.newPageDescription,
      monthlyPrice: parseFloat(this.state.newMonthlyPrice),
      yearlyPrice: parseFloat(this.state.newYearlyPrice),
      files: this.props.pageInfo ? this.props.pageInfo.files : {}
    };
    
    if(this.checkEmptyField(pageInfo.pageName)){
      alert("Page name is required");
      return;
    }
    if(this.checkEmptyField(pageInfo.pageDescription)){
      alert("Page description is required");
      return;
    }
    if(this.checkEmptyField(pageInfo.monthlyPrice)){
      alert("Monthly price is required and needs to be greater than 0");
      return;
    }
    if(this.checkEmptyField(pageInfo.yearlyPrice)){
      alert("Yearly price is required and needs to be greater than 0");
      return;
    }

    this.props.handleSavePage(pageInfo);
  }

  checkEmptyField(value){
    return value == null || (typeof value == "string" && value.trim() == "" ) || (typeof value == "number" && (value <= 0 || Number.isNaN(value)))
  }
}