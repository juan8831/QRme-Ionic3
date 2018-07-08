import { Component, OnInit } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { Event } from '../../models/event';
import { EventProvider } from '../../providers/event/event';
import { AttendanceRecord } from '../../models/attendance';
import { UserProvider } from '../../providers/user/user';
import { User } from '../../models/user';

@IonicPage()
@Component({
  selector: 'page-event-attendance-instance-admin',
  templateUrl: 'event-attendance-instance-admin.html',
})
export class EventAttendanceInstanceAdminPage implements OnInit {

  event: Event;
  selectedDate: Date;
  records: AttendanceRecord[] = [];
  searchText: string = "";
  users: User [] = [];
  filteredUsers: User [] = [];
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

  ngOnInit(){
    this.event = this.navParams.get('event');
    this.selectedDate = this.navParams.get('selectedDate');

    this.eventProvider.getInviteeUsersForEvent(this.event).subscribe(users => {
      if(users){
        this.numOfInvitees = Object.keys(users).length;
        this.setMissingCount();
      }
    });

    this.eventProvider.getAttendanceRecordsByEventAndDate(this.event, this.selectedDate).subscribe(records => {
      this.records = records;
      let usersIds = this.records.map(record => record.userId);
      if(usersIds.length == 0){
        this.users = [];
        this.numOfPresent = 0;
        this.setMissingCount();
      }
    
      this.userProvider.getUsersWithList(usersIds)
          .map(users => users.filter(user => user != null && user.name.toLowerCase().includes(this.searchText.toLowerCase())))
          .subscribe(users => {
            this.users = users;
            this.numOfPresent = this.users.length;
            this.setMissingCount();
            this.changeSearch();
          });   
    });
  }

  setMissingCount(){
    this.numOfMissing = this.numOfInvitees - this.numOfPresent;
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad EventAttendanceInstanceAdminPage');
  }

  changeSearch() {
    this.filteredUsers = this.users.filter(user => user.name.toLowerCase().includes(this.searchText.toLowerCase()));
  }

}
