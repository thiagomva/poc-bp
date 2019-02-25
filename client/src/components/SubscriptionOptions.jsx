import React, { Component } from 'react';
import Axios from 'axios';
import { server_url, open_node_url } from '../config';
import {
    getPublicKeyFromPrivate,
    loadUserData
  } from 'blockstack';

export default class SubscriptionOptions extends Component {
    constructor(props) {
        super(props);

        this.state = {
            subscriptionPeriodType: null
          };
    }

    render() {
        return (<div>
            <div className="card">
              <div className="card-body prices">
              {this.props.yearlyPrice > 0 && <div className={(this.props.alignCenter ? "payment-option-modal " : "") + "row"}>
                  <div className="col-md-12">
                    <label>
                      <input
                        type="radio"
                        name={"payment" + this.props.radioGroupName}
                        value="1"
                        checked={this.canSubscribe() && this.state.subscriptionPeriodType == "1"}
                        onChange={e => this.handleSubscriptionTypeChange(e)}
                        disabled={!this.canSubscribe()}
                      />
                      &nbsp;{this.props.yearlyPrice} USD per year
                    </label>
                  </div>
                </div>}
                {this.props.halfYearlyPrice > 0 && <div className={(this.props.alignCenter ? "payment-option-modal " : "") + "row"}>
                  <div className="col-md-12">
                    <label>
                      <input
                        type="radio"
                        name={"payment" + this.props.radioGroupName}
                        value="2"
                        checked={this.canSubscribe() && this.state.subscriptionPeriodType == "2"}
                        onChange={e => this.handleSubscriptionTypeChange(e)}
                        disabled={!this.canSubscribe()}
                      />
                      &nbsp;{this.props.halfYearlyPrice} USD per half year
                    </label>
                  </div>
                </div>}
                {this.props.quarterlyPrice > 0 && <div className={(this.props.alignCenter ? "payment-option-modal " : "") + "row"}>
                  <div className="col-md-12">
                    <label>
                      <input
                        type="radio"
                        name={"payment" + this.props.radioGroupName}
                        value="3"
                        checked={this.canSubscribe() && this.state.subscriptionPeriodType == "3"}
                        onChange={e => this.handleSubscriptionTypeChange(e)}
                        disabled={!this.canSubscribe()}
                      />
                      &nbsp;{this.props.quarterlyPrice} USD per quarter
                    </label>
                  </div>
                </div>}
                {this.props.monthlyPrice > 0 && <div className={(this.props.alignCenter ? "payment-option-modal " : "") + "row"}>
                  <div className="col-md-12">
                    <label>
                      <input
                        type="radio"
                        name={"payment" + this.props.radioGroupName}
                        value="0"
                        checked={this.canSubscribe() && this.state.subscriptionPeriodType == "0"}
                        onChange={e => this.handleSubscriptionTypeChange(e)}
                        disabled={!this.canSubscribe()}
                      />
                      &nbsp;{this.props.monthlyPrice} USD per month
                    </label>
                  </div>
                </div>}
                {this.canSubscribe() && <div className="btn btn-primary subscription-btn" onClick={e => this.createPaymentRequest(e)}>Subscribe</div>}
                {!this.isOwner() && this.getFormattedDateFromDuration() && <div className="btn btn-success subscription-btn">Subscribed until {this.getFormattedDateFromDuration()}</div>}
              </div>
            </div>
        </div>);
    }

    canSubscribe(){
      return !this.isOwner() && !this.getFormattedDateFromDuration();
    }

    getFormattedDateFromDuration() {
      if(this.props.expirationDate){
        var duration = this.props.expirationDate;
        var date = new Date(duration);
        return date.toLocaleDateString({},{ year: 'numeric', month: 'short', day: 'numeric'});
      }
      return null;
    }
    
    isOwner(){
      var userData = loadUserData();
      if(userData){
        return this.props.pageUsername == userData.username;
      }
      return false;
    }

    createPaymentRequest(){
      if(!loadUserData()){
        this.props.handleSignIn();
      }
      else{
        var subscriptionPeriodType = this.state.subscriptionPeriodType;
        var url = server_url + '/api/v1/charges';
        var loggedUserAppPublicKey = getPublicKeyFromPrivate(loadUserData().appPrivateKey);
        Axios.post(url, {
          appPublicKey: loggedUserAppPublicKey,
          username: this.props.pageUsername,
          periodType: subscriptionPeriodType,
          subscriberUsername: loadUserData().username
        }).then(response => {
          if(response.data && response.data.id){
            window.location.href = open_node_url + response.data.id;
          }
          else{
            alert('Sorry, an error ocurred.');
          }
        }).catch((err) => {
          alert('Sorry, an error ocurred.');
        });

        if(this.props.callback) {
            this.props.callback();
        }
      }
    }

      handleSubscriptionTypeChange(event) {
        if(event.target.checked){
          this.setState({ subscriptionPeriodType: event.target.value})
        }
      }
}