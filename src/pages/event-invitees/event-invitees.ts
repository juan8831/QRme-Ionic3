import { Component, OnInit } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { InviteRequest } from '../../models/inviteRequest';
import { InviteRequestProvider } from '../../providers/invite-request/invite-request';
import { ISubscription } from 'rxjs/Subscription';
import { Event } from '../../models/event';


@IonicPage()
@Component({
  selector: 'page-event-invitees',
  templateUrl: 'event-invitees.html',
})
export class EventInviteesPage implements OnInit {

  subscriptions: ISubscription[] = [];
  pendingInviteRequests: InviteRequest[] = [];
  event: Event;
  isManaging = false;

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    private inviteRequestProvider: InviteRequestProvider
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

}
