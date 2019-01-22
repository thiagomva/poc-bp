import { fetchAccounts, fetchNetwork, deposit } from './Web3Service';

export const FETCH_ACCOUNTS = 'FETCH_ACCOUNTS';
export const FETCH_ACCOUNTS_FULFILLED = 'FETCH_ACCOUNTS_FULFILLED';
export const FETCH_ACCOUNTS_REJECTED = 'FETCH_ACCOUNTS_REJECTED';

export const FETCH_NETWORK = 'FETCH_NETWORK';
export const FETCH_NETWORK_FULFILLED = 'FETCH_NETWORK_FULFILLED';
export const FETCH_NETWORK_REJECTED = 'FETCH_NETWORK_REJECTED';

const fetchAccountsAction = () => ({
  type: FETCH_ACCOUNTS,
  payload: fetchAccounts()
});

const fetchNetworkAction = () => ({
  type: FETCH_NETWORK,
  payload: fetchNetwork()
});

export { fetchAccountsAction as fetchAccounts, fetchNetworkAction as fetchNetwork };