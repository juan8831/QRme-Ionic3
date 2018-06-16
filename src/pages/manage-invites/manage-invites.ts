import { Component, OnInit } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { InviteRequest } from '../../models/inviteRequest';
import { InviteRequestProvider } from '../../providers/invite-request/invite-request';
import { ISubscription } from 'rxjs/Subscription';

@IonicPage()
@Component({
  selector: 'page-manage-invites',
  templateUrl: 'manage-invites.html',
})
export class ManageInvitesPage implements OnInit {

  subscriptions: ISubscription[] = [];
  pendingInviteRequests: InviteRequest[] = [];
  acceptedInviteRequests: InviteRequest[] = [];
  rejectedInviteRequests: InviteRequest[] = [];

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    private inviteRequestProvider: InviteRequestProvider
  ) {
  }

  ngOnInit(){
    let pendingInvites = this.inviteRequestProvider.getInviteRequestsByUserAndType(undefined, "pending").subscribe(invites => {
      this.pendingInviteRequests = invites;
    });
    let acceptedInvites = this.inviteRequestProvider.getInviteRequestsByUserAndType(undefined, "accepted").subscribe(invites => {
      this.acceptedInviteRequests = invites;
    });
    let rejectedInvites = this.inviteRequestProvider.getInviteRequestsByUserAndType(undefined, "rejected").subscribe(invites => {
      this.rejectedInviteRequests = invites;
    });
    this.subscriptions.push(pendingInvites);
    this.subscriptions.push(acceptedInvites);
    this.subscriptions.push(rejectedInvites);
  }

  ngOnDestroy(): void {
    this.subscriptions.map(subscription => subscription.unsubscribe());
  }

  cancelInvite(invite: InviteRequest){
    this.inviteRequestProvider.deleteInviteRequest(invite);
  }

  resendInvite(invite: InviteRequest){  
    invite.status = "pending";
    this.inviteRequestProvider.updateInviteRequest(invite);
  }

}
