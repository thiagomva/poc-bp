import React, { Component } from 'react';
import {
  getPublicKeyFromPrivate,
  loadUserData,
  redirectToSignIn
} from 'blockstack';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import {Container, Col, Row} from 'react-bootstrap';
import Axios from 'axios';
import { server_url, open_node_url } from '../config';
import SubscriptionOptions from './SubscriptionOptions.jsx';

export default class Payment extends Component {
  constructor(props) {
    
    super(props);
    this.onClick = this.onClick.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.state = {
      paying: false,
      showModal: false
    }
  }

  onClick(e) {
    e.preventDefault();
    if(!loadUserData()){
      this.props.handleSignIn();
      // const origin = window.location.origin
      // redirectToSignIn(origin, origin + '/manifest.json', ['store_write', 'publish_data', 'email'])
    }
    else{
      this.setState({paying:true,showModal:true});
    }
  }

  handleClose() {
    this.setState({ showModal: false });
  }

  onYearlyClick() {
    this.createPaymentRequest(false);
    this.setState({ showModal: false });
  }

  onMonthlyClick() {
    this.createPaymentRequest(true);
    this.setState({ showModal: false });
  }

  hideModal() {
    this.setState({ showModal: false });
  }

  createPaymentRequest(monthly){
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
  }  

  render() {
    return (
      <div>
          <button type="button" className="btn btn-primary" onClick={e => this.onClick(e)}>{ this.props.subscriptionMode ?  <span><i className="fa fa-lock"></i> Subscribe to get access!</span> :  "$"+this.props.monthlyPrice +"/month OR $"+this.props.yearlyPrice+"/year"}</button>
          <Modal show={this.state.showModal} onHide={this.handleClose}>
            <Modal.Header closeButton>
              <Modal.Title>Subscribe</Modal.Title>
            </Modal.Header>
            <Modal.Body className="payment-option-modal">
            <SubscriptionOptions radioGroupName="-modal" monthlyPrice={this.props.monthlyPrice} yearlyPrice={this.props.yearlyPrice} pageUsername={this.props.pageUsername} callback={this.hideModal} alignCenter={true}></SubscriptionOptions>
            </Modal.Body>
          </Modal>
      </div>
    );
  }
}