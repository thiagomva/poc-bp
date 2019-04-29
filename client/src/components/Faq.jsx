import React, { Component } from 'react';
import FaqItem from './FaqItem.jsx';

export default class Faq extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
    <div className="container">
        <div className="row">
            <div className="col-md-12">
                <div className="page-title">
                    FAQ
                </div>
            </div>
        </div>
        <div className="row mb-5">
            <div className="col-md-12">
                <div className="faq-topic-title">Basics</div>
            </div>
            <FaqItem question="What is BitPatron?">
                <p>A decentralized membership platform that gives creators the ability to monetize their passion/work with Bitcoin, or other payment gateways. The business model is decentralized and designed to keep maximum control of content, followers and paid subscription with the content creator. Unlike other platforms, here you can express your voice, without being controlled by big corporates.</p>
            </FaqItem>
            <FaqItem question="What is Bitcoin &amp; why should I care?">
                <p>Bitcoin (BTC) is a peer-to-peer cryptocurrency.&nbsp;</p>
                <p>As a decentralized virtual currency, BTC is a fast, cheap and secure way to transmit value internationally by using online devices. Anyone with internet access can participate in the network. &nbsp;With Bitcoin, creators can accept payments without needing the permission of any third parties. &nbsp;When you start using Bitcoin, you are helping shape the future of free speech, no creator will fear payment censorship, since it's not even possible.</p>
                <p>To understand more about Bitcoin, we recommend the following guide: <a href="https://www.bitwala.com/academy/">https://www.bitwala.com/academy/</a></p>
            </FaqItem>
            <FaqItem question="What is Blockstack?">
                <p>BitPatron is built on top Blockstack, allowing us to provide decentralized encrypted content storage. Blockstack is a new internet for decentralized apps that you access through the Blockstack Browser. With Blockstack, there is a new world of apps that let you own your data and maintain your privacy, security and freedom.</p>
                <p>Almost everything is transparent for end-users, but if you want to understand how it works behind, please refer to: <a href="https://medium.com/bitpatron/the-business-model-behind-bitpatron-72599c441115">https://medium.com/bitpatron/the-business-model-behind-bitpatron-72599c441115</a></p>
            </FaqItem>
            <FaqItem question="Can content creators be censored/banned from BitPatron?">
                <p>BitPatron is moderated, according to our community guidelines. Content creators that are not in accord with the terms of service and community guidelines will be removed from the BitPatron front-end. However, BitPatron has just control over the front-end and therefore even in the case of a removal, it won’t impact content storage, access to supporter information and payment subscription. Once banned, in theory, content creators can use a third party fron-tend or create their own one, since this data was never with us in the first place. All content and necessary data to give access to their patrons is stored in Blockstack decentralized storage, controlled by the content creator.</p>
            </FaqItem>
            <FaqItem question="Where can i see BitPatron community guidelines?">
                <p>Link: <a href="https://bitpatron.co/docs/BitPatron+Community+Guidelines.pdf">https://bitpatron.co/docs/BitPatron+Community+Guidelines.pdf</a></p>
                <p>BitPatron content storage is decentralized, but Bitpatron.co will not display content that violates our Community Guidelines.</p>
            </FaqItem>
            <FaqItem question="Is Adult Content allowed?">
                <p>Yes, but please mark your page as adult content. Of course, illegal pornography is strictly prohibited.</p>
            </FaqItem>
            <FaqItem question="How does BitPatron decentralization work?">
                <p>Please refer to: <a href="https://medium.com/bitpatron/the-business-model-behind-bitpatron-72599c441115">https://medium.com/bitpatron/the-business-model-behind-bitpatron-72599c441115</a></p>
            </FaqItem>
            <FaqItem question="Will BitPatron add credit card payment processors?">
                <p>Yes, we plan to add multiple payments gateways as an alternative for Bitcoin, consisting of various traditional providers directly linked to the content creator’s accounts, thus the content creator doesn’t rely on any powerful payment provider, nor on BitPatron for payments.</p>
            </FaqItem>
            <div className="col-md-12"><hr/><div className="faq-topic-title">For Creators</div></div>
            <FaqItem question="How can I setup a page?">
                <p>It's quite simple, go to the homepage, click on create page, create your login and set a Page name, description and choose your pricing per month and per year.</p>
            </FaqItem>
            <FaqItem question="How can I set up my membership pricing? Should I offer discounts for annual billing?">
                <p>You can set up while creating your page, or edit it later. We strongly recommend offering discounts for annual billing, because by default Bitcoin is a push technology, meaning each payment has to be initiated by the customer.&nbsp;</p>
            </FaqItem>
            <FaqItem question="How can I create a Bitcoin address?">
                <p>To receive your payments, you need to have a Bitcoin wallet.&nbsp;</p>
                <p>To create one, we recommend one of the following:</p>
                <p>- Coinbase Wallet: <a href="https://wallet.coinbase.com/">https://wallet.coinbase.com/</a>&nbsp;</p>
                <p>- Bitwala Wallet: <a href="https://www.bitwala.com/wallet/">https://www.bitwala.com/wallet/</a>&nbsp;</p>
                <p>To understand better what is a Bitcoin wallet, please read: <a href="https://www.bitwala.com/what-is-a-bitcoin-wallet/">https://www.bitwala.com/what-is-a-bitcoin-wallet/</a>.</p>
            </FaqItem>
            <FaqItem question="When &amp; How Do I Get Paid?&nbsp;">
                <p>You get paid with Bitcoin. BitPatron processes payments every Monday for every creator. To payout your balance,&nbsp; head to your page and add your Bitcoin Wallet address, if you don't have one please read the question above.</p>
            </FaqItem>
            <FaqItem question="How can I convert Bitcoin to cash?">
                <p>We recommend using one of the following exchanges:</p>
                <p><a href="https://www.coinbase.com/buy-bitcoin">Coinbase - https://www.coinbase.com/buy-bitcoin</a></p>
                <p><a href="https://www.bitwala.com/bank-account/">Bitwalla - https://www.bitwala.com/bank-account/</a></p>
                <p><a href="https://www.kraken.com/">Kraken - https://www.kraken.com/</a></p>
            </FaqItem>
            <FaqItem question="Will my balance remain in Bitcoin before getting paid?">
                <p>Yes, in our alpha, all amount you receive will remain in Bitcoin before you get paid out. This means that you are exposed to Bitcoin fluctuations, before the payout.</p>
                <p>This might change in near future, we have plans to add the possibility to add automatic conversion.</p>
            </FaqItem>
            <FaqItem question="How can I post Patron-Only content?">
                <p>While creating a post, make sure you choose "Only for paid subscribers"</p>
            </FaqItem>
            <FaqItem question="How can I embed Youtube, Soundcloud, etc?">
                <p>Use the following button and paste the link.&nbsp;</p>
                <p><img src="https://i.imgur.com/OY7J6h5.png" style={{width: 300+'px'}} className="fr-fic fr-dib fr-fil"/></p>
                <p>If you are posting a YouTube Patron-Only content, we recommend publishing your video as unlisted.&nbsp;</p>
                <p>You should also keep the license and rights ownership as Standard YouTube License and allow embedding checked in the distribution options.</p>
                <p>If you are posting a Vimeo Patron-Only content, we recommend the following configurations:</p>
                <p>Who can watch?: "People with the private link"</p>
                <p>Where can this be embedded?: Specific domains, add bitpatron.co</p>
            </FaqItem>
            <div className="col-md-12"><hr/><div className="faq-topic-title">For Supporters</div></div>
            <FaqItem question="Why should I support creators with Bitcoin?">
                <p>By using Bitcoin instead of traditional payments, you are helping to fund their creative work without fearing censorship from traditional payment processors.</p>
            </FaqItem>
            <FaqItem question="How can I buy Bitcoin &amp; Become a Patron?">
                <p>1) Create a Bitcoin Wallet</p>
                <p>- Coinbase Wallet: <a href="https://wallet.coinbase.com/">https://wallet.coinbase.com</a></p>
                <p>- Bitwala Wallet: <a href="https://www.bitwala.com/wallet">https://www.bitwala.com/wallet</a></p>
                <p>2) Buy Bitcoin &amp; Withdraw to the wallet&nbsp;</p>
                <p>We recommend using one of the following exchanges:</p>
                <p>Coinbase - <a data-fr-linked="true" href="https://www.coinbase.com/buy-bitcoin">https://www.coinbase.com/buy-bitcoin</a>&nbsp;</p>
                <p>Bitwalla - <a href="https://www.bitwala.com/bank-account">https://www.bitwala.com/bank-account</a>&nbsp;</p>
                <p>Kraken - <a href="https://www.kraken.com">https://www.kraken.com</a>&nbsp;</p>
                <p>3) Click on Become Bitpatron, choose on-chain payment, scan the QR Code and complete the payment.</p>
                <p>
                    <br/>
                </p>
                <p>To understand better what is a Bitcoin wallet, please read: <a href="https://www.bitwala.com/what-is-a-bitcoin-wallet/">https://www.bitwala.com/what-is-a-bitcoin-wallet/</a>.</p>&nbsp;
                <br/>&nbsp;
            </FaqItem>
        </div>
    </div>);
  }
}