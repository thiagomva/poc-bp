import React, { Component } from 'react';
import {
  putFile,
  getFile
} from 'blockstack';

export default class ImageUploader extends Component {

  constructor(props) {
    super(props);

  	this.state = {
      imageText: 'Upload photo'
    };
  }

  render() {
    var iconUploadClasses = "icon icon-upload";
    var imgClass="img-upload";
    var emptyImgClass="empty-img";
    if(this.state.dragging){
      iconUploadClasses +=  " activeColor";
      imgClass +=" activeBox"
      emptyImgClass += " activeBox";
    }
    if(this.state.loaded){
      imgClass+= " loaded";
    }
    

    return (<label className="uploader" onDragOver={e => this.handleDragOver(e)}
          onDragEnter={e => this.handleDragEnter(e)}
          onDragLeave={e => this.handleDragLeave(e)}
          onDrop={e => this.handleDrop(e)}>

          <i className={iconUploadClasses}>{this.state.imageText}</i>
          
          <img className={imgClass} src={this.state.imageSrc}/>
          {!this.state.loaded && <div className={emptyImgClass}></div>}
          <input type="file" id="fileInput" name="fileInput" accept=".png,.jpg,.jpeg" onChange={e => this.handleInputChange(e)}/>
      </label>
    );
  }

  componentDidMount() {
    let docOptions = { decrypt: false };
    getFile('pageImage', docOptions).then(result => 
      this.setState({imageSrc: result, loaded: true, wasChanged: false, imageText: ''})
    );
  }
  
  handleDragOver(){
    return false;
  }

  handleDragEnter() {
    this.setState({dragging: true});
  }

  handleDragLeave() {
    this.setState({dragging: false});
  }

  handleDrop(e) {
      e.preventDefault();
      this.setState({dragging: false});
      this.handleInputChange(e);
  }

  handleInputChange(e) {
      let file = e.dataTransfer ? e.dataTransfer.files[0] : e.target.files[0];
      if (file) {
          this.loaded = false;
          this.fileToUpload = file;

          let type = file.type.toLowerCase();
          if (type.indexOf("png") >= 0 || type.indexOf("jpeg") >= 0 || type.indexOf("jpg") >= 0) {
              let reader = new FileReader();
              reader.onload = this._handleReaderLoaded.bind(this);
              reader.readAsDataURL(file);
          } else {
              this.notificationService.error(
                  "Error",
                  "Invalid file type."
                );
              this.clearComponent();
          }
      } else {
          this.clearComponent();
      }
  }

  getFile() {
      return this.state.fileToUpload;
  }

  fileWasChanged() {
      return this.state.wasChanged;
  }

  clearComponent() {
    var state = {}
    if (!this.state.wasChanged && this.state.loaded) {
        state.wasChanged = true;
    }
    state.imageSrc = '';
    state.imageText = 'Upload photo';
    state.loaded = false;
    state.fileToUpload = null;
    this.setState(state);
  }

  forceImageUrl(imageUrl) {
      if (!!imageUrl) {
          this.clearComponent();
          this.setState({imageSrc: imageUrl, loaded: true});
      }
  }

  _handleReaderLoaded(e) {
      var reader = e.target;
      let docOptions = { encrypt: false };
      putFile('pageImage', reader.result, docOptions).then(
        this.setState({imageSrc: reader.result, loaded: true, wasChanged: true, imageText: ''})
      );
  }

  removeImage(e) {
      e.preventDefault();
      e.stopPropagation();
      this.clearComponent();
  }
}