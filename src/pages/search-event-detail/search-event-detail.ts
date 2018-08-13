import { Component, OnInit } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { Event } from '../../models/event';
import { UserProvider } from '../../providers/user/user';
import { EventProvider } from '../../providers/event/event';
import { InviteRequestProvider } from '../../providers/invite-request/invite-request';
import { InviteRequest } from '../../models/inviteRequest';
import { MessagingProvider } from '../../providers/messaging/messaging';
import { ISubscription } from 'rxjs/Subscription';
import { combineLatest } from 'rxjs/observable/combineLatest';
import { ErrorProvider } from '../../providers/error/error';


@IonicPage()
@Component({
  selector: 'page-search-event-detail',
  templateUrl: 'search-event-detail.html',
})
export class SearchEventDetailPage implements OnInit {

  event: Event;
  showJoinedEvent //show if event is in user's invitee list
  showJoinEvent = false;  //show if event is public & not in user's invitee list
  showRequestInvite = false; //show if event is private & no invite exists 
  showInviteRequested = false; //show if event is private & invite exists 
  inviteRequestExists = false;
  subscription: ISubscription;
  isAdmin = false;
  isInvitee = false;
  pageName = 'SearchEventDetailsPage';
  subscriptions: ISubscription[] = [];

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private userProvider: UserProvider,
    private eventProvider: EventProvider,
    private inviteRequestProvider: InviteRequestProvider,
    private mProv: MessagingProvider,
    private errorProvider: ErrorProvider
  ) {
    this.event = navParams.get('event');
    var adminEvents$ = this.userProvider.getManagingEventIdsList();
    var inviteeEvents$ = this.userProvider.getInvitedEventIdsList();
    let eventSubs = combineLatest(adminEvents$, inviteeEvents$)
      .subscribe(([adminEvents, inviteeEvents]) => {
        this.isAdmin = (this.event.id in adminEvents.events) ? true : false;
        this.isInvitee = (this.event.id in inviteeEvents.events) ? true : false;
      });
    this.subscriptions.push(eventSubs);

    let inviteSubs = this.inviteRequestProvider.getInviteRequestByUserAndEvent(undefined, this.event.id)
      .subscribe(invites => {
        if (!invites || invites.length == 0) {
          this.inviteRequestExists == false;
        }
        else {
          this.inviteRequestExists = true;
        }
      });
    this.subscriptions.push(inviteSubs);
  }

  ngOnInit() {

  }

  ngOnDestroy(): void {
    this.subscriptions.map(subscription => subscription.unsubscribe());
  }

  //user wants to join private event. Create request invite
  requestInvite() {

    let loader = this.mProv.getLoader('Sending invite request...');
    loader.present();

    this.userProvider.getCurrentUserObservable().take(1).subscribe(currentUser => {
      var inviteRequest: InviteRequest = {
        requestedBy: 'User',
        requestDate: new Date(),
        eventId: this.event.id,
        eventName: this.event.name,
        userId: currentUser.id,
        userName: currentUser.name,
        status: 'pending'
      };

      this.inviteRequestProvider.createInviteRequest(inviteRequest)
        .then(_ => {
          loader.dismiss();
          this.mProv.showToastMessage('Invite request successfully sent!')
        })
        .catch(err => {
          this.errorProvider.reportError(this.pageName, err, this.event.id, 'Could create invite request');
          loader.dismiss();
          this.mProv.showAlertOkMessage('Error', 'Invite request could not be sent. Please try again later.');
        });

    });

  }

  //add user id to event invitee list && add the current even to the user's invitee list
  joinEvent() {
    const loader = this.mProv.getLoader('Joining event...')
    loader.present();
    this.eventProvider.synchronizeInviteeWithEvent(this.userProvider.userProfile.id, this.event.id, this.event.name)
      .then(_ => {
        this.mProv.showToastMessage('You have successfully joined the event');
        this.navCtrl.pop()
        loader.dismiss();
      })
      .catch(err => {
        this.mProv.showAlertOkMessage('Error', 'Could not join event. Please try again later.');
        this.errorProvider.reportError(this.pageName, err, this.event.id, 'Could not join event');
        loader.dismiss();
      });
  }


}
