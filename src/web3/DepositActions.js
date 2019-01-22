import { deposit } from './DepositService';

export const DEPOSIT = 'DEPOSIT';
export const DEPOSIT_PENDING = 'DEPOSIT_PENDING';
export const DEPOSIT_FULFILLED = 'DEPOSIT_FULFILLED';
export const DEPOSIT_REJECTED = 'DEPOSIT_REJECTED';

const depositAction = (pageUserName, address, amount) => ({
  type: DEPOSIT,
  payload: deposit(pageUserName, address, amount)
});

export { depositAction as deposit };