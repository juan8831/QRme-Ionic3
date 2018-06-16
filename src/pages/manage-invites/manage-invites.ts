import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { InviteRequest } from '../../models/inviteRequest';
import { InviteRequestProvider } from '../../providers/invite-request/invite-request';

@IonicPage()
@Component({
  selector: 'page-manage-invites',
  templateUrl: 'manage-invites.html',
})
export class ManageInvitesPage {

  pendingInviteRequests: InviteRequest[];
  acceptedInviteRequests: InviteRequest[];
  rejectedInviteRequests: InviteRequest[];

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    private inviteRequestProvider: InviteRequestProvider
  ) {
  }

  ionViewDidLoad() {
    this.inviteRequestProvider.getInviteRequestsByUserAndType(undefined, "pending").subscribe(invites => {
      this.pendingInviteRequests = invites;
    })
  }

  cancelInvite(invite: InviteRequest){
    this.inviteRequestProvider.deleteInviteRequest(invite);
  }

}
