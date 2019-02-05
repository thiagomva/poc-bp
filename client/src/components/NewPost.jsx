import React, { Component } from 'react';
import FroalaEditor from 'react-froala-wysiwyg';
import {
  makeECPrivateKey,
  getPublicKeyFromPrivate,
  getFile,
  putFile,
  encryptContent,
  loadUserData,
  Person,
} from 'blockstack';
import Axios from 'axios';
import { server_url } from '../config';

export default class NewPost extends Component {
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
      newFileName: "",
      newFileTitle: "",
      newFileContent: "",
      newFileIsPublic: false,
      isLoading: false
    };

    this.handleModelChange = this.handleModelChange.bind(this);
  }

  render() {

    return (
      <div className="new-page">
        <div className="col-md-12">
          <input className="input-page-name"
            value={this.state.newFileName}
            onChange={e => this.handleNewFileNameChange(e)}
            placeholder="What's your post file name?"
          />
        </div>
        <div className="col-md-12">
          <input className="input-page-name"
            value={this.state.newFileTitle}
            onChange={e => this.handleNewFileTitleChange(e)}
            placeholder="What's your post title?"
          />
        </div>
        <div className="col-md-12">
          <input className="input-page-description"
            value={this.state.newFileDescription}
            onChange={e => this.handleNewFileDescriptionChange(e)}
            placeholder="What's your post description?"
          />
        </div>
        <div className="col-md-12"><span>This file is:</span></div>
        <div className="col-md-12">
          <label>
            <input
              type="radio"
              name="fileIsPublic"
              value="public"
              onChange={e => this.handleFileIsPublicChange(e)}
            />
            &nbsp;Public
          </label>
        </div>
        <div className="col-md-12">
          <label>
            <input
              type="radio"
              name="fileIsPublic"
              value="paid"
              onChange={e => this.handleFileIsPublicChange(e)}
            />
            &nbsp;Only for paying subscribers
          </label>
        </div>
        <div className="col-md-12">
        <FroalaEditor
          tag='textarea'
          config={{
            placeholderText: "Content",
            toolbarButtons: ['bold', 'italic', 'underline', 'color', 'align', 'fontSize', 'insertLink', 'insertImage', 'embedly'],
            imageInsertButtons: ['imageByURL'],
            imageUploadRemoteUrls: false
          }}
          model={this.state.newFileContent}
          onModelChange={this.handleModelChange}
        />
        </div>
        {/* <div className="col-md-12">
          <textarea className="input-page-price" type="number"
            value={this.state.newFileContent}
            onChange={e => this.handleNewFileContentChange(e)}
            placeholder="Content"
          />
        </div> */}
        <div className="col-md-12 text-right">
          <button 
            className="btn btn-primary btn-lg"
            onClick={e => this.handleNewPostSubmit(e)}
          >
            Save
          </button>
        </div>
      </div>
    );
  }

  componentWillMount() {
    this.setState({
      person: new Person(loadUserData().profile),
      username: loadUserData().username
    })
  }

  componentDidMount() {
  }
  
  handleNewFileNameChange(event) {
    this.setState({newFileName: event.target.value})
  }

  handleNewFileTitleChange(event) {
    this.setState({newFileTitle: event.target.value})
  }

  handleNewFileDescriptionChange(event) {
    this.setState({newFileDescription: event.target.value})
  }

  handleFileIsPublicChange(event) {
    this.setState({ newFileIsPublic: event.target.value === 'public' && event.target.checked })
  }

  handleNewFileContentChange(event) {
    this.setState({newFileContent: event.target.value})
  }

  handleModelChange(content) {
    this.setState({
      newFileContent: content
    });
  }

  handleNewPostSubmit(event) {
    var privateKey = makeECPrivateKey();
    var publicKey = getPublicKeyFromPrivate(privateKey);

    let fileInfo = {
      fileName: this.state.newFileName,
      fileTitle: this.state.newFileTitle,
      fileDescription: this.state.newFileDescription,
      isPublic: this.state.newFileIsPublic,
      fileContent: this.state.newFileContent,
      privateKey:privateKey,
      publicKey: publicKey
    }
    
    this.addNewFile(fileInfo);
  }

  addNewFile(fileInfo){
    getFile("myFiles.json", {decrypt:false}).then((file)=>{
      var myFiles = JSON.parse(file || "{}");
      this.addNewFileToList(myFiles, fileInfo);
    })    
  }

  addNewFileToList(myFiles, fileInfo){
    let encryptOptions = {
      publicKey: fileInfo.publicKey
    };

    if (fileInfo.isPublic) {
      myFiles[fileInfo.fileName] = {
        content: JSON.stringify(fileInfo.fileContent)
      };
    } else {
      myFiles[fileInfo.fileName] = {
        content: encryptContent(JSON.stringify(fileInfo.fileContent),encryptOptions)
      };
    }

    let docOptions = { encrypt: false };
    putFile('myFiles.json', JSON.stringify(myFiles), docOptions)
    .then(() => {
      this.addFileToPrivateList(fileInfo);
    });

    var url = server_url + '/api/v1/pages';

    Axios.post(url, {
      userBlockstackId: this.state.username,
      numberOfPosts: Object.keys(myFiles).length
    }).then(response => {
      
    });
  }

  addFileToPrivateList(fileInfo){
    getFile("myFilesPrivateKeys.json").then((file)=>{
      var myFiles = JSON.parse(file || "{}");
      this.addNewFilePrivateKeyToList(myFiles, fileInfo);
    }) 
  }

  addNewFilePrivateKeyToList(myFiles, fileInfo){
    myFiles[fileInfo.fileName] = {
      decryptionPublicKey: fileInfo.publicKey,
      decryptionPrivateKey: fileInfo.privateKey
    };

    putFile('myFilesPrivateKeys.json', JSON.stringify(myFiles)).then(()=> this.saveFilePrivateKeyToSubscribers(fileInfo));
  }

  saveFilePrivateKeyToSubscribers(fileInfo){
    getFile("bp/subscribers.json").then((file)=>{
      var subscribers = JSON.parse(file || "{}");
      for (var key in subscribers){
        if(subscribers[key].expirationDate > (new Date()).getTime()){
          this.saveFilePrivateKeyToSubscriber(fileInfo, key);
        }
      }
      this.savePublicFileInformation(fileInfo);
    });
  }

  saveFilePrivateKeyToSubscriber(fileInfo, subscriberPublicKey){
    getFile('bp/' + subscriberPublicKey + '.json', { decrypt: false }).then(
      (file) => {
        var subscribedFiles = JSON.parse(file || "{}");
        var encryptedFilePrivateKey = encryptContent(fileInfo.privateKey, {publicKey: subscriberPublicKey});
        subscribedFiles[fileInfo.fileName] = {
          decryptionPrivateKey: encryptedFilePrivateKey
        };
        putFile('bp/' + subscriberPublicKey + '.json', JSON.stringify(subscribedFiles), {encrypt:false}).then();
      }
    );
  }

  savePublicFileInformation(fileInfo){
    getFile("pageInfo.json", {decrypt:false}).then((file)=>{
      var pageInfo = JSON.parse(file);
      if(pageInfo.files == null){
        pageInfo.files={};
      }
      var isNew = pageInfo.files[fileInfo.fileName] == undefined;
      pageInfo.files[fileInfo.fileName] = {
        title: fileInfo.fileTitle,
        name: fileInfo.fileName,
        description: fileInfo.fileDescription,
        isPublic: fileInfo.isPublic,
        postTime: isNew ? new Date().getTime() : pageInfo.files[fileInfo.fileName].postTime
      }
      this.props.handleSavePage(pageInfo);
    });
  }
}