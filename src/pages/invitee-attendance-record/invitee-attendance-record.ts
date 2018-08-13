import { Component, OnInit } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { Event } from '../../models/event';
import { AttendanceRecord } from '../../models/attendance';
import { EventProvider } from '../../providers/event/event';
import { ISubscription } from '../../../node_modules/rxjs/Subscription';

@IonicPage()
@Component({
  selector: 'page-invitee-attendance-record',
  templateUrl: 'invitee-attendance-record.html',
})
export class InviteeAttendanceRecordPage implements OnInit {

  event: Event;
  records: AttendanceRecord [] = [];
  subscriptions: ISubscription [] = [];
  
  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    private eventProvider: EventProvider
  ) {
  }

  ngOnInit(){
    this.event = this.navParams.get('event');
    let subs = this.eventProvider.getAttendanceRecordsByEventAndUser(this.event, undefined).subscribe(records => {
      this.records = records;
    });
    this.subscriptions.push(subs);
  }
  ngOnDestroy(): void {
    this.subscriptions.map(subscription => subscription.unsubscribe());
  }
}
