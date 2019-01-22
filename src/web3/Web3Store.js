// IMPORT PACKAGE REFERENCES

import { createStore, applyMiddleware } from 'redux';

// IMPORT MIDDLEWARE

import thunk from 'redux-thunk';
import promiseMiddleware from 'redux-promise-middleware';

// IMPORT REDUCERS

import { Web3Reducer } from './Web3Reducer';


// CONFIGURE STORE

export const createAppStore = () => {
  return createStore(Web3Reducer, applyMiddleware(thunk, promiseMiddleware()));
};