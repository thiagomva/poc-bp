import React, { Component } from 'react';
import {
  getPublicKeyFromPrivate,
  loadUserData
} from 'blockstack';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import {Container, Col, Row} from 'react-bootstrap';
import Axios from 'axios';
import { server_url } from '../config';

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
    this.setState({paying:true,showModal:true});
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

  createPaymentRequest(monthly){
    var url = server_url + '/api/v1/charges';
    var loggedUserAppPublicKey = getPublicKeyFromPrivate(loadUserData().appPrivateKey);
    Axios.post(url, {
      appPublicKey: loggedUserAppPublicKey,
      username: this.props.pageUsername,
      monthly: monthly
    }).then(response => {
      if(response.data && response.data.id){
        window.location.href = "https://dev-checkout.opennode.co/" + response.data.id;
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
              <Container>
              Select your payment option to proceed!
              <Row className="payment-buttons-row">
                <Col md={6}>
                  <code>
                    <button type="button" className="btn btn-primary btn-lg" onClick={e => this.onMonthlyClick(e)}>{ "$"+this.props.monthlyPrice +"/month"}</button>  
                  </code>
                </Col>
                <Col md={6}>
                  <code>
                    <button type="button" className="btn btn-primary btn-lg" onClick={e => this.onYearlyClick(e)}>{"$"+this.props.yearlyPrice+"/year"}</button>
                  </code>
                </Col>
              </Row>
              </Container>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={this.handleClose}>
                Cancel
              </Button>
            </Modal.Footer>
          </Modal>
      </div>
    );
  }
}