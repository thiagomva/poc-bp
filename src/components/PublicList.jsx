import React, { Component } from 'react';

export default class PublicList extends Component {
    constructor(props) {
        super(props);

        this.state = {
            isLoading: false,
            pageName: "",
            pageDescription: "",
            subscriptionPrice: 0,
            subscriptionDuration: 0,
            files: {}
        }
    }

    render() {
        return (
            <div className="panel-landing" id="section-1">
                {this.state.isLoading &&
                <h1>Loading...</h1>
                }
                <h1 className="landing-heading">{this.state.pageName}</h1>
                <h2>{this.state.pageDescription}</h2>
                {this.state.subscriptionDuration > 0 &&
                <div>Price: {this.state.subscriptionPrice} ETH - Valid Until: {this.getFormattedDateFromDuration(this.state.subscriptionDuration)}</div>
                }
                <div className="file-container">
                {Object.keys(this.state.files).map((fileName) => (
                
                    <div key={fileName} className="file-card">{this.state.files[fileName].title}</div>
                ))}
                </div>
            </div>
        );
    }

    componentDidMount() {
        this.fetchData()
    }

    fetchData() {
        this.setState({ isLoading: true })
        if (this.useDummy()) {
            this.getDummyData().then((data) => {
                this.setState(
                    {
                        pageName: data.pageName,
                        pageDescription: data.pageDescription,
                        subscriptionPrice: data.subscriptionPrice,
                        subscriptionDuration: data.subscriptionDuration,
                        files: data.files
                    }
                );
            })
            .finally(() => {
                this.setState({ isLoading: false })
              })
        }
    }

    getFormattedDateFromDuration(duration) {
        var date = new Date(Date.now());
        date.setDate(date.getDate() + duration);
        return date.getFullYear() + '/' + (date.getMonth() + 1) + '/' + date.getDate();
    }

    useDummy() {
        return true;
    }

    getDummyData(onSuccess, onError) {
        return new Promise((resolve, reject) => {
            setTimeout(function() {
                resolve({
                    pageName: "My Page",
                    pageDescription: "This is My Page",
                    subscriptionPrice:0.1,
                    subscriptionDuration:30,
                    files:{
                        "file1.html":{
                            title:"Aula1"
                        },
                        "file2.html":{
                            title:"DemoFile"
                        }
                    }
                });
              }, 1500);
        });
    }
}