import { Component, OnInit } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { InviteRequest } from '../../models/inviteRequest';
import { InviteRequestProvider } from '../../providers/invite-request/invite-request';
import { ISubscription } from 'rxjs/Subscription';
import { MessagingProvider } from '../../providers/messaging/messaging';
import { ErrorProvider } from '../../providers/error/error';

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
  pageName = 'ManageInvitesPage';

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    private inviteRequestProvider: InviteRequestProvider,
    private mProv: MessagingProvider,
    private errorProvider: ErrorProvider
  ) {
  }

  ngOnInit(){
    let pendingInvites = this.inviteRequestProvider.getInviteRequestsByUserAndType(undefined, "pending").subscribe(invites => {
      if(invites){
        this.pendingInviteRequests = invites;
      }
    });
    let acceptedInvites = this.inviteRequestProvider.getInviteRequestsByUserAndType(undefined, "accepted").subscribe(invites => {
      if(invites){
        this.acceptedInviteRequests = invites;
      }
    });
    let rejectedInvites = this.inviteRequestProvider.getInviteRequestsByUserAndType(undefined, "rejected").subscribe(invites => {
      if(invites){
        this.rejectedInviteRequests = invites;
      }
    });
    this.subscriptions.push(pendingInvites);
    this.subscriptions.push(acceptedInvites);
    this.subscriptions.push(rejectedInvites);
  }

  ngOnDestroy(): void {
    this.subscriptions.map(subscription => subscription.unsubscribe());
  }

  cancelInvite(invite: InviteRequest){
    this.inviteRequestProvider.deleteInviteRequest(invite)
    .then(_=> {
      this.mProv.showToastMessage('Invite successfully canceled.');
    })
    .catch(err => {
      this.errorProvider.reportError(this.pageName, err, invite.eventId, 'Could not cancel invite');
      this.mProv.showAlertOkMessage('Error', 'Could not cancel invite. Please try again later.')
    });
  }

  resendInvite(invite: InviteRequest){  
    invite.status = "pending";
    invite.requestDate = new Date();
    this.inviteRequestProvider.updateInviteRequest(invite)
    .then(_=> {
      this.mProv.showToastMessage('Invite successfully resent.');
    })
    .catch(err => {
      this.errorProvider.reportError(this.pageName, err, invite.eventId, 'Could not resend invite');
      this.mProv.showAlertOkMessage('Error', 'Could not resend invite. Please try again later.')
    });
  }

}
