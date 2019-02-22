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
      newMonthlyPrice:"",
      newYearlyPrice: "",
      newHalfYearlyPrice: "",
      newQuarterlyPrice: "",
      quarterSwitchValue: false,
      monthSwitchValue: false,
      yearSwitchValue: false,
      halfYearSwitchValue: false,
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
                <input className="form-control input-page-name" type="text" maxLength="50"
                  value={this.state.newPageName}
                  onChange={e => this.handleNewPageNameChange(e)}
                  placeholder="What's your page name?"
                />
              </div>
              <div className="col-md-12">
                <textarea className="form-control input-page-description" maxLength="500"
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
                <div className="custom-control custom-switch">
                  <input type="checkbox" className="custom-control-input" id="monthSwitch" onChange={e => this.handleMonthSwitch(e)} checked={this.state.monthSwitchValue} />
                  <label className="custom-control-label" for="monthSwitch">
                    <div className="input-group">
                      <div className="input-group-prepend">
                        <span className="input-group-text">$</span>
                      </div>
                      <input className="form-control input-page-price" type="number"
                        value={this.state.newMonthlyPrice}
                        onChange={e => this.handleNewMonthlyPriceChange(e)}
                        disabled={!this.state.monthSwitchValue}
                      />
                      <div className="input-group-append">
                        <span className="input-group-text">per month</span>
                      </div>
                    </div>
                  </label>
                </div>  
              </div>
              <div className="col-md-12 mb-3">
                <div className="custom-control custom-switch">
                  <input type="checkbox" className="custom-control-input" id="quarterSwitch" onChange={e => this.handleQuarterSwitch(e)} checked={this.state.quarterSwitchValue} />
                  <label className="custom-control-label" for="quarterSwitch">
                    <div className="input-group">
                      <div className="input-group-prepend">
                        <span className="input-group-text">$</span>
                      </div>
                      <input className="form-control input-page-quarterly" type="number"
                        value={this.state.newQuarterlyPrice}
                        onChange={e => this.handleNewQuarterlyPriceChange(e)}
                        disabled={!this.state.quarterSwitchValue}
                      />
                      <div className="input-group-append">
                        <span className="input-group-text">per quarter</span>
                      </div>
                    </div>
                  </label>
                </div>                
              </div>
              <div className="col-md-12 mb-3">
                <div className="custom-control custom-switch">
                  <input type="checkbox" className="custom-control-input" id="halfYearSwitch" onChange={e => this.handleHalfYearSwitch(e)} checked={this.state.halfYearSwitchValue} />
                  <label className="custom-control-label" for="halfYearSwitch">
                    <div className="input-group">
                      <div className="input-group-prepend">
                        <span className="input-group-text">$</span>
                      </div>
                      <input className="form-control input-page-half-yearly" type="number"
                        value={this.state.newHalfYearlyPrice}
                        onChange={e => this.handleNewHalfYearlyPriceChange(e)}
                        disabled={!this.state.halfYearSwitchValue}
                      />
                      <div className="input-group-append">
                        <span className="input-group-text">per half year</span>
                      </div>
                    </div>
                  </label>
                </div>
              </div>
              <div className="col-md-12 mb-3">
                <div className="custom-control custom-switch">
                  <input type="checkbox" className="custom-control-input" id="yearSwitch" onChange={e => this.handleYearSwitch(e)} checked={this.state.yearSwitchValue} />
                  <label className="custom-control-label" for="yearSwitch">
                    <div className="input-group">
                      <div className="input-group-prepend">
                        <span className="input-group-text">$</span>
                      </div>
                      <input className="form-control input-page-yearly" type="number"
                        value={this.state.newYearlyPrice}
                        onChange={e => this.handleNewYearlyPriceChange(e)}
                        disabled={!this.state.yearSwitchValue}
                      />
                      <div className="input-group-append">
                        <span className="input-group-text">per year</span>
                      </div>
                    </div>
                  </label>
                </div>
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

    componentDidMount() {
    this.setState({
      person: new Person(loadUserData().profile),
      username: loadUserData().username
    })

    if (this.props.pageInfo) {
      this.setState({
        newPageName : this.props.pageInfo.pageName,
        newPageDescription : this.props.pageInfo.pageDescription,
        newMonthlyPrice : this.props.pageInfo.monthlyPrice,
        monthSwitchValue: this.props.pageInfo.monthlyPrice > 0,
        newYearlyPrice : this.props.pageInfo.yearlyPrice,
        yearSwitchValue: this.props.pageInfo.yearlyPrice > 0,
        newQuarterlyPrice : this.props.pageInfo.quarterlyPrice,
        quarterSwitchValue: this.props.pageInfo.quarterlyPrice > 0,
        newHalfYearlyPrice : this.props.pageInfo.halfYearlyPrice,
        halfYearSwitchValue: this.props.pageInfo.halfYearlyPrice > 0
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

  handleNewQuarterlyPriceChange(event) {
    this.setState({newQuarterlyPrice: event.target.value})
  }

  handleNewHalfYearlyPriceChange(event) {
    this.setState({newHalfYearlyPrice: event.target.value})
  }

  handleQuarterSwitch(event) {
    var newQuarterlyPrice = this.state.newQuarterlyPrice;
    if(!event.target.checked){
      newQuarterlyPrice = "";
    }
    this.setState({quarterSwitchValue: event.target.checked, newQuarterlyPrice: newQuarterlyPrice})
  }

  handleMonthSwitch(event) {
    var newMonthlyPrice = this.state.newMonthlyPrice;
    if(!event.target.checked){
      newMonthlyPrice = "";
    }
    this.setState({monthSwitchValue: event.target.checked, newMonthlyPrice: newMonthlyPrice})
  }

  handleHalfYearSwitch(event) {
    var newHalfYearlyPrice = this.state.newHalfYearlyPrice;
    if(!event.target.checked){
      newHalfYearlyPrice = "";
    }
    this.setState({halfYearSwitchValue: event.target.checked, newHalfYearlyPrice: newHalfYearlyPrice})
  }

  handleYearSwitch(event) {
    var newYearlyPrice = this.state.newYearlyPrice;
    if(!event.target.checked){
      newYearlyPrice = "";
    }
    this.setState({yearSwitchValue: event.target.checked, newYearlyPrice: newYearlyPrice})
  }

  handleNewPageSubmit(event) {
    event.preventDefault();
    let pageInfo = {
      pageName: this.state.newPageName,
      pageDescription: this.state.newPageDescription,
      monthlyPrice: parseFloat(this.state.newMonthlyPrice),
      yearlyPrice: parseFloat(this.state.newYearlyPrice),
      quarterlyPrice: parseFloat(this.state.newQuarterlyPrice),
      halfYearlyPrice: parseFloat(this.state.newHalfYearlyPrice),
      files: this.props.pageInfo ? this.props.pageInfo.files : {}
    };
    
    if(this.checkEmptyField(pageInfo.pageName)){
      alert("Page name is required");
      return;
    }
    if(this.checkMaxLengthExceeded(pageInfo.pageName,50)){
      alert("Page name must not exceed 50 characters");
      return;
    }
    if(this.checkEmptyField(pageInfo.pageDescription)){
      alert("Page description is required");
      return;
    }
    if(this.checkMaxLengthExceeded(pageInfo.pageDescription,500)){
      alert("Page description must not exceed 500 characters");
      return;
    }
    if(this.checkEmptyField(pageInfo.monthlyPrice) &&
      this.checkEmptyField(pageInfo.yearlyPrice) &&
      this.checkEmptyField(pageInfo.quarterlyPrice) &&
      this.checkEmptyField(pageInfo.halfYearlyPrice)
    ){
      alert("At least one price is required and needs to be greater than 0");
      return;
    }

    this.props.handleSavePage(pageInfo);
  }

  checkEmptyField(value){
    return value == null || (typeof value == "string" && value.trim() == "" ) || (typeof value == "number" && (value <= 0 || Number.isNaN(value)))
  }

  checkMaxLengthExceeded(value, length){
    return value.length > length;
  }
}