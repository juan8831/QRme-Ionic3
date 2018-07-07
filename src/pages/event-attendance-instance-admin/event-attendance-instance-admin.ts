import { Component, OnInit } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { Event } from '../../models/event';
import { EventProvider } from '../../providers/event/event';
import { AttendanceRecord } from '../../models/attendance';

@IonicPage()
@Component({
  selector: 'page-event-attendance-instance-admin',
  templateUrl: 'event-attendance-instance-admin.html',
})
export class EventAttendanceInstanceAdminPage implements OnInit {

  event: Event;
  selectedDate: Date;
  records: AttendanceRecord[] = [];

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    private eventProvider: EventProvider
  ) {
  }

  ngOnInit(){
    this.event = this.navParams.get('event');
    this.selectedDate = this.navParams.get('selectedDate');
    this.eventProvider.getAttendanceRecordsByEventAndDate(this.event, this.selectedDate).subscribe(records => {
      this.records = records;
    });



  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad EventAttendanceInstanceAdminPage');
  }

}
