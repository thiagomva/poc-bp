import React, { Component } from 'react';
import {
    isUserSignedIn,
    loadUserData
  } from 'blockstack';

export default class Site extends Component {
  constructor(props) {
    super(props);

    this.state = {
        currentImgIndex: 0,
        contentImages: ["illustration", "music", "photos", "podcasts", "videos", "writing"]
    }

    this.startTimeoutAndChangeImage();
  };  

  startTimeoutAndChangeImage(){
      setTimeout(() =>
          {
              var nextIndex = this.state.currentImgIndex+1;
              if(nextIndex == this.state.contentImages.length){
                nextIndex = 0;
              }
              this.setState({currentImgIndex:nextIndex});
              this.startTimeoutAndChangeImage();
          }, 1000);
  }

  render() {
    const { handleSignIn } = this.props;
    var username = null;
    if(isUserSignedIn()){
      username = loadUserData().username;
    }
    return (
      <div className="page">
        <header className="masthead">          
          <div className="top-image-div center-text">
            <h4>Bitcoin Patreon Alternative</h4>
            <div className="earn-bitcoins">
                <span>EARN BITCOINS WITH YOUR</span>
            </div>
            <div className="content-options">
                <div className="img-div music"></div>
                <div className="dot-separator"></div>
                <div className="img-div videos"></div>
                <div className="dot-separator"></div>
                <div className="img-div podcasts"></div>
            </div>
            {username && 
            <a href={"/"+username}>
                <div  className="signup-button" id="myBtn">
                    <span>GO TO YOUR PAGE <img src="./images/icons/arrow.png" className="arrow" /></span>
                </div>
            </a>
            }
            {!username && 
            <div className="signup-button" id="myBtn" onClick={ handleSignIn.bind(this) }>
                <span>CREATE YOUR PAGE <img src="./images/icons/arrow.png" className="arrow" /></span>
            </div>
            }
          </div>      
          
      </header>
      <section className="steps">
          <h1>How it works</h1>
          <div className="boxes">
              <div className="box">
                  <div className="content">
                    <div className="number">1</div>
                    <div className="title">
                        <span>CREATE PAGE & SUBSCRIPTION PLAN</span>
                    </div>
                    <div className="description">
                        <span>Whether you’re selling exclusive videos, podcasts or photos, just set your subscription price</span>
                    </div>
                  </div>
                  <div>
                      <img src="./images/step_1.png" />
                  </div>
              </div>
              <div className="box">  
                <div className="content">
                    <div className="number">2</div>
                    <div className="title">
                        <span>CREATE YOUR EXCLUSIVE CONTENT</span>
                    </div>
                    <div className="description">
                        <span>Create and upload exclusive content</span>
                    </div>
                  </div>
                  <div>
                      <img src="./images/step_2.png" />
                  </div>
              </div>
              <div className="box">
                  <div className="content">
                    <div className="number">3</div>
                    <div className="title">
                        <span>EARN BITCOIN</span>
                    </div>
                    <div className="description">
                        <span>Share with your audience and earn Bitcoin whenever someone subscribes</span>
                    </div>
                  </div>
                  <div>
                      <img src="./images/step_3.png" />
                  </div>
              </div>
          </div>
      </section>
      <section className="content">
            <h2>Your content, your rules</h2>
          <div className="content-rules">
            <div id="carouselContent" className="carousel slide" data-ride="carousel">
                <ol className="carousel-indicators">
                    <li data-target="#carouselContent" data-slide-to="0" className="active"></li>
                    <li data-target="#carouselContent" data-slide-to="1"></li>
                    <li data-target="#carouselContent" data-slide-to="2"></li>
                    <li data-target="#carouselContent" data-slide-to="3"></li>
                </ol>
                <div className="carousel-inner">
                    <div className="carousel-item active">
                        <h5>Your Payment Terms</h5>
                        <p>Microtransactions allow you to charge any amount, even less than a penny.</p>
                    </div>
                    <div className="carousel-item">
                        <h5>Content Freedom</h5>
                        <p>You control your content. Feel free to run sponsored ads, post memes, etc.</p>
                    </div>
                    <div className="carousel-item">
                        <h5>Content Ownership</h5>
                        <p>You retain 100% ownership of your content and control where data is hosted.</p>
                    </div>
                    <div className="carousel-item">
                        <h5>Content Encryption</h5>
                        <p>BitPatron makes it easy to protect your member only content.</p>
                    </div>
                </div>
            </div>
          </div>
      </section>
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
                      <img src="./images/icons/no-charge.png" />
                  </div>
                  <div className="title">
                      <span>No Deplatforming</span>
                  </div>
                  <div className="description">
                      <span>No one can take away your audience, content or revenue stream</span>
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
                      <span>90% Cheaper than Patreon, experience Bitcoin Lightning instant settlements and low fees</span>
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
                          <li>1%</li>
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
