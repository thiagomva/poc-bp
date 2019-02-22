import React, { Component } from 'react';
import { server_url } from '../config';
import Axios from 'axios';
import { loadUserData} from 'blockstack';

export default class DiscordPanel extends Component {
    constructor(props) {
        super(props);

        this.state = {
            subscribers: []
        };
    }

    render() {
        return(
            <div>
                <div className="card">
                    <div className="card-body discord-panel">
                        <div>Enable access to your server to add Discord role to your benefits.</div>
                        <div>Gives BitPatrons access to selected role on Discord.</div>
                        <div className="icon-btn discord-btn text-center my-5">
                            <div className={(this.userAlreadyConfiguredDiscord()) ? "btn btn-primary disabled" : "btn btn-primary"} onClick={e => {this.handleConnectToDiscord()}}>
                                <span>{this.userAlreadyConfiguredDiscord() ? "CONNECTED TO " : "CONNECT TO "}</span><img src="./images/icons/Icon_Discord_02.png"/>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="subscribers-title">
                    Active subscribers
                </div>
                <table className="table table-sm">
                    <thead className="thead-dark">
                        <tr>
                            <th scope="col">Username</th>
                            <th scope="col">Payment Date</th>
                            <th scope="col">Discord Username</th>
                            <th scope="col">Discord Email</th>
                            <th scope="col">Active Util</th>
                        </tr>
                    </thead>
                    <tbody>
                        {this.state.subscribers.map(subscriber => (
                        <tr key={subscriber.SubscriberUsername}>
                            <th scope="row">{subscriber.SubscriberUsername}</th>
                            <td>{this.formatToDate(subscriber.PaymentDate)}</td>
                            <td>{subscriber.DiscordUsername}</td>
                            <td>{subscriber.DiscordEmail}</td>
                            <td>{this.formatToDate(subscriber.ExpirationDate)}</td>
                        </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    }

    userAlreadyConfiguredDiscord(){
        return false;
    }

    handleConnectToDiscord(){

    }

    formatToDate(date){
        return new Date(date).toLocaleDateString({}, { year: 'numeric', month: 'short', day: 'numeric'})
    }

    componentWillMount(){
        this.listSubscribers();
    }

    listSubscribers(){
        var config={headers:{}};
        if(true || loadUserData()){
            config.headers["blockstack-auth-token"] = "eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NksifQ.eyJqdGkiOiJlNDEzMDI3YS05NjY0LTRmNTItYjA4YS02NmQ3YmExNGFjMzQiLCJpYXQiOjE1NDk2NDk4MzgsImV4cCI6MTU1MjA3MjYzOCwiaXNzIjoiZGlkOmJ0Yy1hZGRyOjFCNEFzaWp6OHF3UmdmQ2prU0c3MzlhUVl2WWhtWERLalQiLCJwcml2YXRlX2tleSI6IjdiMjI2OTc2MjIzYTIyMzE2NDYyMzY2MTY0NjM2MTM1MzM2NjM1NjQ2MjM4MzA2NDM3Mzg2MTM2Mzg2NjY2MzE2NjYxMzczNzYzMzUzODIyMmMyMjY1NzA2ODY1NmQ2NTcyNjE2YzUwNGIyMjNhMjIzMDMzMzkzNjMxNjM2NTMxNjY2MzM3NjM2NTYxMzU2MTYyNjIzOTYxMzQzODMwMzM2NTYyMzkzMzYxMzYzNTMxMzgzMjMwNjI2MTY1MzUzMDYzMzk2MjMzMzI2NDMxNjYzOTM2NjQ2NTY0Mzg2MzY1MzkzODYxNjYzNDM0Mzk2NDM0MzYyMjJjMjI2MzY5NzA2ODY1NzI1NDY1Nzg3NDIyM2EyMjY2MzE2NjYzMzUzMDYzMzE2NDY1MzczNDY1MzI2NDM1MzQ2MzMxNjYzNTM1MzIzMjMwMzQzNTMwMzQ2MjYzNjIzMjYzMzczMDM0Mzg2NDMwMzM2NjM2MzkzMDMxMzA2MjM5MzkzMzM0NjE2NjMwMzAzMTYzMzM2MzM3NjIzMjMwNjEzNDYzMzUzMDY1MzUzMTM3MzkzNDYxMzkzNzM2Mzc2NDM4MzA2MjYzMzYzMjM2MzM2MzMzMzE2NDMyMzczOTYxMzc2NjM0NjUzMzM1NjQzMzM3MzkzMjYxMzM2NDMwMzMzNzM0MzkzOTMxMzg2NTMxMzA2NjM3MzgzMTYxNjMzNTM5MzUzNjM4NjQzNjM4MzU2MzM0NjE2NDMwNjMzODM2MzczODYzMzQ2MTYzMzAzNzYzNjMzMjY1NjIzMTYyMjIyYzIyNmQ2MTYzMjIzYTIyMzUzNTM4MzQzNTM1MzgzMjMyNjUzMDM4MzgzMTMwMzQzODYzNjMzMzMxNjEzNjM0MzM2MzM5NjU2MTM3MzEzOTYzNjMzMTY2NjUzOTM5MzUzNjM5MzczMDY1Mzg2NjM5MzU2MTY1MzIzNDYxMzc2NDYzNjEzOTM0NjQ2MTYzNjYyMjJjMjI3NzYxNzM1Mzc0NzI2OTZlNjcyMjNhNzQ3Mjc1NjU3ZCIsInB1YmxpY19rZXlzIjpbIjAzMTA0NTUwNjk2MzQyNDQ5ODllNzMxZTVmODM2YjRiNDBiMWMxZmE1NzM0MjQ5MzI0YTFmNmMzYWVjNTcyMjRlNCJdLCJwcm9maWxlIjpudWxsLCJ1c2VybmFtZSI6ImRkdWFydGVmLmlkLmJsb2Nrc3RhY2siLCJjb3JlX3Rva2VuIjpudWxsLCJlbWFpbCI6ImRhbmllbGR1YXJ0ZWZpZ3VlaXJlZG9AZ21haWwuY29tIiwicHJvZmlsZV91cmwiOiJodHRwczovL2dhaWEuYmxvY2tzdGFjay5vcmcvaHViLzFCNEFzaWp6OHF3UmdmQ2prU0c3MzlhUVl2WWhtWERLalQvcHJvZmlsZS5qc29uIiwiaHViVXJsIjoiaHR0cHM6Ly9odWIuYmxvY2tzdGFjay5vcmciLCJ2ZXJzaW9uIjoiMS4yLjAifQ.S0l3xarOIYUtRmrq9tg5d_QpZdSLYa_Pq_-g5OQtXU2PCGdC943xgwylvXYDVpMUbWMMdZeaooggM-GBNTlJ_w";
            //loadUserData().authResponseToken;
            
            var url = server_url + '/api/v1/charges/subscribers';
            Axios.get(url, config).then(response => {
                this.setState({subscribers: response.data});
            });
        }
    }
}