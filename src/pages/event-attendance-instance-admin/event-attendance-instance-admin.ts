import { Component, OnInit } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { Event } from '../../models/event';
import { EventProvider } from '../../providers/event/event';
import { AttendanceRecord } from '../../models/attendance';
import { UserProvider } from '../../providers/user/user';
import { User } from '../../models/user';
import { ISubscription } from '../../../node_modules/rxjs/Subscription';
import { of } from 'rxjs/observable/of';


@IonicPage()
@Component({
  selector: 'page-event-attendance-instance-admin',
  templateUrl: 'event-attendance-instance-admin.html',
})
export class EventAttendanceInstanceAdminPage implements OnInit {

  event: Event;
  selectedDate: Date;
  records: AttendanceRecord[] = [];
  subscriptions: ISubscription[] = [];
  searchText: string = "";
  users: User[] = [];
  filteredUsers: User[] = [];
  numOfInvitees: number = 0;
  numOfMissing = 0;
  numOfPresent = 0;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private eventProvider: EventProvider,
    private userProvider: UserProvider
  ) {
  }

  ngOnInit() {
    this.event = this.navParams.get('event');
    this.selectedDate = this.navParams.get('selectedDate');

    let inviteesSubs = this.eventProvider.getInviteeUsersForEvent(this.event).subscribe(users => {
      if (users) {
        this.numOfInvitees = Object.keys(users).length;
        this.setMissingCount();
      }
    });
    this.subscriptions.push(inviteesSubs);

    let records$ = this.eventProvider.getAttendanceRecordsByEventAndDate(this.event, this.selectedDate).switchMap(records => {
      if (records) {
        this.records = records;
        let usersIds = this.records.map(record => record.userId);
        if (usersIds.length == 0) {
          this.users = [];
          this.numOfPresent = 0;
          this.setMissingCount();
        }
        return this.userProvider.getUsersWithList(usersIds)
          .map(users => users.filter(user => user != null && user.name.toLowerCase().includes(this.searchText.toLowerCase())));
      }
      else{
        return of([]);
      }

    });

    let subs = records$.subscribe(users => {
      this.users = users;
      this.numOfPresent = this.users.length;
      this.setMissingCount();
      this.changeSearch();
    });
    this.subscriptions.push(subs);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  setMissingCount() {
    this.numOfMissing = this.numOfInvitees - this.numOfPresent;
  }

  changeSearch() {
    this.filteredUsers = this.users.filter(user => user.name.toLowerCase().includes(this.searchText.toLowerCase()));
  }

}
