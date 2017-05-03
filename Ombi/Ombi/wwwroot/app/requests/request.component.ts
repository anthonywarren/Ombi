﻿import { Component, OnInit } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/map';


import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/map';

import { RequestService } from '../services/request.service';
import { IdentityService } from '../services/identity.service';

import { IMovieRequestModel, ITvRequestModel } from '../interfaces/IRequestModel';

@Component({
    selector: 'ombi',
    moduleId: module.id,
    templateUrl: './request.component.html'
})
export class RequestComponent implements OnInit {
    constructor(private requestService: RequestService, private identityService: IdentityService) {
        this.searchChanged
            .debounceTime(600) // Wait Xms afterthe last event before emitting last event
            .distinctUntilChanged() // only emit if value is different from previous value
            .subscribe(x => {
                this.searchText = x as string;
                if (this.searchText === "") {
                    this.resetSearch();
                    return;
                }
                this.requestService.searchRequests(this.searchText).subscribe(x => this.movieRequests = x);
            });
    }

    movieRequests: IMovieRequestModel[];
    tvRequests: ITvRequestModel[];

    searchChanged: Subject<string> = new Subject<string>();
    searchText: string;

    isAdmin : boolean;

    private currentlyLoaded: number;
    private amountToLoad : number;

    ngOnInit() {
        this.amountToLoad = 5;
        this.currentlyLoaded = 5;
        this.loadInit();
    }

  

    loadMore() {
        this.requestService.getRequests(this.amountToLoad, this.currentlyLoaded + 1).subscribe(x => {
            this.movieRequests.push.apply(this.movieRequests, x);
            this.currentlyLoaded = this.currentlyLoaded + this.amountToLoad;
        });
    }

    search(text: any) {
        this.searchChanged.next(text.target.value);
    }

    removeRequest(request: IMovieRequestModel) {
        this.requestService.removeMovieRequest(request);
        this.removeRequestFromUi(request);
    }

    changeAvailability(request: IMovieRequestModel, available: boolean) {
        request.available = available;
        
        this.updateRequest(request);
    }

    approve(request: IMovieRequestModel) {
        request.approved = true;
        request.denied = false;
        this.updateRequest(request);
    }

    deny(request: IMovieRequestModel) {
        request.approved = false;
        request.denied = true;
        this.updateRequest(request);
    }

    private updateRequest(request: IMovieRequestModel) {
        this.requestService.updateRequest(request).subscribe(x => request = x);
    }

    private loadInit() {
        this.requestService.getRequests(this.amountToLoad, 0).subscribe(x => this.movieRequests = x);
        this.isAdmin = this.identityService.hasRole("Admin");
    }

    private resetSearch() {
        this.currentlyLoaded = 5;
        this.loadInit();
    }

    private removeRequestFromUi(key: IMovieRequestModel) {
        var index = this.movieRequests.indexOf(key, 0);
        if (index > -1) {
            this.movieRequests.splice(index, 1);
        }
    }
}