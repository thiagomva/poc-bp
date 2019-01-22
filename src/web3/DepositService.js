export const deposit = (address, ethAmount) => {
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
            resolve(transactionId);
            monitoringTransaction(transactionId);
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

function monitoringTransaction(transactionId) {
  if (transactionId) {
    const web3 = getMetamaksProvider();
    checkTransactionConfirmed(web3, transactionId);
  }
}

function checkTransactionConfirmed(web3, transactionId) {
  web3.eth.getTransactionReceipt(transactionId, function(err, receipt) { 
    if (err || !receipt || !receipt.blockNumber) {
      setTimeout(function(){ checkTransactionConfirmed(web3, transactionId); }, 3000);
    } else {
      //TODO call the server
      console.log(receipt);
      alert('Mined on block ' + receipt.blockNumber);
    }
  });
}