import React, { Component } from 'react';
import {
  isSignInPending,
  loadUserData,
  Person,
  getFile,
  putFile,
  lookupProfile,
  makeECPrivateKey,
  getPublicKeyFromPrivate,
} from 'blockstack';
import { listFiles, decryptContent, encryptContent } from 'blockstack/lib/storage';

const avatarFallbackImage = 'https://s3.amazonaws.com/onename/avatar-placeholder.png';

export default class Profile extends Component {
  constructor(props) {
  	super(props);

  	this.state = {
      person: {
        name() {
          return 'Anonymous';
        },
        avatarUrl() {
          return avatarFallbackImage;
        },
      },
      username: "",
      newStatus: "",
      statuses: [],
      statusIndex: 0,
      isLoading: false,
      docPrivateKey: "",
      docPublicKey: ""
    };
  }

  render() {
    const { handleSignOut } = this.props;
    const { person } = this.state;
    const { username } = this.state;
   
    return (
      !isSignInPending() && person ?
      <div className="container">
        <div className="row">
          <div className="col-md-offset-3 col-md-6">
            <div className="col-md-12">
              <div className="avatar-section">
                <img
                  src={ person.avatarUrl() ? person.avatarUrl() : avatarFallbackImage }
                  className="img-rounded avatar"
                  id="avatar-image"
                />
                <div className="username">
                  <h1>
                    <span id="heading-name">{ person.name() ? person.name()
                      : 'Nameless Person' }</span>
                  </h1>
                  <span>{username}</span>
                  {this.isLocal() &&
                    <span>
                      &nbsp;|&nbsp;
                      <a onClick={ handleSignOut.bind(this) }>(Logout)</a>
                    </span>
                  }
                </div>
              </div>
            </div>
            {this.isLocal() &&
              <div className="new-status">
                <div className="col-md-12">
                  <textarea className="input-status"
                    value={this.state.newStatus}
                    onChange={e => this.handleNewStatusChange(e)}
                    placeholder="What's on your mind?"
                  />
                </div>
                <div className="col-md-12 text-right">
                  <button
                    className="btn btn-primary btn-lg"
                    onClick={e => this.handleNewStatusSubmit(e)}
                  >
                    Submit
                  </button>
                </div>
                <div className="col-md-12 text-right">
                  <button
                    className="btn btn-primary btn-lg"
                    onClick={e => this.handleReadFile(e)}
                  >
                    Read File
                  </button>
                </div>
              </div>
            }
            <div className="col-md-12 statuses">
            {this.state.isLoading && <span>Loading...</span>}
            {this.state.statuses.map((status) => (
                <div className="status" key={status.id}>
                  {status.text}
                </div>
                )
            )}
            </div>
          </div>
        </div>
      </div> : null
    );
  }

  componentWillMount() {
    this.setState({
      person: new Person(loadUserData().profile),
      username: loadUserData().username
    });
  }

  componentDidMount() {
    this.fetchData()
  }

  handleNewStatusChange(event) {
    this.setState({newStatus: event.target.value})
  }
 
  

  handleNewStatusSubmit(event) {
    this.state.docPrivateKey = makeECPrivateKey();
    console.log("generated private key:"+this.state.docPrivateKey);
    this.state.docPublicKey = getPublicKeyFromPrivate(this.state.docPrivateKey);
    console.log("generated public key:"+this.state.docPublicKey);
    let encryptOptions = {
      publicKey: this.state.docPublicKey
    };
    var docEncryptedContent = encryptContent(JSON.stringify(this.state.newStatus), encryptOptions)
    let docOptions = {
      encrypt: false
    };
    putFile('testDocEncrypted.json', docEncryptedContent, docOptions)
      .then(() => {
        console.log("saved 1");
        var docPrivateKeyEncryptedContent = 
          encryptContent(this.state.docPrivateKey, 
            {
              publicKey: '033ddb29f4af473bc22c66510c58b1272525fcadc3b2f5b5d5841bffe498ea95fb'
            }
          );
        
        putFile('olamundo2.id.blockstack.json', docPrivateKeyEncryptedContent, docOptions).then(()=> {console.log("saved 2");});
      });
  }

  handleReadFile(e){
    
    const options = { username: 'olamundo.id.blockstack', decrypt: false }
    getFile('olamundo2.id.blockstack.json', options).then(
      (file1)=>{
        var decryptedFile = decryptContent(file1, {privateKey:"ccdfa7d3449c8d64bb923cbe5d94fe48daba7bce10010816f9f25fcd6267eaa9"});
        getFile('testDocEncrypted.json', options)
      .then((file) => {
        let decryptOptions = {
          privateKey: decryptedFile
        }
        console.log("read private key:"+decryptOptions.privateKey);
        var content = decryptContent(file, decryptOptions);
        console.log("Conteudo: "+content);
      });
      }
    )
  }

  fetchData() {
    this.setState({ isLoading: true })
   if (this.isLocal()) {
    listFiles(file => {console.log("File: "+file);
    return true;});

     const options = { decrypt: false }
     getFile('statuses2.json', options)
       .then((file) => {
         var statuses = JSON.parse(file || '[]')
         this.setState({
           person: new Person(loadUserData().profile),
           username: loadUserData().username,
           statusIndex: statuses.length,
           statuses: statuses,
         })
       })
       .finally(() => {
         this.setState({ isLoading: false })
       })
   } else {
     const username = this.props.match.params.username

     lookupProfile(username)
       .then((profile) => {
         console.log("Profile: "+profile);
         this.setState({
           person: new Person(profile),
           username: username
         });
        })
       .catch((error) => {
         console.log('could not resolve profile')
       })
    
    const options = { username: username, decrypt: false }
    getFile('statuses2.json', options)
      .then((file) => {
        var statuses = JSON.parse(file || '[]')
        this.setState({
          statusIndex: statuses.length,
          statuses: statuses
        })
      })
      .catch((error) => {
        console.log('could not fetch statuses')
      })
      .finally(() => {
        this.setState({ isLoading: false })
      })
    }
  }

  isLocal() {
    return this.props.match.params.username ? false : true
  }
}
