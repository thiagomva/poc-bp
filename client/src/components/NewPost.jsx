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
  decryptContent
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
      newFileDescription: "",
      newFileContent: "",
      newFileIsPublic: true,
      isLoading: false
    };

    this.handleModelChange = this.handleModelChange.bind(this);
  }

  render() {
    return (
      <div className="new-page">
        <div className="row">
            <div className="col-md-12">
                {this.props.editingFile ? <div className="page-title">
                    EDIT POST
                </div> :
                <div className="page-title">
                    CREATE POST
                </div>}
            </div>
        </div>
        <div className="row">
          <div className="col-md-12 mb-4">
            <input className="form-control input-page-name"
              value={this.state.newFileTitle}
              onChange={e => this.handleNewFileTitleChange(e)}
              placeholder="What's your post title?"
              maxLength="200"
            />
          </div>
          <div className="col-md-12 mb-2"><span>This post is:</span></div>
          <div className="col-md-12">
            <label>
              <input
                type="radio"
                name="fileIsPublic"
                value="public"
                checked={this.state.newFileIsPublic}
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
                checked={!this.state.newFileIsPublic}
                onChange={e => this.handleFileIsPublicChange(e)}
              />
              &nbsp;Only for paying subscribers
            </label>
          </div>
          {!this.state.newFileIsPublic && <div className="col-md-12 mt-3">
            <input className="form-control input-page-hint"
              value={this.state.newFileDescription}
              onChange={e => this.handleNewFileDescriptionChange(e)}
              placeholder="What's your post hint?"
              maxLength="1000"
            />
          </div>}
          <div className="col-md-12 mt-4">
          <FroalaEditor
            tag='textarea'
            config={{
              placeholderText: "Content",
              videoResponsive: true,
              toolbarButtons: ['bold', 'italic', 'underline', 'color', 'align', 'fontSize', 'insertLink', 'insertImage', 'insertVideo'],
              imageInsertButtons: ['imageByURL'],
              imageUploadRemoteUrls: false,
              heightMin: '200px',
			  key: 'LB5A1C1C2sB4E4H4A15B3A7B6F2D4F3fyuinD-13tsmmH3fi=='
            }}
            model={this.state.newFileContent}
            onModelChange={this.handleModelChange}
          />
          </div>
          <div className="col-md-12 text-right my-4">
            <button className="btn btn-secondary btn-lg margin-right-10"
              onClick={e => this.props.handleCancel()}>
              Cancel
            </button>
            <button 
              className="btn btn-primary btn-lg"
              onClick={e => this.handleNewPostSubmit(e)}
            >
              Save
            </button>
          </div>
        </div>
      </div>
    );
  }

  componentDidMount() {
    this.setState({
      person: new Person(loadUserData().profile),
      username: loadUserData().username
    });
    this.fetchData(this.props);
  }

  componentWillReceiveProps(nextProps) {
    this.fetchData(nextProps)
  }

  fetchData(props) {
    if(props && props.editingFile){
      this.loadFileInfoWithContent(props.editingFile);
    }
  }

  loadFileInfoWithContent(editingFile){
    if(!editingFile.isPublic){
      getFile("myFilesPrivateKeys.json").then((file)=>{
          var keys = JSON.parse(file || "{}");
          this.handleSelectedFile(editingFile, keys[editingFile.name]);
      });
    }
    else{
      this.handleSelectedFile(editingFile, null, true);
    }
  }

  handleSelectedFile(editingFile, file, isPublic) {
    const options = { decrypt: false };
    getFile('myFiles.json', options).then(
        (fileWithEncryptedContent) => {
            var parsedFileWithEncryptedContent = JSON.parse(fileWithEncryptedContent || "{}");
            var fileContent = '';
            if (isPublic) {
                fileContent = parsedFileWithEncryptedContent[editingFile.name].content;
            } else {
                var decryptedFilePrivateKey = null;
                decryptedFilePrivateKey = file.decryptionPrivateKey;
                fileContent = decryptContent(parsedFileWithEncryptedContent[editingFile.name].content, {privateKey:decryptedFilePrivateKey});
            }
            
            var currentFileContent = JSON.parse(fileContent);

            var newState = {
              newFileName: editingFile.name,
              newFileTitle: editingFile.title,
              newFileContent: currentFileContent,
              newFileDescription: editingFile.description,
              newFileIsPublic: editingFile.isPublic,
              newFileTime: editingFile.postTime,
            }
            this.setState(newState);
        });
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

    if(this.checkEmptyField(fileInfo.fileTitle)){
      alert("Title is required");
      return;
    }
    if(!fileInfo.isPublic && this.checkEmptyField(fileInfo.fileDescription)){
      alert("Hint is required for non public posts");
      return;
    }
    if(this.checkMaxLengthExceeded(fileInfo.fileTitle,200)){
      alert("Title must not exceed 200 characters");
      return;
    }
    if(this.checkMaxLengthExceeded(fileInfo.fileDescription,1000)){
      alert("Hint must not exceed 1000 characters");
      return;
    }
    if(this.checkEmptyField(fileInfo.fileContent)){
      alert("Content is required");
      return;
    }
    
    this.addNewFile(fileInfo);
  }

  checkMaxLengthExceeded(value, length){
    return value.length > length;
  }

  checkEmptyField(value){
    return value == null || (typeof value == "string" && value.trim() == "" );
  }

  addNewFile(fileInfo){
    getFile("myFiles.json", {decrypt:false}).then((file)=>{
      var myFiles = JSON.parse(file || "{}");
      if(!fileInfo.fileName){
        var currentId = myFiles.currentFileName || 0;
        myFiles.currentFileName = currentId + 1;
        fileInfo.fileName = myFiles.currentFileName;
      }
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
  }

  savePostOnServer(fileInfo){
    var url = server_url + '/api/v1/posts';
    fileInfo["username"] = this.state.username;
    Axios.post(url, fileInfo).then(response => {
      
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
      this.savePostOnServer(pageInfo.files[fileInfo.fileName]);
      this.props.handleSavePage(pageInfo);
    });
  }
}