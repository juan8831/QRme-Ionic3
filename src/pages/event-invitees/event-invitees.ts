import { Component, OnInit } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController } from 'ionic-angular';
import { InviteRequestProvider } from '../../providers/invite-request/invite-request';
import { ISubscription } from 'rxjs/Subscription';
import { Event } from '../../models/event';
import { User } from '../../models/user';
import { EventProvider } from '../../providers/event/event';
import { UserProvider } from '../../providers/user/user';
import { EventInvitationsPage } from '../event-invitations/event-invitations';
import { MessagingProvider } from '../../providers/messaging/messaging';
import { ErrorProvider } from '../../providers/error/error';
import { of } from 'rxjs/observable/of';


@IonicPage()
@Component({
  selector: 'page-event-invitees',
  templateUrl: 'event-invitees.html',
})
export class EventInviteesPage implements OnInit {

  subscriptions: ISubscription[] = [];
  event: Event;

  inviteeUsers: User[] = [];
  blockedUsers: User[] = [];
  searchText: string = "";
  filteredInviteeUsers: User[] = [];
  pendingInviteRequestsNumber: number = 0;
  pageName = 'EventInviteesPage';


  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private inviteRequestProvider: InviteRequestProvider,
    private eventProvider: EventProvider,
    private userProvider: UserProvider,
    private alertCtrl: AlertController,
    private mProv: MessagingProvider,
    private errorProvider: ErrorProvider
  ) {
  }

  ngOnInit() {
    this.event = this.navParams.data;
    let invitees$ = this.eventProvider.getInviteeUsersForEvent(this.event)
      .switchMap(users => {
        if (users) {
          return this.userProvider.getUsersWithList(Object.keys(users))
            .map(users => users.filter(user => user != null && user.name.toLowerCase().includes(this.searchText.toLowerCase())));
        }
        else {
          return of(null);
        }
      });

    let inviteeSubs = invitees$.subscribe(users => {
      if (users) {
        this.inviteeUsers = users;
        this.changeSearch();
      }
    });
    this.subscriptions.push(inviteeSubs);

    if (this.event.type == 'Private') {
      let invitationSubs = this.inviteRequestProvider.getInviteRequestsByEventAndType(this.event.id, "pending")
        .subscribe(requests => {
          this.pendingInviteRequestsNumber = requests.length;
        });
      this.subscriptions.push(invitationSubs);
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.map(subscription => subscription.unsubscribe());
  }

  openInvites() {
    this.navCtrl.push(EventInvitationsPage, { event: this.event, 'isManaging': true });
  }

  uninviteUser(user: User) {
    const loader = this.mProv.getLoader('Removing user...');
    loader.present();

    this.eventProvider.desynchronizeInviteeWithEvent(user.id, this.event.id)
      .then(_ => {
        loader.dismiss();
        this.mProv.showToastMessage(`Successfully removed user: ${user.name}`);
        this.navCtrl.popToRoot();
      })
      .catch(err => {
        loader.dismiss();
        this.errorProvider.reportError(this.pageName, err, this.event.id, 'Could not uninvite user');
        this.mProv.showAlertOkMessage('Error', 'Unable to remove user. Please try again later.')
      });
  }

  showConfirm(user) {
    let confirm = this.alertCtrl.create({
      title: 'Uninvite User?',
      message: 'Are you sure you want to uninvite this user?',
      buttons: [
        {
          role: 'destructive',
          text: 'Yes',
          handler: () => {
            this.uninviteUser(user);
          }
        },
        {
          text: 'No',
        }
      ]
    });
    confirm.present();
  }

  changeSearch() {
    this.filteredInviteeUsers = this.inviteeUsers.filter(user => user.name.toLowerCase().includes(this.searchText.toLowerCase()));
  }

}
