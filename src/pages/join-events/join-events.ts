import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { PublicEventsPage } from '../public-events/public-events';
import { QrJoinEventPage } from '../qr-join-event/qr-join-event';
import { SearchEventsPage } from '../search-events/search-events';
import { ManageInvitesPage } from '../manage-invites/manage-invites';
import { InviteRequest } from '../../models/inviteRequest';
import { InviteRequestProvider } from '../../providers/invite-request/invite-request';
import { ISubscription } from 'rxjs/Subscription';

@IonicPage()
@Component({
  selector: 'page-join-events',
  templateUrl: 'join-events.html',
})
export class JoinEventsPage {

  subscriptions: ISubscription [] = [];
  pendingInvitations: number = 0;

  searchEventsPage = SearchEventsPage;
  qrJoinEventPage = QrJoinEventPage;
  manageInvitesPage = ManageInvitesPage;

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    private inviteRequestProvider: InviteRequestProvider
    ) {

      let subscription = this.inviteRequestProvider.getInviteRequestsByUserAndType(undefined, "pending").subscribe(invites => {
        this.pendingInvitations = invites.length;
      });
      this.subscriptions.push(subscription);
  }

  ionViewDidLoad() {
    
  }

  ngOnDestroy(): void {
    this.subscriptions.map(subscription => subscription.unsubscribe());
  }



}
