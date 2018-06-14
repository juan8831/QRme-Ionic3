import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController, AlertController, ToastController, DateTime } from 'ionic-angular';
import { Event } from '../../models/event';
import { UserProvider } from '../../providers/user/user';
import { EventProvider } from '../../providers/event/event';
import { AngularFireAuth } from 'angularfire2/auth';
import { InviteRequestProvider } from '../../providers/invite-request/invite-request';
import { InviteRequest } from '../../models/inviteRequest';
import { User } from '../../models/user';
import { MessagingProvider } from '../../providers/messaging/messaging';


@IonicPage()
@Component({
  selector: 'page-search-event-detail',
  templateUrl: 'search-event-detail.html',
})
export class SearchEventDetailPage {

  event: Event;
  showJoinedEvent //show if event is in user's invitee list
  showJoinEvent = false;  //show if event is public & not in user's invitee list
  showRequestInvite = false; //show if event is private & no invite exists 
  showInviteRequested = false; //show if event is private & invite exists 
  inviteRequestExists = false;

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    private loadingCtrl: LoadingController,
    private alertCtrl : AlertController,
    private toastCtrl: ToastController,
    private userProvider: UserProvider,
    private eventProvider: EventProvider,
    private afAuth: AngularFireAuth,
    private inviteRequestProvider: InviteRequestProvider,
    private mProv: MessagingProvider
     
  ) {
    this.event = navParams.get('event');

    this.inviteRequestProvider.getInviteRequestByUserAndEvent(undefined, this.event.id).subscribe(invites => {
      if(invites.length == 0){
        this.inviteRequestExists == false;
      }
      else{
        this.inviteRequestExists = true;
      }   
    });


  }

  ionViewDidLoad() {
  }

  //user wants to join private event. Create request invite
  requestInvite(){

    let loader = this.mProv.getLoader('Sending invite request...');
    loader.present();

     this.userProvider.getCurrentUserObservable().take(1).subscribe(currentUser => {
      var inviteRequest : InviteRequest = {
        requestedBy : 'User',
        requestDate : new Date(),
        eventId: this.event.id,
        eventName : this.event.name,
        userId: currentUser.id,
        userName: currentUser.name,
        status : 'pending'
      };
      
      this.inviteRequestProvider.createInviteRequest(inviteRequest)
      .then(_ => {
        loader.dismiss();
        this.mProv.showToastMessage('Invite request successfully sent!')
      })
      .catch(err => {
        console.log(err);
        loader.dismiss();
        this.mProv.showAlertOkMessage('Error','Invite request could not be sent. Please try again');
      });

     });
    
  }

  //add user id to event invitee list && add the current even to the user's invitee list
  joinEvent(){
    const loader = this.loadingCtrl.create({content: 'Joining event...'}); 
    loader.present();

    // this.userProvider.userProfile.eventInviteeList[this.event.id] = true;
    // this.userProvider.addEventInviteeList(this.event.id)
    // .then(_=> {
    //   if(!this.event.inviteeList){
    //     this.event.inviteeList = {};
    //   }
    //   this.event.inviteeList[this.userProvider.userProfile.id] = true;
    //   this.eventProvider.addUserToInviteeList(this.userProvider.userProfile.id, this.event.id)
    //   .then(_=> {
    //     this.toastCtrl.create({message: 'You have successfully joined the event', duration: 4000}).present();
    //     this.navCtrl.pop()
    //     loader.dismiss();
    //   })
    //   .catch(err => {
    //     this.toastCtrl.create({message: err, duration: 4000}).present();
    //     loader.dismiss();
    //   });
    // })
    // .catch(err => {
    //   this.toastCtrl.create({message: err, duration: 4000}).present();
    //   loader.dismiss();
    // });

    this.eventProvider.synchronizeInviteeWithEvent(this.userProvider.userProfile.id, this.event.id, this.event.name)
    .then(_=> {
        this.toastCtrl.create({message: 'You have successfully joined the event', duration: 4000}).present();
        this.navCtrl.pop()
        loader.dismiss();
    })
    .catch(err => {
        this.toastCtrl.create({message: err, duration: 4000}).present();
        loader.dismiss();
    });
  }


}
