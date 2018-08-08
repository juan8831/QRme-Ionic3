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

const defaultEventImage = 'assets/imgs/calendar.png';

//used for creating and editing events
@IonicPage()
@Component({
  selector: 'page-edit-event',
  templateUrl: 'edit-event.html',
})
export class EditEventPage implements OnInit {

  event: Event;
  isnewEvent: boolean;
  eventImgBlob: Blob;
  imageURL: string;
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
    title: 'Allow Attendance Before Event Start',
    subTitle: 'How long before event starts can invitees record their attendance.'
  };

  afterAttendanceHelp = {
    title: 'Allow Attendance After Event Start',
    subTitle: 'How long after event starts can invitees record their attendance.'
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
    private errorProvider: ErrorProvider

  ) {
    Object.keys(RepeatType).forEach(key => this.repeatValues.push(RepeatType[key]));

  }

  ngOnInit() {
    this.isnewEvent = this.navParams.get('type') == 'new' ? true : false;
    if (!this.isnewEvent) {
      this.event = this.navParams.get('event');
      // const ref = this.storage.ref(`eventPictures/${this.event.id}`);
      // this.imageURL = ref.getDownloadURL();

      this.firebase.storage().ref().child(`eventPictures/${this.event.id}`).getDownloadURL()
        .then(result => {
          this.imageURL = result;
        })
        .catch(() => {
            this.imageURL = defaultEventImage;
          })

        this.event.starts = this.convertISO8601UTCtoLocalwZ(new Date(this.event.starts).toISOString());
        this.event.ends = this.convertISO8601UTCtoLocalwZ(new Date(this.event.ends).toISOString());

        if(this.event.endRepeatDate && this.event.endRepeatDate != ''){
          this.event.endRepeatDate = this.convertISO8601UTCtoLocalwZ(new Date(this.event.endRepeatDate).toISOString());
        }

     // this.event.starts = 
    }
    else {
      this.event = new Event();
      this.imageURL = defaultEventImage;
      this.event.endRepeat = 'Never';
      this.event.repeat = RepeatType.Never;
      this.event.isVisibleInPublicSearch = this.event.allowInviteePolls = this.event.allowInviteePosts = true;
      this.event.minutesAfterAttendance = this.event.minutesBeforeAttendance = 5;
    }


  }

  ngOnDestroy(): void {
    this.camera.cleanup();

  }

  ionViewDidLoad() {


  }

  /* Convert a BOGUS ISO 8601 Local date string (with a Z) to a real ISO 8601 UTC date string.
   * localDateString should be of format:  YYYY-MM-DDTHH-mm-ss.sssZ
   */
  convertISO8601LocalwZtoUTC(localDateString: string): string {
    const ISO_8601_UTC_REGEXP = /^(\d{4})(-\d{2})(-\d{2})T(\d{2})(\:\d{2}(\:\d{2}(\.\d{3})?)?)?Z$/;
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
    catch(err) {
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
    catch(err) {
      alert('Date string is formatted incorrectly: \n' + err);
    }
  }

  async onSubmit(f: NgForm) {

    this.event.name = f.value.name;
    this.event.location = f.value.location;
    this.event.type = f.value.type;
    this.event.category = f.value.category;
    this.event.isVisibleInPublicSearch = f.value.isVisibleInPublicSearch ? f.value.isVisibleInPublicSearch : false;
    this.event.repeat = f.value.repeat;
    this.event.allowManualAttendance = f.value.allowManualAttendance ? f.value.allowManualAttendance : false;
    this.event.minutesAfterAttendance = parseInt(f.value.minutesAfterAttendance)
    this.event.minutesBeforeAttendance = parseInt(f.value.minutesBeforeAttendance);
    this.event.allowInviteePosts = f.value.allowInviteePosts ? f.value.allowInviteePosts : false;
    this.event.allowInviteePolls = f.value.allowInviteePolls ? f.value.allowInviteePolls : false;

    if(this.event.allDay){
      if(this.isnewEvent){
        f.value.starts += "T00:00:00.000Z";
        f.value.ends += "T00:00:00.000Z";
      }
      let startDate = (f.value.starts instanceof Date) ? f.value.starts : new Date(this.convertISO8601LocalwZtoUTC(f.value.starts));
      startDate.setHours(0, 0, 0, 0);   
      f.value.starts = this.convertISO8601UTCtoLocalwZ(startDate.toISOString());

      let endDate = (f.value.ends instanceof Date) ? f.value.ends : new Date(this.convertISO8601LocalwZtoUTC(f.value.ends));
      endDate.setHours(0, 0, 0, 0);   
      f.value.ends = this.convertISO8601UTCtoLocalwZ(endDate.toISOString());
      
    }

    if (this.event.repeat != RepeatType.Never && this.event.endRepeat != RepeatType.Never  
      && (f.value.endRepeatDate < f.value.starts || f.value.endRepeatDate < f.value.ends)) {
      this.mProv.showAlertOkMessage('Error', 'End Repeat Date cannot be before Start Date or End Date.');
      return;
    }

    if(!(f.value.starts instanceof Date)){
      this.event.starts = new Date(this.convertISO8601LocalwZtoUTC(f.value.starts));
    }
    if(!(f.value.ends instanceof Date)){
      this.event.ends = new Date(this.convertISO8601LocalwZtoUTC(f.value.ends));
    }

    if (this.event.starts  > this.event.ends ) {
      this.mProv.showAlertOkMessage('Error', 'Start Date must be before End Date.');
      return;
    }

    if (this.event.repeat != RepeatType.Never) {
      this.event.endRepeat = f.value.endRepeat;
      if (this.event.endRepeat != RepeatType.Never) {
        this.event.endRepeatDate = new Date(this.convertISO8601LocalwZtoUTC(f.value.endRepeatDate));
      }
    }

    if (this.event.allDay) {
      let startDate = new Date(this.event.starts);
      startDate.setHours(0, 0, 0, 0);
      let endDate = new Date(this.event.ends);
      endDate.setHours(0, 0, 0, 0);
      this.event.starts = startDate;
      this.event.ends = endDate;
    }


    //optional 
    //this.event.date = f.value.date ? f.value.date : '';
    //this.event.time = f.value.time ? f.value.time : '';
    this.event.description = f.value.description ? f.value.description : '';
    this.event.location = f.value.location ? f.value.location : '';

    if (this.isnewEvent) {
      let loader = this.loadingCtl.create({ spinner: 'dots', content: 'Creating new event...' });
      loader.present();
      this.event.creatorEmail = this.afAuth.auth.currentUser.email;
      this.event.creatorName = this.userProvider.userProfile.name;
      this.event.creatorId = this.afAuth.auth.currentUser.uid;
      let newEventRef = this.firebase.firestore().collection('events').doc();
      let eventId = newEventRef.id;

      if (this.uploadNewImage) {
        try {
          let loader = this.mProv.getLoader('Uploading event picture...', 0);
          loader.present();
          var result = await this.uploadPicture(this.event.id);
          this.event.eventImageUrl = result.downloadURL;
          loader.dismiss();
        }
        catch (err) {
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
    //.catch(err => console.log(err, 'You do not have access!'));

    // .then((data) => {
    //   console.log(data);
    //   this.userProvider.getUser(this.afAuth.auth.currentUser.email).subscribe(user => {
    //     var updateUser : User = user;
    //     console.log(data);
    //     //updateUser.eventAdminList.push(data);




    //     //this.userProvider.updateUser()
    //   });

    // });

    else {

      if (this.uploadNewImage) {

        try {
          let loader = this.mProv.getLoader('Uploading event picture...');
          loader.present();
          var result = await this.uploadPicture(this.event.id);
          loader.dismiss();
          this.event.eventImageUrl = result.downloadURL;
        }
        catch (err) {
          this.mProv.showAlertOkMessage('Error', 'Could not upload event image. Please try again');
          console.log('Upload error:' + err);
          this.event.eventImageUrl = this.eventProvider.defaultEventImage;;
        }
      }

      if (this.setDefaultImage) {
        if (this.event.eventImageUrl != defaultEventImage) {
          this.deleteEventImage();
        }
        this.event.eventImageUrl = this.eventProvider.defaultEventImage;;
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
          this.mProv.showAlertOkMessage('Error', 'Could not update event. Please try again.')
          this.errorProvider.reportError(this.pageName, err, this.event.id, 'Could not update event'); 
        });
    }





  }

  //delete event from each user's list (admin & invitee)
  //delete event && users subcollection 

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
    console.log(this.event.starts);

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
    return this.firebase.storage().ref().child(`eventPictures/${this.event.id}`).put(this.eventImgBlob);
  }

  setImageBlob(imageData) {

    const currentName = imageData.replace(/^.*[\\\/]/, '');
    console.log(currentName);
    const path = imageData.replace(/[^\/]*$/, '');
    const newFileName = new Date().getUTCMilliseconds() + '.jpg';
    this.file.moveFile(path, currentName, this.file.tempDirectory, newFileName)
      .then(
        (data: Entry) => {
          this.imageURL = normalizeURL(data.nativeURL);

          this.file.readAsArrayBuffer(this.file.tempDirectory, newFileName).then(buffer => {
            console.log('Finished read as array');
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
          toast.present();
          this.errorProvider.reportError(this.pageName, err.message, this.event.id, 'Could not save image'); 
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
        this.imageURL = defaultEventImage;
        this.setDefaultImage = true;
      }
    };

    let cancelButton = {
      text: 'Cancel',
      role: 'cancel',
      handler: () => {
        console.log('Agree clicked');
      }
    };

    var buttons = [chooseLibraryButton, takePhotoButton, cancelButton]

    if (this.imageURL != defaultEventImage) {
      buttons.splice(2, 0, deleteCurrentPhotoButton);
    }

    const confirm = this.alertCtrl.create({
      title: 'Change Event Picture',
      //message: 'Do you agree to use this lightsaber to do good across the intergalactic galaxy?',
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

  openRepeatHelp(){
    this.mProv.showAlertOkMessage('Repeat', 'Event will repeat based on selected interval');
  }

}
