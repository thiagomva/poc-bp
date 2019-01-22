// IMPORT PACKAGE REFERENCES

import { combineReducers } from 'redux';

// IMPORT REDUCERS

import { DepositReducer } from './DepositReducer';
import { FetchAccountsReducer } from './FetchAccountsWeb3';
import { FetchNetworkReducer } from './FetchNetworkWeb3';

// EXPORT WEB3 REDUCER

export const Web3Reducer = combineReducers({
  accounts: FetchAccountsReducer,
  network: FetchNetworkReducer,
  deposit: DepositReducer
});