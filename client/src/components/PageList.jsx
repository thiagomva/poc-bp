import React, { Component } from 'react';
import Axios from 'axios';
import { server_url } from '../config';
import {
    isUserSignedIn,
    getFile,
    lookupProfile,
    Person,
    loadUserData
  } from 'blockstack';
const avatarFallbackImage = '/images/avatar-placeholder.png';
const categories = {1:"VIDEOS",
    2:"PODCASTS",
    3:"GAMES",
    4:"PHOTOS",
    5:"CRYPTO",
    6:"MUSIC",
    7:"SPORTS",
    8:"WRITING",
    9:"OTHERS"};
const categoriesIcons = {1:"fa-video-camera",
    2:"fa-microphone",
    3:"fa-gamepad",
    4:"fa-camera-retro",
    5:"fa-bitcoin",
    6:"fa-music",
    7:"fa-futbol-o",
    8:"fa-edit",
    9:"fa-ellipsis-h"};

const PAGE_SIZE=12;
export default class PageList extends Component {
    constructor(props) {
        super(props);

        this.state = {
            pages: [],
            filteredPages: [],
            currentPageItens: [],
            currentPage: 1,
            showPosts: false,
            isLoading: true,
            selectedCategory: this.getCategory(props.match.params.category),
        }
    }
    
    getCategory(categoryName){
        if(categoryName){
            for(var category of Object.keys(categories)){
                if(categoryName.toUpperCase() == categories[category].toUpperCase()){
                    return category;
                }
            };
        }
        return null;
    }

    render() {
        const { handleSignOut } = this.props;
        var username = null;
        if(isUserSignedIn()){
            username = loadUserData().username;
        }

        let pagesNumbers = []
        var numberOfPages = Math.ceil(this.state.filteredPages.length/PAGE_SIZE);
        for(let i=0; i<numberOfPages; i++){
            if((this.state.currentPage - i > -3 && this.state.currentPage - i < 5)){
                pagesNumbers.push(i+1);
            }
        }
        return (
            <div>
                <div className="container">
                    <div className="row">
                        <div className="col-md-6">
                            <div className="page-title">
                                {this.state.selectedCategory ? categories[this.state.selectedCategory] : "FEATURED"}
                            </div>
                        </div>
                        {username && <div className="col-md-6">
                            <a className="btn btn-outline-primary pull-right btn-my-page" href={"/"+username}>MY PAGE</a>  
                        </div>}
                    </div>
                    <div className="row">
                    {this.state.isLoading && 
                        <div className="col-md-12">Loading...</div>
                    }
                    {!this.state.isLoading && this.state.filteredPages.length == 0 &&
                        <div className="col-md-12">This category doesn't have any page.</div>
                    }
                    {this.state.currentPageItens.map((page) => (
                        <div key={page.username} className="col-md-4">
                            <div className="page-card card mb-4">
                                <img src="/images/card_top.png" className="card-img-top"/>
                                <div className="card-body">
                                    <div className="card-image-title">
                                        <img src={ this.state["pageImage_"+page.username] ? this.state["pageImage_"+page.username] : avatarFallbackImage } 
                                        className="img-rounded avatar avatar-sm" id="avatar-image"/>
                                        <div className="d-inline-block card-top-info">
                                            <div className="card-creator">{this.state["person_"+page.username] && this.state["person_"+page.username].name() ? this.state["person_"+page.username].name() : page.username.split('.')[0]}</div>
                                            <div className="card-category">{this.getCategoryName(page.category)}</div>
                                            <div className="card-title twolines-truncate">{page.pageName}</div>
                                        </div>
                                    </div>
                                    <div className="card-description multiline-truncate">{page.pageDescription}</div>
                                    <div className="card-price">Subscription starting at <strong>${this.getLowestPrice(page)}</strong></div>
                                    <hr/>
                                </div>
                                <div className="card-footer">
                                    <a className="btn btn-outline-primary" href={"/"+page.username}>EXPLORE</a>  
                                </div>
                            </div>
                        </div>
                    ))}
                    {pagesNumbers.length > 1 &&
                        <nav className="col-md-12">
                            <ul className="pagination">
                                <li title="First" className={"page-item "+ ((this.state.currentPage == 1) ? "disabled":"")}>
                                    <a onClick={e => this.onPage(1)} className="page-link" href="#" tabIndex="-1" aria-disabled="true">&laquo;</a>
                                </li>
                                <li title="Previous" className={"page-item "+ ((this.state.currentPage == 1) ? "disabled":"")}>
                                    <a onClick={e => this.onPage(this.state.currentPage - 1)} className="page-link" href="#" tabIndex="-1" aria-disabled="true">‹</a>
                                </li>
                                {this.state.currentPage > 4 && <li className="page-item disabled">
                                    <a className="page-link" href="#" tabIndex="-1" aria-disabled="true">...</a>
                                </li>}
                                {pagesNumbers.map((pageNumber) => (
                                    <li key={pageNumber} className={"page-item "+ ((this.state.currentPage == pageNumber) ? "active":"")} ><a onClick={e => this.onPage(pageNumber)} className="page-link" href="#">{pageNumber}</a></li>
                                ))}
                                {(numberOfPages - this.state.currentPage) >  3 && <li className="page-item disabled">
                                    <a className="page-link" href="#" tabIndex="-1" aria-disabled="true">...</a>
                                </li>}
                                <li title="Next" className={"page-item "+ ((this.state.currentPage == numberOfPages) ? "disabled":"")}>
                                    <a onClick={e => this.onPage(this.state.currentPage + 1)} className="page-link" href="#">›</a>
                                </li>
                                <li title="Last" className={"page-item "+ ((this.state.currentPage == numberOfPages) ? "disabled":"")}>
                                    <a onClick={e => this.onPage(numberOfPages)} className="page-link" href="#">&raquo;</a>
                                </li>
                            </ul>
                        </nav>
                    }
                    </div>
                    <hr></hr>
                    <div className="row">
                        <div className="col-md-12">
                            <div className="page-title">
                                CATEGORIES
                            </div>
                        </div>
                    </div>
                    <div className="row">
                        {Object.keys(categories).map((category) => (
                            <div key={category} className="col-md-4">
                                <div className="btn btn-primary icon-btn category-card" onClick={e => this.handleCategory(category)}>
                                    <i className={"fa "+categoriesIcons[category]}></i>
                                    <span>{categories[category]}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    getLowestPrice(pageInfo){
        var price = pageInfo.monthlyPrice;
        if(pageInfo.quarterlyPrice && (price == null || price > pageInfo.quarterlyPrice)){
            price = pageInfo.quarterlyPrice;
        }
        if(pageInfo.halfYearlyPrice && (price == null || price > pageInfo.halfYearlyPrice)){
            price = pageInfo.halfYearlyPrice;
        }
        if(pageInfo.yearlyPrice && (price == null || price > pageInfo.yearlyPrice)){
            price = pageInfo.yearlyPrice;
        }
        return price;
    }

    handleCategory(category){
        this.filterCategory(category);
        var url = '/explore/'+categories[category].toLowerCase();
        if(history.pushState) {
            history.pushState(null, null, url);
        }
        else {
            location = url;
        }
        window.scrollTo(0, 0);
    }

    getCategoryName(category){
        if(category != null){
            return categories[category];
        }
        return "Others";
    }

    componentDidMount() {
      this.fetchData();
    }

    fetchData() {
        var url = server_url + '/api/v1/pages';
        Axios.get(url).then(response => {
            var newState = {pages:response.data};
            if(this.state.selectedCategory != null){
                newState.filteredPages = this.getFromCategory(this.state.selectedCategory, response.data);
            }
            else{
                newState.filteredPages = this.getFeaturedPages(response.data);
            }
            newState.currentPage = 1;
            this.setState(newState, () => this.fetchImagesAndProfilesOfCurrentPageItens());
          });
    }

    getFeaturedPages(pages){
        var featured = [];
        for (var i =0; i<pages.length;i++){
            if(pages[i].featured){
                featured.push(pages[i]);
            }
        }
        return featured;
    }

    getFromCategory(category, pages){
        var filter = [];
        for (var i =0; i<pages.length;i++){
            if((pages[i].category == null && category == 9) || pages[i].category == category){
                filter.push(pages[i]);
            }
        }
        return filter;
    }

    filterCategory(category){
        this.setState({isLoading: true});
        var filter = this.getFromCategory(category, this.state.pages);
        this.setState({filteredPages: filter, selectedCategory: category, currentPage: 1}, () => this.fetchImagesAndProfilesOfCurrentPageItens());
    }

    onPage(pageNumber){
        this.setState({currentPage: pageNumber}, () => this.fetchImagesAndProfilesOfCurrentPageItens());
    }

    fetchImagesAndProfilesOfCurrentPageItens(){
        var pageStart = (this.state.currentPage-1)*PAGE_SIZE;
        var currentPageItens = this.state.filteredPages.slice(pageStart, pageStart+PAGE_SIZE);
        var lastIndex = pageStart+PAGE_SIZE;
        if(this.state.filteredPages.length < lastIndex)
            lastIndex = this.state.filteredPages.length;
        for (var i =pageStart; i<lastIndex;i++){
            this.getPageImage(i);
            this.getProfile(i);
        }
        this.setState({currentPageItens: currentPageItens, isLoading: false});
    }

    getProfile(index){
        var pages = this.state.filteredPages;
        if(!this.state["person_"+pages[index].username]){
            lookupProfile(pages[index].username)
            .then((profile) => {
                var person = new Person(profile);
                var newState = {};
                newState["person_"+pages[index].username]=person;
                this.setState(newState);
            })
        }
    }

    getPageImage(index){
        var pages = this.state.filteredPages;
        if(!this.state["pageImage_"+pages[index].username]){
            const options = { username: pages[index].username, decrypt: false };
            getFile('pageImage', options).then(result => {
                var newState = {};
                newState["pageImage_"+pages[index].username]=result;
                this.setState(newState);
            })
        }
    }
}