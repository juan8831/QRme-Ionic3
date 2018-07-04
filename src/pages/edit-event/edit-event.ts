import { Component, OnInit } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController, AlertController, LoadingController } from 'ionic-angular';
import { Event } from '../../models/event';
import { Form, NgForm } from '@angular/forms';
import { EventProvider } from '../../providers/event/event';
import { AngularFireAuth } from 'angularfire2/auth';
import { UserProvider } from '../../providers/user/user';
import { User } from '../../models/user';
import { MessagingProvider } from '../../providers/messaging/messaging';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { AngularFireStorage } from 'angularfire2/storage';
import { File, FileReader, FileError, Entry } from '@ionic-native/file';
import { normalizeURL } from 'ionic-angular';
import { Observable } from 'rxjs';
import { of } from 'rxjs/observable/of';
import { FirebaseApp } from 'angularfire2';

declare var window: any;

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
    private storage: AngularFireStorage,
    private file: File,
    private firebase: FirebaseApp

  ) {
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
        .catch(err => {

          this.imageURL = defaultEventImage;

        })
    }
    else {
      this.event = new Event();
      this.imageURL = defaultEventImage;
    }


  }

  ngOnDestroy(): void {
    this.camera.cleanup();

  }

  ionViewDidLoad() {


  }

  async onSubmit(f: NgForm) {

    
    this.event.name = f.value.name;
    this.event.recurring = f.value.recurring ? f.value.recurring : false;
    this.event.location = f.value.location;
    this.event.type = f.value.type;
    this.event.category = f.value.category;
    this.event.isVisibleInPublicSearch = f.value.isVisibleInPublicSearch ? f.value.isVisibleInPublicSearch : false;;

    //optional 
    this.event.date = f.value.date ? f.value.date : '';
    this.event.time = f.value.time ? f.value.time : '';
    this.event.description = f.value.description ? f.value.description : '';

    if (this.isnewEvent) {
      let loader = this.loadingCtl.create({ spinner: 'dots', content: 'Creating new event...' });
      loader.present();
      this.event.creator = this.afAuth.auth.currentUser.email;
      this.event.creatorName = this.userProvider.userProfile.name;
      let newEventRef = this.firebase.firestore().collection('events').doc();
      let eventId = newEventRef.id;
      console.log('new event id:' + eventId);

      if (this.uploadNewImage) {
        try {
          let loader = this.mProv.getLoader('Uploading event picture...');
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
          console.log(err);
          loader.dismiss();
          this.mProv.showAlertOkMessage('Error', 'Could not create event. Plase try again.');
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
          this.mProv.showAlertOkMessage('Error', 'Could not upload event image');
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
      
      if(this.event.eventImageUrl == "" || this.event.eventImageUrl == null)
      {
        this.event.eventImageUrl = this.eventProvider.defaultEventImage;
      }

      this.eventProvider.updateEvent(this.event)
        .then(_ => {
        })
        .catch(err => {
          this.mProv.showAlertOkMessage('Error', 'Could not update event. Plase try again.')
        });
      this.navCtrl.pop();
    }





  }

  //delete event from each user's list (admin & invitee)
  //delete event && users subcollection 

  deleteEvent() {

    // await Promise.all(Object.keys(this.event.adminList).map(async (userId) => {
    //   await this.userProvider.deleteEventForUser(userId, this.event.id).toPromise();
    //   console.log('deleted for user');
    // }));

    this.eventProvider.deleteEvent(this.event)
      .then(_ => {
        this.deleteEventImage();
        this.toastCtrl.create({
          message: 'Event successfully deleted',
          duration: 3000
        }).present();
        this.navCtrl.popToRoot();
      });
    //todo invitee list delete

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
        console.log('Error: ' + err);
        if(err != 'No Image Selected'){
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
          //this.imageURL = of('');
          const toast = this.toastCtrl.create({
            message: 'Could not save the image. Please try again',
            duration: 2500
          });
          toast.present();
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
      .then(result => {
        //this.imageURL = of(result);
      })
      .catch(err => {
        this.mProv.showAlertOkMessage('Error', 'Could not delete event image.');
        console.log('err');
        //this.imageURL = of(defaultEventImage);

      })
  }

}
