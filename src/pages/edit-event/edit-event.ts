import { Component, OnInit } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { Event } from '../../models/event';
import { Form, NgForm } from '@angular/forms';
import { EventProvider } from '../../providers/event/event';

//used for creating and editing events
@IonicPage()
@Component({
  selector: 'page-edit-event',
  templateUrl: 'edit-event.html',
})
export class EditEventPage implements OnInit {

  event : Event;
  isnewEvent: boolean;

  constructor(public navCtrl: NavController, public navParams: NavParams, private eventProvider: EventProvider) {
  }

  ngOnInit() {
    this.isnewEvent = this.navParams.get('type') == 'new' ? true : false;
    if (!this.isnewEvent) {
      this.event = this.navParams.get('event');
    }
    else{
      this.event = new Event();
    }
  }

  ionViewDidLoad() {

  }

  onSubmit(f: NgForm) {
      this.event.name = f.value.name;
      this.event.recurring = f.value.recurring == null ? false : true;
      this.event.location = f.value.location;
      this.event.type = f.value.type;

      //optional 
      this.event.date = f.value.date ? f.value.date : '';
      this.event.time = f.value.time ? f.value.time : '';
      this.event.description = f.value.description ? f.value.description : '';
   
    if (this.isnewEvent) {
      this.eventProvider.addEvent(this.event);
    }
    else{
      this.eventProvider.updateEvent(this.event);
    }



    this.navCtrl.pop();

  }

}
