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
      pageInfo: null
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
    this.props.handleSavePage(pageInfo);
  }
}