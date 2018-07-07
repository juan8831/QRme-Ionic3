import { Component, OnInit } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController, ActionSheetController } from 'ionic-angular';
import { Event } from '../../models/event';
import { SelectedEventProvider } from '../../providers/selected-event/selected-event';
import { EventProvider } from '../../providers/event/event';


@IonicPage()
@Component({
  selector: 'page-event-attendance',
  templateUrl: 'event-attendance.html',
})
export class EventAttendancePage implements OnInit {

  event: Event;
  eventDate: Date;
  markedAttendance = true;
  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    private selectedEventProvider: SelectedEventProvider,
    private viewCtrl: ViewController,
    private eventProvider: EventProvider,
    private actionSheetCtrl: ActionSheetController

  ) {
    this.event = this.selectedEventProvider.getEvent();
  }

  ngOnInit() {
    this.eventDate = this.eventProvider.getNextEventDate(this.event);
    this.eventProvider.getAttendanceRecordByEventAndDateAndUser(this.event, this.eventDate, undefined).subscribe(record => {
      if(record){
        this.markedAttendance = true;
      }
      else{
        this.markedAttendance = false;
      }
    })
  }

  onGoToEvent() {
    this.viewCtrl.dismiss();

  }

  recordAttendance() {

    let canMarkAttendance = true;
    //this.event.canMarkAttendance

    let buttons = [
      {
        text: 'Scan QR Code',
        handler: () => {
          this.scanQrCode();
        }
      }
      , {
        text: 'Cancel',
        role: 'cancel',
      }
    ];

    if (canMarkAttendance) {
      let markAttendanceButton = {
        text: 'Mark Attendance',
        handler: () => {
          this.markAttendance();
        }
      };
      buttons.splice(1, 0, markAttendanceButton);
    }
    const actionSheet = this.actionSheetCtrl.create({
      title: "Attendance: " +  this.eventDate.toLocaleDateString(),
      buttons: buttons
    });
    actionSheet.present();

  }

  markAttendance() {
    this.eventProvider.addAttendanceRecord(this.event, this.eventDate, undefined)
    .then(_=> {
      console.log('success');
    })
    .catch(err => {
      console.log(err);
    })

  }

  scanQrCode() {

  }

}
