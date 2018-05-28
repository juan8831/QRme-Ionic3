import { Component, OnInit } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController, AlertController } from 'ionic-angular';
import { Event } from '../../models/event';
import { Form, NgForm } from '@angular/forms';
import { EventProvider } from '../../providers/event/event';
import { AngularFireAuth } from 'angularfire2/auth';
import { UserProvider } from '../../providers/user/user';
import { User } from '../../models/user';

//used for creating and editing events
@IonicPage()
@Component({
  selector: 'page-edit-event',
  templateUrl: 'edit-event.html',
})
export class EditEventPage implements OnInit {

  event: Event;
  isnewEvent: boolean;

  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    private eventProvider: EventProvider,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController,
    private afAuth: AngularFireAuth,
    private userProvider: UserProvider

  ) {
  }

  ngOnInit() {
    this.isnewEvent = this.navParams.get('type') == 'new' ? true : false;
    if (!this.isnewEvent) {
      this.event = this.navParams.get('event');
    }
    else {
      this.event = new Event();
    }
  }

  ionViewDidLoad() {

  }

  onSubmit(f: NgForm) {
    this.event.name = f.value.name;
    this.event.recurring = f.value.recurring ? f.value.recurring : false;
    this.event.location = f.value.location;
    this.event.type = f.value.type;

    //optional 
    this.event.date = f.value.date ? f.value.date : '';
    this.event.time = f.value.time ? f.value.time : '';
    this.event.description = f.value.description ? f.value.description : '';

    if (this.isnewEvent) {
      this.event.creator = this.afAuth.auth.currentUser.email;
      this.event.creatorName = this.userProvider.userProfile.name;
      this.event.adminList = {};
      this.event.adminList[this.userProvider.userProfile.id] = true;
      this.event.inviteeList = {};
      this.eventProvider.addEvent(this.event)
        .then(data => {
          var key = data.id;
          //console.log(key);
         // var updateUser = this.userProvider.userProfile;
          //updateUser.eventAdminList[key] = true;
          this.userProvider.addEventAdminList(key).then(_ => this.navCtrl.pop());

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
      this.eventProvider.updateEvent(this.event);
      this.navCtrl.pop();
    }



    

  }

     async deleteEvent() {

      await Promise.all(Object.keys(this.event.adminList).map(async (userId) => {
        await this.userProvider.deleteEventForUser(userId, this.event.id).toPromise();
        console.log('deleted for user');
      }));
      
    this.eventProvider.deleteEvent(this.event);
    //todo invitee list delete

    this.toastCtrl.create({
      message: 'Event successfully deleted',
      duration: 3000
    }).present();
    this.navCtrl.popToRoot();
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

}
