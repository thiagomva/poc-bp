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
            monthlySubscription: false
          };
    }

    render() {
        return (<div>
            <div className="card">
              <div className="card-body prices">
                <div className={(this.props.alignCenter ? "payment-option-modal " : "") + "row"}>
                  <div className="col-md-12">
                    <label>
                      <input
                        type="radio"
                        name={"payment" + this.props.radioGroupName}
                        value="yearly"
                        checked={!this.state.monthlySubscription}
                        onChange={e => this.handleSubscriptionTypeChange(e)}
                      />
                      &nbsp;{this.props.yearlyPrice} USD per year
                    </label>
                  </div>
                </div>
                <div className={(this.props.alignCenter ? "payment-option-modal " : "") + "row"}>
                  <div className="col-md-12">
                    <label>
                      <input
                        type="radio"
                        name={"payment" + this.props.radioGroupName}
                        value="monthly"
                        checked={this.state.monthlySubscription}
                        onChange={e => this.handleSubscriptionTypeChange(e)}
                      />
                      &nbsp;{this.props.monthlyPrice} USD per month
                    </label>
                  </div>
                </div>
                <div className="btn btn-primary subscription-btn" onClick={e => this.createPaymentRequest(e)}>Subscribe</div>
              </div>
            </div>
        </div>);
    }

    createPaymentRequest(){
        var monthly = this.state.monthlySubscription;
        var url = server_url + '/api/v1/charges';
        var loggedUserAppPublicKey = getPublicKeyFromPrivate(loadUserData().appPrivateKey);
        Axios.post(url, {
          appPublicKey: loggedUserAppPublicKey,
          username: this.props.pageUsername,
          monthly: monthly
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

      handleSubscriptionTypeChange(event) {
        this.setState({ monthlySubscription: event.target.value === 'monthly' && event.target.checked })
      }
}