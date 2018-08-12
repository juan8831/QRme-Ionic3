import { Component, OnInit } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController, ActionSheetController } from 'ionic-angular';
import { Event } from '../../models/event';
import { EventProvider } from '../../providers/event/event';
import { InviteeAttendanceRecordPage } from '../invitee-attendance-record/invitee-attendance-record';
import { MessagingProvider } from '../../providers/messaging/messaging';
import { BarcodeScanner } from '@ionic-native/barcode-scanner';
import { ErrorProvider } from '../../providers/error/error';
import { ISubscription } from '../../../node_modules/rxjs/Subscription';

@IonicPage()
@Component({
  selector: 'page-event-attendance',
  templateUrl: 'event-attendance.html',
})
export class EventAttendancePage implements OnInit {

  event: Event;
  eventDate: Date;
  markedAttendance = true;
  pageName = 'EventAttendancePage';
  selectedDate: Date;
  toDate: string;
  fromDate: string;
  eventDates: Date[] = [];
  loadAttendance = false;
  subscriptions: ISubscription[] = [];
  attendanceSubs : ISubscription;

  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    private viewCtrl: ViewController,
    private eventProvider: EventProvider,
    private actionSheetCtrl: ActionSheetController,
    private barcodeScanner: BarcodeScanner,
    private mProv: MessagingProvider,
    private errorProvider: ErrorProvider

  ) {
    this.event = this.navParams.get('event');
  }

  ngOnInit() {
    let subs = this.eventProvider.getEvent(this.event.id).subscribe(event => {
      if (!event) {
        this.mProv.showAlertOkMessage('Event Delete', 'This event has been deleted.');
        return;
      }
      this.event = event;
      let today = new Date();
      //if starts date is earlier than current date, then use starts date instead of current date
      today = today > this.event.starts ? this.event.starts : today;
      let twoWeeksFromToday = this.eventProvider.addDays(today, 14);
      this.fromDate = this.eventProvider.convertISO8601UTCtoBogusLocalwZ(today.toISOString());
      this.toDate = this.eventProvider.convertISO8601UTCtoBogusLocalwZ(twoWeeksFromToday.toISOString());
      this.changeDate();
    });
    this.subscriptions.push(subs);
  }

  ngOnDestroy(): void {
    this.subscriptions.map(subscription => subscription.unsubscribe());
  }

  onGoToEvent() {
    this.viewCtrl.dismiss();

  }

  selectChange() {
    this.loadAttendance = false;
  }

  recordAttendance() {
    let canMarkAttendance = this.event.allowManualAttendance;
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
      title: "Attendance: " + this.eventDate.toLocaleDateString(),
      buttons: buttons
    });
    actionSheet.present();

  }

  markAttendance() {
    if (!this.canMarkAttendance()) {
      return;
    }
    this.eventProvider.addAttendanceRecord(this.event, this.eventDate, undefined)
      .then(_ => {
        this.mProv.showToastMessage('Attendance successfully recorded!')
      })
      .catch(err => {
        this.mProv.showAlertOkMessage('Error', 'Could not record attendance. Please ty again later.');
        this.errorProvider.reportError(this.pageName, err, this.event.id, 'Could not record attendance');
      })

  }

  canMarkAttendance() {
    let earliestDate = this.eventProvider.addMinutes(this.eventDate, -this.event.minutesBeforeAttendance);
    let latestDate = this.eventProvider.addMinutes(this.eventDate, this.event.minutesAfterAttendance);
    let now = new Date();

    if (now < earliestDate) {
      this.mProv.showAlertOkMessage('Too early', 'You cannot mark your attendance yet.');
      return false;
    }
    if (now > latestDate) {
      this.mProv.showAlertOkMessage('Too late', 'The time to mark your attendance has expired.');
      return false;
    }

    return true;
  }

  changeDate() {
    let fromDate = new Date(this.eventProvider.convertBogusISO8601LocalwZtoRealUTC(this.fromDate));
    let toDate = new Date(this.eventProvider.convertBogusISO8601LocalwZtoRealUTC(this.toDate));

    if (this.event.allDay) {
      fromDate = this.eventProvider.getDateWithoutTime(fromDate);
      toDate = this.eventProvider.getDateWithoutTime(toDate);
    }

    this.eventDates = this.eventProvider.getEventDates(this.event, fromDate, toDate);
    this.selectedDate = this.selectedDate = this.eventProvider.getNextEventDate(this.event);
  }

  searchDate() {
    if (this.selectedDate != null) {
      this.selectedDate = this.event.allDay ? this.eventProvider.getDateWithoutTime(this.selectedDate) : this.selectedDate;
      this.eventDate = this.selectedDate;
      if(this.attendanceSubs){
        this.attendanceSubs.unsubscribe();
      }
      this.attendanceSubs = this.eventProvider.getAttendanceRecordByEventAndDateAndUser(this.event, this.eventDate, undefined)
      .subscribe(record => {
        if (record) {
          this.markedAttendance = true;
        }
        else {
          this.markedAttendance = false;
        }
        this.loadAttendance = true
      });
      this.subscriptions.push(this.attendanceSubs);
    }
  }

  openAttendanceRecord() {
    this.navCtrl.push(InviteeAttendanceRecordPage, { 'event': this.event });
  }

  private scanQrCode() {
    var loader = this.mProv.getLoader('Loading...');
    loader.present();
    this.barcodeScanner.scan({ disableSuccessBeep: true })
      .then(barcodeData => {
        loader.dismiss();
        if (!barcodeData.cancelled) {
          //var eventLoader = this.mProv.getLoader('Getting event information...');
          //eventLoader.present();
          if (this.event.id != barcodeData.text) {
            this.mProv.showAlertOkMessage('Error', 'This QR code does not belong to this event.');
          }
          else {
            this.markAttendance();
          }
        }
      })
      .catch(err => {
        loader.dismiss();
        this.errorProvider.reportError(this.pageName, err, this.event.id, 'Could not scan qr code');
        if (err == 'Access to the camera has been prohibited; please enable it in the Settings app to continue.') {
          this.mProv.showAlertOkMessage('Error', err);
          //todo open only if user wants to change settings
          //this.qrScanner.openSettings();
        }
        this.mProv.showAlertOkMessage('Error', 'Could not scan QR Code');
      });
    loader.dismiss();

  }

}
