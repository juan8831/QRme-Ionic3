import { Component, OnInit } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { Event } from '../../models/event';

@IonicPage()
@Component({
  selector: 'page-event-attendance-instance-admin',
  templateUrl: 'event-attendance-instance-admin.html',
})
export class EventAttendanceInstanceAdminPage implements OnInit {

  event: Event;
  selectedDate: Date;

  constructor(public navCtrl: NavController, public navParams: NavParams) {
  }

  ngOnInit(){
    this.event = this.navParams.get('event');
    this.selectedDate = this.navParams.get('selectedDate');

  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad EventAttendanceInstanceAdminPage');
  }

}
