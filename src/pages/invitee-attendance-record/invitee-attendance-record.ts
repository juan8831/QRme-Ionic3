import { Component, OnInit } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { Event } from '../../models/event';
import { AttendanceRecord } from '../../models/attendance';
import { EventProvider } from '../../providers/event/event';

/**
 * Generated class for the InviteeAttendanceRecordPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-invitee-attendance-record',
  templateUrl: 'invitee-attendance-record.html',
})
export class InviteeAttendanceRecordPage implements OnInit {

  event: Event;
  records: AttendanceRecord [] = [];
  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    private eventProvider: EventProvider
  ) {
  }

  ngOnInit(){
    this.event = this.navParams.get('event');
    this.eventProvider.getAttendanceRecordsByEventAndUser(this.event, undefined).subscribe(records => {
      this.records = records;
    })
  }
}
