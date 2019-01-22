import {
  getPublicKeyFromPrivate,
  loadUserData
} from 'blockstack';

export const deposit = (pageUserName, address, ethAmount) => {
    return new Promise((resolve, reject) => {
      const web3 = getMetamaksProvider();

      if (!web3) {
        reject('No web3!');
      }
      const amountWei = web3.toWei(ethAmount, 'ether');
      const account = web3.eth.accounts[0];
      if (!account) {
        reject('No account!');
      }
  
      web3.eth.getTransactionCount(account, (error, txCount) => {
        if (error) {
          reject(error);
        }
        web3.eth.sendTransaction({
          nonce: txCount,
          from: account,
          to: address,
          value: amountWei
        }, (err, transactionId) => {
          if (err) {
            reject(error);
          } else {
            console.log(transactionId);
            var loggedUserAppPublicKey = getPublicKeyFromPrivate(loadUserData().appPrivateKey);
            checkTransactionConfirmed(resolve, web3, transactionId, pageUserName, loggedUserAppPublicKey);
          }
        });
      });
    });
};

function getMetamaksProvider() {
  const web3 = window.web3;
  if (!web3 || !web3.isConnected() || !web3.currentProvider.isMetaMask) {
    return null;
  } else {
    return web3;
  }
}

function checkTransactionConfirmed(resolve, web3, transactionId, pageUserName, loggedUserAppPublicKey) {
  web3.eth.getTransactionReceipt(transactionId, function(err, receipt) { 
    if (err || !receipt || !receipt.blockNumber) {
      setTimeout(function(){ checkTransactionConfirmed(resolve, web3, transactionId, pageUserName, loggedUserAppPublicKey); }, 3000);
    } else {
      resolve(transactionId);
      //TODO call the server
      alert('User ' + loggedUserAppPublicKey + ' confirmed subscription on block ' + receipt.blockNumber + ' for the content generator ' + pageUserName);
    }
  });
}