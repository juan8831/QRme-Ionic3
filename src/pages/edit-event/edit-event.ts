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
  imageURL: Observable<string | null>;
  uploadNewImage = false;

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

      const ref = this.storage.ref(`eventPictures/${this.event.id}`);
      this.firebase.storage().ref().child(`eventPictures/${this.event.id}`).getDownloadURL()
        .then(result => {
          this.imageURL = of(result);
        })
        .catch(err => {

          this.imageURL = of('assets/imgs/calendar.png');

        })
    }
    else {
      this.event = new Event();
    }


  }

  ngOnDestroy(): void {
    this.camera.cleanup();

  }

  ionViewDidLoad() {


  }

  onSubmit(f: NgForm) {

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
      this.eventProvider.CreateNewEventAndSynchronizeWithUser(this.event, newEventRef)
        .then(_ => {
          loader.dismiss();
          if (this.uploadNewImage) {
            this.uploadPicture(eventId);
          }
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
      this.eventProvider.updateEvent(this.event)
        .then(_ => {
          if (this.uploadNewImage) {
            this.uploadPicture(this.event.id);
          }
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

        const ref = this.storage.ref(`eventPictures/${this.event.id}`);
        this.firebase.storage().ref().child(`eventPictures/${this.event.id}`).delete()
          .then(result => {
            //this.eventPictureUrl = of(result);
          })
          .catch(err => {
            console.log('Could not delete image: ' + err);

            // this.eventPictureUrl = of('assets/imgs/calendar.png');

          })


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

  // takePicture(){
  //   const options: CameraOptions = {
  //     encodingType: this.camera.EncodingType.JPEG,
  //     correctOrientation: true,
  //     destinationType: this.camera.DestinationType.DATA_URL,
  //     mediaType: this.camera.MediaType.PICTURE

  //   };
  //   this.camera.getPicture(options)
  //   .then(imageData => {
  //     let base64Image = 'data:image/jpeg;base64,' + imageData;
  //     const ref = this.storage.ref('eventPictures/testPic');
  //     const task = ref.putString(base64Image, 'data_url');
  //   })
  //   .catch(err => {
  //     console.log('Error: ' + err);
  //   });

  // }

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

        this.isDefaultImage = false;

        this.uploadNewImage = true;

        this.setImageBlob(imageData);
      })
      // window.resolveLocalFileSystemURL("file://"+imageData, FE=> {
      //   FE.file(file => {
      //     const FR = new FileReader();
      //     FR.onloadend = ((res: any) => {
      //       let AF = res.target.result;
      //       let blob = new Blob([new Uint8Array(AF)], {type: 'image/jpeg'});
      //       var task = this.storage.upload('eventPictures/testPic', imageData );
      //     });
      //     FR.readAsArrayBuffer(file); 
      //   })
      // });

      //let base64Image = 'data:image/jpeg;base64,' + imageData;
      //const ref = this.storage.ref('eventPictures/testPic');
      //console.log(imageData);
      //const task = 
      //const task = ref.putString(base64Image, 'data_url');
      .catch(err => {
        console.log('Error: ' + err);
        this.mProv.showAlertOkMessage('Error', 'Could not take picture. Please try again.');
      });

  }

  private uploadPicture(eventId: string) {
    console.log('Upload attempting to upload with eventId: ' + eventId);
    var task = this.storage.upload(`eventPictures/${eventId}`, this.eventImgBlob);
    task
      .then(_ => console.log('Finished upload'))
      .catch(err => {
        this.mProv.showAlertOkMessage('Error', 'Could not upload event image');
        console.log('Upload error:' + err);
      });
  }

  setImageBlob(imageData) {

    const currentName = imageData.replace(/^.*[\\\/]/, '');
    console.log(currentName);
    const path = imageData.replace(/[^\/]*$/, '');
    const newFileName = new Date().getUTCMilliseconds() + '.jpg';
    this.file.moveFile(path, currentName, this.file.tempDirectory, newFileName)
      .then(
        (data: Entry) => {
          this.imageURL = of(normalizeURL(data.nativeURL));

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



    // this.file.resolveLocalFilesystemUrl(imageData).then(result => {

    //   let dirPath = result.nativeURL;
    //   let dirPathSegments = dirPath.split('/');
    //   dirPathSegments.pop();
    //   dirPath = dirPathSegments.join('/');

    //   this.imageURL = of(normalizeURL(result.nativeURL));
    //   console.log('imageURL: '+ normalizeURL(result.nativeURL));

    //   //console.log('dirpath:' + dirPath);

    //   this.file.readAsArrayBuffer(dirPath, result.name).then(buffer => {
    //     console.log('Finished read as array');
    //     this.eventImgBlob = new Blob([buffer], { type: "image/jpeg" });
    //     this.uploadPicture();
    //   });
    // });
  }

  setEventPicture() {
    const confirm = this.alertCtrl.create({
      title: 'Change Event Picture',
      //message: 'Do you agree to use this lightsaber to do good across the intergalactic galaxy?',
      buttons: [
        {
          text: 'Choose from Library...',
          handler: () => {
            this.takePicture(this.camera.PictureSourceType.PHOTOLIBRARY);
          }
        },
        {
          text: 'Take Photo...',
          handler: () => {
            this.takePicture(this.camera.PictureSourceType.CAMERA)
          }
        },
        {
          text: 'Cancel',
          handler: () => {
            console.log('Agree clicked');
          }
        }
      ]
    });
    confirm.present();

  }

}
