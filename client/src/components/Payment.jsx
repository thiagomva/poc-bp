import React, { Component } from 'react';
import {
  loadUserData
} from 'blockstack';
import Modal from 'react-bootstrap/Modal';
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
    }
    else{
      this.setState({paying:true,showModal:true});
    }
  }

  handleClose() {
    this.setState({ showModal: false });
  }

  hideModal() {
    this.setState({ showModal: false });
  }  

  render() {
    return (
      <div>
          <button type="button" className="btn btn-primary" onClick={e => this.onClick(e)}><span><i className="fa fa-lock"></i> Subscribe to get access!</span></button>
          <Modal show={this.state.showModal} onHide={this.handleClose}>
            <Modal.Header closeButton>
              <Modal.Title>Subscribe</Modal.Title>
            </Modal.Header>
            <Modal.Body className="payment-option-modal">
            <SubscriptionOptions radioGroupName="-modal" monthlyPrice={this.props.monthlyPrice} yearlyPrice={this.props.yearlyPrice} halfYearlyPrice={this.props.halfYearlyPrice} quarterlyPrice={this.props.quarterlyPrice} pageUsername={this.props.pageUsername} callback={this.hideModal} alignCenter={true}></SubscriptionOptions>
            </Modal.Body>
          </Modal>
      </div>
    );
  }
}