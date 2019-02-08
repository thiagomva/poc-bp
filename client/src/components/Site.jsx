import React, { Component } from 'react';
import { isUserSignedIn } from 'blockstack';


export default class Site extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { handleSignIn } = this.props;

    return (
      <div className="page">
        <header className="masthead">
          <img src="./images/top-right.png" className="top-right-image" />
          <div>
              <img src="./images/logo.svg" className="center-logo" />
          </div>
          <div className="center-text">
              <h4>THE FIRST DECENTRALIZED PATREON ALTERNATIVE<br/>Powered by Blockstack & Bitcoin</h4>
              <span>Express your voice, without being </span>
              <br />
              <span>controlled by big corporates.</span>
          </div>        
          <div className="signup-button" id="myBtn" onClick={ handleSignIn.bind(this) }>
              <span>CREATE YOUR PAGE <img src="./images/icons/arrow.png" className="arrow" /></span>
          </div>
      </header>
      <div id="myModal" className="modal">
          <div className="modal-content">
              <div className="modal-header">
                  <span className="close">&times;</span>
              </div>
              <div className="modal-body" id="modal-body-widget">
                  <div data-vl-widget="embedForm" className="widget-container-div"></div>
                  <div data-vl-widget="milestoneWidget" className="widget-container-div"></div>
              </div>
          </div>

      </div>
      <section className="features">
          <div className="boxes">
              <div className="box">
                  <div>
                      <img src="./images/icons/free-speech.png" />
                  </div>
                  <div className="title">
                      <span>Free Speech</span>
                  </div>
                  <div className="description">
                      <span>You will never be banned for your opinions or political views</span>
                  </div>
              </div>
              <div className="box">
                  <div>
                      <img src="./images/icons/cheap-fast.png" />
                  </div>
                  <div className="title">
                      <span>Cheap & Fast</span>
                  </div>
                  <div className="description">
                      <span>60% Cheaper than Patreon, experience Bitcoin Lightning instant settlements and low fees</span>
                  </div>
              </div>
              <div className="box">
                  <div>
                      <img src="./images/icons/no-charge.png" />
                  </div>
                  <div className="title">
                      <span>No Chargebacks</span>
                  </div>
                  <div className="description">
                      <span>Bitcoin protects you against chargebacks or holds</span>
                  </div>
              </div>
          </div>
      </section>
      <section className="content">
          <div className="content-rules">
              <h2>Your content, your rules</h2>
          </div>
          <div className="boxes">
              <div className="box">
                  <div>
                      <img src="./images/icons/your-pay.png" />
                  </div>
                  <div className="title">
                      <span>Your Payment Terms</span>
                  </div>
                  <div className="description">
                      <span>Microtransactions allow you to charge any amount, even less than a penny.</span>
                  </div>
              </div>
              <div className="box">
                  <div>
                      <img src="./images/icons/cont-freedom.png" />
                  </div>
                  <div className="title">
                      <span>Content Freedom</span>
                  </div>
                  <div className="description">
                      <span>You control your content. Feel free to run sponsored ads, post memes, etc.</span>
                  </div>
              </div>
              <div className="box">
                  <div>
                      <img src="./images/icons/cont-own.png" />
                  </div>
                  <div className="title">
                      <span>Content Ownership</span>
                  </div>
                  <div className="description">
                      <span>You retain 100% ownership of your content and control where data is hosted.</span>
                  </div>
              </div>
              <div className="box">
                  <div>
                      <img src="./images/icons/cont-protect.png" />
                  </div>
                  <div className="title">
                      <span>Content Encryption</span>
                  </div>
                  <div className="description">
                      <span>BitPatron makes it easy to protect your member only content</span>
                  </div>
              </div>
          </div>
      </section>
      <section className="support">
          <div className="main-panel ">
              <div className="left-panel">
                  <h2>Support Free Speech &amp; Bitcoin Adoption</h2>
                  <span>By using BitPatron, you help to shape the future of Free Speech and Bitcoin adoption while creating a meaningful revenue stream</span>
                  <div className="arrow">
                      <img src="./images/icons/arrow_.svg" />
                  </div>
              </div>
              <div className="right-panel">
                  <div className="itens">
                      <h2>_</h2>
                      <ul>
                          <li>TOTAL FEES</li>
                          <li>PAYOUT</li>
                          <li>MIN. PLEDGE</li>
                          <li>FREE SPEECH</li>
                      </ul>
                  </div>
                  <div className="bitpatron">
                      <h2>BitPatron</h2>
                      <ul>
                          <li>4%</li>
                          <li>Weekly</li>
                          <li>No</li>
                          <li>Yes</li>
                      </ul>
                  </div>
                  <div className="patreon">
                      <h2>Patreon</h2>
                      <ul>
                          <li>10%</li>
                          <li>Up to 30 days</li>
                          <li>Yes (1 USD)</li>
                          <li>?</li>
                      </ul>
                  </div>
              </div>
          </div>
      </section>
      <section className="use-cases">
          <h2>Use Cases &amp; Integrations</h2>
          <div className="boxes">
              <div className="box">
                  <div>
                      <img src="./images/icons/podcaster.png" />
                  </div>
                  <div className="title">
                      <span>Podcasters</span>
                  </div>
                  <div className="description">
                      <span>Offer exclusive podcast episodes for your audience</span>
                  </div>
              </div>
              <div className="box">
                  <div>
                      <img src="./images/icons/video.png" />
                  </div>
                  <div className="title">
                      <span>Video Creators</span>
                  </div>
                  <div className="description">
                      <span>Offer exclusive videos and live streams</span>
                  </div>
              </div>
              <div className="box">
                  <div>
                      <img src="./images/icons/discor.png" />
                  </div>
                  <div className="title">
                      <span>Discord Groups</span>
                  </div>
                  <div className="description">
                      <span>Offer exclusive chat rooms and special roles</span>
                  </div>
              </div>
          </div>
      </section>

      <footer>
          <div className="container">
              <div className="copyright">
                  <span>Copyright © 2019 BitPatron</span>
                  <br/>
                  <a href="mailto: contact@bitpatron.co">contact@bitpatron.co</a>
              </div>
          </div>
      </footer>
      </div>
    );
  }
}
