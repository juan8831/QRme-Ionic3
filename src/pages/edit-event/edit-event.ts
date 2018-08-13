import { Component, OnInit } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController, AlertController, LoadingController } from 'ionic-angular';
import { Event, RepeatType } from '../../models/event';
import { NgForm } from '@angular/forms';
import { EventProvider } from '../../providers/event/event';
import { AngularFireAuth } from 'angularfire2/auth';
import { UserProvider } from '../../providers/user/user';
import { MessagingProvider } from '../../providers/messaging/messaging';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { AngularFireStorage } from 'angularfire2/storage';
import { File, FileError, Entry } from '@ionic-native/file';
import { normalizeURL } from 'ionic-angular';
import { FirebaseApp } from 'angularfire2';
import { ErrorProvider } from '../../providers/error/error';
import { UploadTaskSnapshot } from '../../../node_modules/@firebase/storage-types';
import { PercentPipe } from '../../../node_modules/@angular/common';

const defaultEventImage = 'assets/imgs/calendar.png';

//used for creating and editing events
@IonicPage()
@Component({
  selector: 'page-edit-event',
  templateUrl: 'edit-event.html',
})
export class EditEventPage implements OnInit {

  event: Event = new Event();
  isnewEvent: boolean;
  eventImgBlob: Blob;
  uploadNewImage = false;
  setDefaultImage = false;
  isDefaultImage = true;
  pageName = 'EditEvent';
  repeatValues: string[] = [];

  repeatOptionsHelp = {
    title: 'Repeat',
    subTitle: 'If and how often the event repeats.'
  };

  beforeAttendanceHelp = {
    title: 'Attendance Before Event Start',
    subTitle: 'How long before event starts can invitees record their attendance. All day events start at 12:00AM.'
  };

  afterAttendanceHelp = {
    title: 'Attendance After Event Start',
    subTitle: 'How long after event starts can invitees record their attendance. All day events start at 12:00AM.'
  };

  typeOptionsHelp = {
    title: 'Type',
    subTitle: 'Public Events: Anyone can join. Private Events: Users must request an invite.'
  }

  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    private eventProvider: EventProvider,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController,
    private afAuth: AngularFireAuth,
    private userProvider: UserProvider,
    private loadingCtl: LoadingController,
    private mProv: MessagingProvider,
    private camera: Camera,
    private file: File,
    private firebase: FirebaseApp,
    private errorProvider: ErrorProvider,
    private percentPipe: PercentPipe

  ) {
    Object.keys(RepeatType).forEach(key => this.repeatValues.push(RepeatType[key]));

  }

  ngOnInit() {
    this.isnewEvent = this.navParams.get('type') == 'new' ? true : false;
    if (!this.isnewEvent) {
      let event: Event = this.navParams.get('event');
      this.eventProvider.getEvent(event.id).take(1).subscribe(event => {
        this.event = event;
        this.convertDatesToISO8601();
      });
    }
    else {
      this.event = new Event();
      this.event.eventImageUrl = defaultEventImage;
      this.event.endRepeat = 'Never';
      this.event.repeat = RepeatType.Never;
      this.event.isVisibleInPublicSearch = this.event.allowInviteePolls = this.event.allowInviteePosts = true;
      this.event.minutesAfterAttendance = this.event.minutesBeforeAttendance = 5;
    }


  }

  private convertDatesToISO8601() {
    if (this.event.starts instanceof Date) {
      this.event.starts = this.convertISO8601UTCtoLocalwZ(new Date(this.event.starts).toISOString());
    }
    if (this.event.ends instanceof Date) {
      this.event.ends = this.convertISO8601UTCtoLocalwZ(new Date(this.event.ends).toISOString());
    }
    if (this.event.endRepeatDate && this.event.endRepeatDate instanceof Date) {
        this.event.endRepeatDate = this.convertISO8601UTCtoLocalwZ(new Date(this.event.endRepeatDate).toISOString());
    }
  }

  ngOnDestroy(): void {
    this.camera.cleanup();
  }

  /* Convert a BOGUS ISO 8601 Local date string (with a Z) to a real ISO 8601 UTC date string.
   * localDateString should be of format:  YYYY-MM-DDTHH-mm-ss.sssZ
   */
  convertISO8601LocalwZtoUTC(localDateString: string): string {
    const ISO_8601_UTC_REGEXP = /^(\d{4})(-\d{2})(-\d{2})T(\d{2})(\:\d{2}(\:\d{2}(\.\d{3})?)?)?Z$/;
    if(!localDateString.endsWith('Z')){
      localDateString += "T00:00:00.000Z";
    }
    try {
      if (localDateString.match(ISO_8601_UTC_REGEXP)) {
        let utcDateString: string;
        let localDate: Date = new Date(localDateString);
        let tzOffset: number = new Date().getTimezoneOffset() * 60 * 1000;
        let newTime: number = localDate.getTime() + tzOffset;
        let utcDate: Date = new Date(newTime);
        utcDateString = utcDate.toJSON()
        return utcDateString;
      } else {
        // throw 'Incorrect BOGUS local ISO8601 date string';
      }
    }
    catch (err) {
      alert('Date string is formatted incorrectly: \n' + err);
    }
  }

  /* Convert a real ISO 8601 UTC date stringto a BOGUS ISO 8601 local date string (with a Z).
  * utcDateString should be of format:  YYYY-MM-DDTHH-mm-ss.sssZ
  */
  convertISO8601UTCtoLocalwZ(utcDateString: string): string {
    const ISO_8601_UTC_REGEXP = /^(\d{4})(-\d{2})(-\d{2})T(\d{2})(\:\d{2}(\:\d{2}(\.\d{3})?)?)?Z$/;
    try {
      if (utcDateString.match(ISO_8601_UTC_REGEXP)) {
        let localDateString: string;
        let utcDate: Date = new Date(utcDateString);
        let tzOffset: number = new Date().getTimezoneOffset() * 60 * 1000;
        let newTime: number = utcDate.getTime() - tzOffset;
        let localDate: Date = new Date(newTime);
        localDateString = localDate.toJSON()
        return localDateString;
      } else {
        //throw 'Incorrect UTC ISO8601 date string';
      }
    }
    catch (err) {
      alert('Date string is formatted incorrectly: \n' + err);
    }
  }

  /*
  Convert to Date object, set time to 0, and convert back to ISO8601
  */
  resetTime(date){
    let convertedDate = (date instanceof Date) ? date : new Date(this.convertISO8601LocalwZtoUTC(date));
    convertedDate.setHours(0, 0, 0, 0);
    return this.convertISO8601UTCtoLocalwZ(convertedDate.toISOString());
  }

  /*
  We use ionic date time which returns ISO8601 Date string. We store dates in DB as Javascript Date objects. 
  On page load, we need to convert Date object => ISO8601
  On submit, we need to convert ISO8601 => Date object. Need to keep dates as ISO8601 until they have passed all checks
  */
  async onSubmit(f: NgForm) {
    this.event.name = f.value.name;
    this.event.description = f.value.description ? f.value.description : '';
    this.event.location = f.value.location ? f.value.location : '';
    this.event.category = f.value.category;
    this.event.type = f.value.type;
    this.event.isVisibleInPublicSearch = f.value.isVisibleInPublicSearch ? f.value.isVisibleInPublicSearch : false;
    this.event.allowInviteePosts = f.value.allowInviteePosts ? f.value.allowInviteePosts : false;
    this.event.allowInviteePolls = f.value.allowInviteePolls ? f.value.allowInviteePolls : false;

    this.event.allDay = f.value.allDay ? f.value.allDay : false;
    this.event.repeat = f.value.repeat;

    this.event.allowManualAttendance = f.value.allowManualAttendance ? f.value.allowManualAttendance : false;
    this.event.minutesAfterAttendance = parseInt(f.value.minutesAfterAttendance)
    this.event.minutesBeforeAttendance = parseInt(f.value.minutesBeforeAttendance);
    
    if (this.event.allDay) {
      f.value.starts = this.resetTime(f.value.starts);
      f.value.ends = this.resetTime(f.value.ends);
      if (f.value.endRepeatDate) {
        f.value.endRepeatDate = this.resetTime(f.value.endRepeatDate);
      }
    }

    if (!(f.value.starts instanceof Date)) {
      this.event.starts = new Date(this.convertISO8601LocalwZtoUTC(f.value.starts));
    }
    if (!(f.value.ends instanceof Date)) {
      this.event.ends = new Date(this.convertISO8601LocalwZtoUTC(f.value.ends));
    }
    if (f.value.endRepeatDate && !(f.value.endRepeatDate instanceof Date)) {
      this.event.endRepeatDate = new Date(this.convertISO8601LocalwZtoUTC(f.value.endRepeatDate));
    }

    //check dates are valid
    if (this.event.starts > this.event.ends) {
      this.mProv.showAlertOkMessage('Error', 'Start Date must be before End Date.');
      return;
    }

    if (this.event.repeat != RepeatType.Never && this.event.endRepeat != RepeatType.Never
      && (this.event.endRepeatDate < this.event.starts || this.event.endRepeatDate < this.event.ends)) {
      this.mProv.showAlertOkMessage('Error', 'End Repeat Date cannot be before Start Date or End Date.');
      return;
    }

    if (this.isnewEvent) {
      await this.createNewEvent();
    }
    else {
      await this.updateEvent();
    }

  }

  private async updateEvent() {
    if (this.uploadNewImage) {
      try {
        let result = await this.uploadPicture(this.event.id);
        if (result != null) {
          this.event.eventImageUrl = result.downloadURL;
        }
        else {
          this.mProv.showAlertOkMessage('Error', 'Could not upload event image. Please try again later.');
        }
      }
      catch (err) {
        this.mProv.showAlertOkMessage('Error', 'Could not upload event image. Please try again later.');
        console.log('Upload error:' + err);
        this.event.eventImageUrl = this.eventProvider.defaultEventImage;
        ;
      }
    }
    if (this.setDefaultImage) {
      if (this.event.eventImageUrl != defaultEventImage) {
        this.deleteEventImage();
      }
      this.event.eventImageUrl = this.eventProvider.defaultEventImage;
      ;
    }
    if (this.event.eventImageUrl == "" || this.event.eventImageUrl == null) {
      this.event.eventImageUrl = this.eventProvider.defaultEventImage;
    }
    this.eventProvider.updateEvent(this.event)
      .then(_ => {
        this.mProv.showToastMessage('Event successfully updated!');
        this.navCtrl.pop();
      })
      .catch(err => {
        this.mProv.showAlertOkMessage('Error', 'Could not update event. Please try again.');
        this.errorProvider.reportError(this.pageName, err, this.event.id, 'Could not update event');
      });
  }

  private async createNewEvent() {
    let loader = this.loadingCtl.create({ spinner: 'dots', content: 'Creating new event...' });
    loader.present();
    this.event.creatorEmail = this.afAuth.auth.currentUser.email;
    this.event.creatorName = this.userProvider.userProfile.name;
    this.event.creatorId = this.afAuth.auth.currentUser.uid;
    let newEventRef = this.firebase.firestore().collection('events').doc();
    let eventId = newEventRef.id;
    if (this.uploadNewImage) {
      try {
        let result = await this.uploadPicture(eventId);
        if (result != null) {
          this.event.eventImageUrl = result.downloadURL;
        }
        else {
          this.mProv.showAlertOkMessage('Error', 'Could not upload event image. Please try again later.');
        }
      }
      catch (err) {
        loader.dismiss();
        this.mProv.showAlertOkMessage('Error', 'Could not upload event image');
        console.log('Upload error:' + err);
        this.event.eventImageUrl = defaultEventImage;
      }
    }
    else {
      this.event.eventImageUrl = defaultEventImage;
    }
    this.eventProvider.CreateNewEventAndSynchronizeWithUser(this.event, newEventRef)
      .then(_ => {
        loader.dismiss();
        this.mProv.showToastMessage('You have created a new event!');
        this.navCtrl.pop();
      })
      .catch(err => {
        loader.dismiss();
        this.errorProvider.reportError(this.pageName, err, this.event.id, 'Could not create event');
        this.mProv.showAlertOkMessage('Error', 'Could not create event. Please try again.');
      });
  }

  //delete event from each user's list (admin & invitee) (cloud function)
  //delete event (local) && users subcollection (cloud function)
  deleteEvent() {
    this.eventProvider.deleteEvent(this.event)
      .then(_ => {
        this.navCtrl.popToRoot();
      })
      .catch(err => {
        this.mProv.showAlertOkMessage('Error', 'Could not delete event. Please try again later');
        this.errorProvider.reportError(this.pageName, err, this.event.id, 'Could not delete event');
      })
  }

  showConfirm() {
    let confirm = this.alertCtrl.create({
      title: 'Delete?',
      message: 'Are you sure you want to delete this event?',
      buttons: [
        {
          text: 'Yes',
          handler: () => {
            this.deleteEvent();
          }
        },
        {
          text: 'No',
        }
      ]
    });
    confirm.present();
  }

  takePicture(source: number) {
    const options: CameraOptions = {
      encodingType: this.camera.EncodingType.JPEG,
      correctOrientation: true,
      destinationType: this.camera.DestinationType.FILE_URI,
      mediaType: this.camera.MediaType.PICTURE,
      quality: 20,
      sourceType: source
    };
    this.camera.cleanup();
    this.camera.getPicture(options)
      .then(imageData => {
        this.setDefaultImage = false;
        this.isDefaultImage = false;
        this.uploadNewImage = true;
        this.setImageBlob(imageData);
      })
      .catch(err => {
        this.errorProvider.reportError(this.pageName, err, this.event.id, 'Could not take picture');
        if (err != 'No Image Selected') {
          this.mProv.showAlertOkMessage('Error', 'Could not take picture. Please try again.');
        }
      });

  }

  private uploadPicture(eventId: string) {
    console.log('Upload attempting to upload with eventId: ' + eventId);
    let loader = this.mProv.getLoader(`Uploading event picture...`, 0);
    loader.present();
    let progress = 0;
    if (eventId) {
      let task = this.firebase.storage().ref().child(`eventPictures/${eventId}`).put(this.eventImgBlob);
      if (task != null) {
        task.on('state_changed', (snapshot: UploadTaskSnapshot) => {
          progress = (snapshot.bytesTransferred / snapshot.totalBytes);
          loader.setContent(`Progress: ${this.percentPipe.transform(progress)}`);
          if (progress >= 1) {
            loader.dismiss();
          }
        })
        task.catch(err => {
          loader.dismiss();
          this.errorProvider.reportError(this.pageName, err, this.event.id, 'Could not upload image');
          this.mProv.showAlertOkMessage('Error', 'Could not upload event image. Please try again later.');
        })
        return task;
      }
    }
    else {
      return null;
    }
  }

  setImageBlob(imageData) {

    let currentName : string = imageData.replace(/^.*[\\\/]/, '');
    //console.log(`ImageDate name: ${currentName}`);
    let index = currentName.indexOf('?');
    if(index != -1){
      currentName = currentName.substring(0, index);
    }
    //console.log(`ImageDate name: ${currentName}`);
    const path = imageData.replace(/[^\/]*$/, '');
    const newFileName = new Date().getUTCMilliseconds() + '.jpg';
    //console.log(`New File Name: ${newFileName}`);
    this.file.moveFile(path, currentName, this.file.dataDirectory, newFileName)
      .then(
        (data: Entry) => {
          this.event.eventImageUrl = normalizeURL(data.nativeURL);
          this.file.readAsArrayBuffer(this.file.dataDirectory, newFileName).then(buffer => {
            console.log('Finished read as array');
            this.file.removeFile(this.file.dataDirectory, newFileName)
            .then(_=> console.log('Deleted image file'))
            .catch(_=> console.log('Could not delete image file'));

            this.eventImgBlob = new Blob([buffer], { type: "image/jpeg" });
          });
        }
      )
      .catch(
        (err: FileError) => {
          const toast = this.toastCtrl.create({
            message: 'Could not save the image. Please try again',
            duration: 2500
          });
          console.log(`File moving error: ` + err.message);
          toast.present();
          this.errorProvider.reportError(this.pageName, err.message, this.event.id, 'Could not move image');
          this.camera.cleanup();
        }
      );

  }

  setEventPicture() {


    let chooseLibraryButton = {
      text: 'Choose from Library...',
      handler: () => {
        this.takePicture(this.camera.PictureSourceType.PHOTOLIBRARY);
      }
    };

    let takePhotoButton =
    {
      text: 'Take Photo...',
      handler: () => {
        this.takePicture(this.camera.PictureSourceType.CAMERA)
      }
    };

    let deleteCurrentPhotoButton = {
      text: 'Delete current image...',
      handler: () => {
        this.event.eventImageUrl = defaultEventImage;
        this.setDefaultImage = true;
      }
    };

    let cancelButton = {
      text: 'Cancel',
      role: 'cancel'
    };

    var buttons = [chooseLibraryButton, takePhotoButton, cancelButton]

    if (this.event.eventImageUrl != defaultEventImage) {
      buttons.splice(2, 0, deleteCurrentPhotoButton);
    }

    const confirm = this.alertCtrl.create({
      title: 'Change Event Picture',
      buttons: buttons
    });
    confirm.present();
  }

  deleteEventImage() {
    this.firebase.storage().ref().child(`eventPictures/${this.event.id}`).delete()
      .then(() => {
      })
      .catch(err => {
        this.mProv.showAlertOkMessage('Error', 'Could not delete event image.');
        this.errorProvider.reportError(this.pageName, err, this.event.id, 'Could not delete image');
      })
  }

  openRepeatHelp() {
    this.mProv.showAlertOkMessage('Repeat', 'Event will repeat based on selected interval');
  }

}
