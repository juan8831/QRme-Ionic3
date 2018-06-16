import { Component, OnInit } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { PublicEventsPage } from '../public-events/public-events';
import { QrJoinEventPage } from '../qr-join-event/qr-join-event';
import { SearchEventsPage } from '../search-events/search-events';
import { ManageInvitesPage } from '../manage-invites/manage-invites';
import { InviteRequest } from '../../models/inviteRequest';
import { InviteRequestProvider } from '../../providers/invite-request/invite-request';
import { ISubscription } from 'rxjs/Subscription';
import { combineLatest } from 'rxjs/observable/combineLatest';

@IonicPage()
@Component({
  selector: 'page-join-events',
  templateUrl: 'join-events.html',
})
export class JoinEventsPage implements OnInit {

  subscriptions: ISubscription [] = [];
  acceptedAndRejectedInvitesTotal: number = 0;

  searchEventsPage = SearchEventsPage;
  qrJoinEventPage = QrJoinEventPage;
  manageInvitesPage = ManageInvitesPage;

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    private inviteRequestProvider: InviteRequestProvider
    ) {
  }

  ngOnInit(){
    var acceptedEvents$ = this.inviteRequestProvider.getInviteRequestsByUserAndType(undefined, 'accepted');
    var rejectedEvents$ = this.inviteRequestProvider.getInviteRequestsByUserAndType(undefined, 'rejected');
    var subs = combineLatest(acceptedEvents$, rejectedEvents$)
    .subscribe(([acceptedInvites, rejectedInvites]) => {
      this.acceptedAndRejectedInvitesTotal = acceptedInvites.length + rejectedInvites.length;
    });

    this.subscriptions.push(subs);
  }

  ngOnDestroy(): void {
    this.subscriptions.map(subscription => subscription.unsubscribe());
  }



}
