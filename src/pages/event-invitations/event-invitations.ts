import { Component, OnInit } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { ISubscription } from 'rxjs/Subscription';
import { InviteRequest } from '../../models/inviteRequest';
import { InviteRequestProvider } from '../../providers/invite-request/invite-request';
import { Event } from '../../models/event';
import { EventProvider } from '../../providers/event/event';
import { MessagingProvider } from '../../providers/messaging/messaging';
import { ErrorProvider } from '../../providers/error/error';

@IonicPage()
@Component({
  selector: 'page-event-invitations',
  templateUrl: 'event-invitations.html',
})
export class EventInvitationsPage implements OnInit {

  subscriptions: ISubscription[] = [];
  pendingInviteRequests: InviteRequest[] = [];
  event: Event;
  isManaging = false;
  pageName = 'EventInvitationsPage';
  
  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    private inviteRequestProvider: InviteRequestProvider,
    private eventProvider: EventProvider,
    private mProv: MessagingProvider,
    private errorProvider: ErrorProvider
  ) {
  }

  ngOnInit(){
    this.event = this.navParams.get('event');
    this.isManaging = this.navParams.get('isManaging');
    let pendingInvites = this.inviteRequestProvider.getInviteRequestsByEventAndType(this.event.id, "pending")
    .subscribe(invites => {
      this.pendingInviteRequests = invites;
    });
    this.subscriptions.push(pendingInvites);
  }

  ngOnDestroy(): void {
    this.subscriptions.map(subscription => subscription.unsubscribe());
  }

  acceptInvite(invite: InviteRequest){
    this.eventProvider.synchronizeInviteeWithEvent(invite.userId, this.event.id, this.event.name)
    .then(_=> {
      invite.status = "accepted";
      this.inviteRequestProvider.updateInviteRequest(invite)
      .then()
      .catch(err => {
        this.mProv.showAlertOkMessage('Error', 'Could not update invite request, please try again.');
        this.errorProvider.reportError(this.pageName, err, this.event.id, 'Could not accept invite');
      });
    })
    .catch(err => {
      this.mProv.showAlertOkMessage('Error', 'Could not update invite request, please try again.');
      this.errorProvider.reportError(this.pageName, err, this.event.id, 'Could not update invite request');
    });
  }

  rejectInvite(invite: InviteRequest){
    invite.status = "rejected";
    this.inviteRequestProvider.updateInviteRequest(invite);
  }

 

}
