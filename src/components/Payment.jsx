import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import isEmpty from 'lodash/isEmpty';
import { deposit } from '../web3/DepositActions';

class Payment extends Component {
  constructor(props) {
    super(props);
    this.onClick = this.onClick.bind(this);
  }

  onClick() {
    this.props.deposit(this.props.address, this.props.amount);
  }

  render() {
    const web3 = window.web3;
    let failed = false;
    let error = null;

    if (!web3) {
      failed = true;
      error = "No web3!";
    }

    if (!failed && isEmpty(this.props.accounts)) {
      failed = true;
      error = "Account unavailable!";
    }

    if (!failed && this.props.network_id && this.props.network_id !== "4") {
      failed = true;
      error = "Ethereum network must be Rinkeby!";
    }
    return (
      <div>
        {
          !failed && <button className="btn btn-primary btn-lg" onClick={e => this.onClick()}>SUBSCRIBE</button>
        }
        {
          failed && <span className="btn btn-lg">{error}</span>
        }
      </div>
    );
  }
}

Payment.propTypes = {
  deposit: PropTypes.func.isRequired,
  depositFetched: PropTypes.bool.isRequired,
  depositId: PropTypes.string,
  address: PropTypes.string.isRequired,
  amount: PropTypes.number.isRequired,
  accounts: PropTypes.array,
  network_fetched: PropTypes.bool.isRequired,
  network_id: PropTypes.string
};

// CONFIGURE REACT REDUX

const mapStateToProps = state => {
  const { accounts } = state.accounts;
  const { network_fetched, network_id } = state.network;
  const depositState = state.deposit;
  const depositFetched = depositState.fetched;
  const depositId = depositState.transaction;
  return { accounts, network_fetched, network_id, depositFetched, depositId };
};

const mapDispatchToProps = dispatch => (
  bindActionCreators({ deposit }, dispatch)
);

const hoc = connect(mapStateToProps, mapDispatchToProps)(Payment);

// EXPORT COMPONENT

export default hoc;
