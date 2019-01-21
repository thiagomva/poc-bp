import React, { Component } from 'react';
import {
  loadUserData,
  Person,
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
      newPagePrice:undefined,
      newPageDuration: undefined,
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
            value={this.state.newPagePrice}
            onChange={e => this.handleNewPagePriceChange(e)}
            placeholder="Subscription price (ETH)"
          />
        </div>
        <div className="col-md-6">
          <input className="input-page-duration" type="number"
            value={this.state.newPageDuration}
            onChange={e => this.handleNewPageDurationChange(e)}
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

    if(this.props.pageInfo){
      this.setState({
        newPageName : this.props.pageInfo.pageName,
        newPageDescription : this.props.pageInfo.pageDescription,
        newPagePrice : this.props.pageInfo.pagePrice,
        newPageDuration : this.props.pageInfo.pageDuration,
      })
    }
  }

  componentDidMount() {
  }
  
  handleNewPageNameChange(event) {
    this.setState({newPageName: event.target.value})
  }

  handleNewPageDescriptionChange(event) {
    this.setState({newPageDescription: event.target.value})
  }

  handleNewPagePriceChange(event) {
    this.setState({newPagePrice: event.target.value})
  }

  handleNewPageDurationChange(event) {
    this.setState({newPageDuration: event.target.value})
  }

  handleNewPageSubmit(event) {
    let pageInfo = {
      pageName: this.state.newPageName,
      pageDescription: this.state.newPageDescription,
      pagePrice: this.state.newPagePrice,
      pageDuration:this.state.newPageDuration
    };
    this.props.handleSavePage(pageInfo);
  }
}
