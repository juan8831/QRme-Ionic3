import { Component, OnInit } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { EventProvider } from '../../providers/event/event';
import { Event } from '../../models/event';
import { EventAttendanceInstanceAdminPage } from '../event-attendance-instance-admin/event-attendance-instance-admin';

@IonicPage()
@Component({
  selector: 'page-event-attendance-admin',
  templateUrl: 'event-attendance-admin.html',
})
export class EventAttendanceAdminPage implements OnInit {

  event: Event
  selectedDate: Date;
  toDate: string;
  fromDate: string;
  eventDates: Date[] = [];

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    private eventProvider: EventProvider
  ) {
  }

  ngOnInit(){
    this.event = this.navParams.get('event');
    let today = new Date();

    //if starts date is earlier than current date, then use starts date instead of current date
    today = today > this.event.starts ? this.event.starts : today;

    let twoWeeksFromToday = this.eventProvider.addDays(today, 14);
    this.fromDate = this.eventProvider.convertISO8601UTCtoBogusLocalwZ(today.toISOString());
    this.toDate = this.eventProvider.convertISO8601UTCtoBogusLocalwZ(twoWeeksFromToday.toISOString());
    this.changeDate();
  }

  changeDate(){
    let fromDate = new Date(this.eventProvider.convertBogusISO8601LocalwZtoRealUTC(this.fromDate));
    let toDate = new Date(this.eventProvider.convertBogusISO8601LocalwZtoRealUTC(this.toDate));

    if(this.event.allDay){
      fromDate = this.eventProvider.getDateWithoutTime(fromDate);
      toDate = this.eventProvider.getDateWithoutTime(toDate);
    }

    this.eventDates = this.eventProvider.getEventDates(this.event, fromDate, toDate);
    this.selectedDate =  null;//this.eventDates.length > 0 ? this.eventDates[0] : null;
  }

  searchDate(){
    if(this.selectedDate != null){
      this.selectedDate = this.event.allDay ? this.eventProvider.getDateWithoutTime(this.selectedDate) : this.selectedDate;
      this.navCtrl.push(EventAttendanceInstanceAdminPage, {'event' : this.event, 'selectedDate' : this.selectedDate});
    }
  }

  



}
