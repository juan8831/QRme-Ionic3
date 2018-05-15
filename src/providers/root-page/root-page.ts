import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import {BehaviorSubject} from 'rxjs';
import { EventsPage } from '../../pages/events/events';
import { TabsPage } from '../../pages/tabs/tabs';


@Injectable()
export class RootPageProvider {

  //observablePage = Observable.of(EventsPage);

  

  page: BehaviorSubject<boolean> = new BehaviorSubject(null);


 // var c = Observable.

  

  constructor(public http: HttpClient) {
  }

  getPage(){
    return this.page;
  }



}
