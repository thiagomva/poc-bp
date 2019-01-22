import {  DEPOSIT_PENDING, DEPOSIT_FULFILLED, DEPOSIT_REJECTED } from './DepositActions';
  
  
  // INITIALIZE STATE
  
  const initialState = {
    transaction: '',
    fetching: false,
    fetched: false,
    failed: false
  };
  
  
  // REDUCER
  
  export const DepositReducer = (state = initialState, action) => {
    switch(action.type) {
      case DEPOSIT_PENDING:
        return {
          state,
          transaction: '',
          fetching: true,
          fetched: false,
          failed: false
        };
      case DEPOSIT_FULFILLED:
        return {
          state,
          transaction: action.payload,
          fetching: false,
          fetched: true,
          failed: false
        };
      case DEPOSIT_REJECTED:
        return {
          state,
          transaction: '',
          fetching: false,
          fetched: false,
          failed: true
        };
      default:
        return state;
    }
  };