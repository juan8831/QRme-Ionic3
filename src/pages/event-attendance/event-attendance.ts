import { Component, OnInit } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController, ActionSheetController } from 'ionic-angular';
import { Event } from '../../models/event';
import { SelectedEventProvider } from '../../providers/selected-event/selected-event';
import { EventProvider } from '../../providers/event/event';
import { InviteeAttendanceRecordPage } from '../invitee-attendance-record/invitee-attendance-record';
import { MessagingProvider } from '../../providers/messaging/messaging';
import { BarcodeScanner } from '@ionic-native/barcode-scanner';

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
    private actionSheetCtrl: ActionSheetController,
    private barcodeScanner: BarcodeScanner,
    private mProv: MessagingProvider

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
      this.mProv.showToastMessage('Attendance successfully recorded!')
    })
    .catch(err => {
      this.mProv.showAlertOkMessage('Error', 'Could not record attendance. Please ty again later.');
      console.log(err);
    })

  }

  openAttendanceRecord(){
    this.navCtrl.push(InviteeAttendanceRecordPage, {'event': this.event});
  }

  private scanQrCode() {
    var loader = this.mProv.getLoader('Loading...');
    loader.present();
    this.barcodeScanner.scan({ disableSuccessBeep: true })
            .then(barcodeData => {
              loader.dismiss();
              console.log('scanned!');
              if(!barcodeData.cancelled){
                //var eventLoader = this.mProv.getLoader('Getting event information...');
                //eventLoader.present();
                if(this.event.id != barcodeData.text){
                  this.mProv.showAlertOkMessage('Error', 'This QR code does not belong to this event.');
                }
                else{
                  this.markAttendance();
                }
              }
            })
            .catch(err => {
              loader.dismiss();
              console.log(err);
              if(err == 'Access to the camera has been prohibited; please enable it in the Settings app to continue.'){
                this.mProv.showAlertOkMessage('Error', err);
                //todo open only if user wants to change settings
                //this.qrScanner.openSettings();
              }
              this.mProv.showAlertOkMessage('Error', 'Could not scan QR Code');
            });
      loader.dismiss();        

  }

}
