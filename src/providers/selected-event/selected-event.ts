import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Event } from '../../models/event';

@Injectable()
export class SelectedEventProvider {

  event: Event;
  scrollPosition: number = 0;
  constructor(public http: HttpClient) {
    //console.log('Hello SelectedEventProvider Provider');
  }

  getEvent(){
    return this.event;
  }

  setEvent(event){
    this.event = event;
  }

  setScrollPosition(pos){
    this.scrollPosition = pos;
  }

  getScrollPosition(){
    return this.scrollPosition;
  }


}
