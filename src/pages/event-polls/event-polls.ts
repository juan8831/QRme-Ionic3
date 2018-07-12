import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { Poll } from '../../models/poll';
import { ISubscription } from 'rxjs/Subscription';
import { AngularFirestore } from 'angularfire2/firestore';
import { AngularFireAuth } from 'angularfire2/auth';
import { UserProvider } from '../../providers/user/user';
import { FirebaseApp } from 'angularfire2';
import { EventProvider } from '../../providers/event/event';
import { Event } from '../../models/event';
import { MessagingProvider } from '../../providers/messaging/messaging';
import { PollProvider } from '../../providers/poll/poll';
import { EditPollPage } from '../edit-poll/edit-poll';
import { PollPage } from '../poll/poll';

@IonicPage()
@Component({
  selector: 'page-event-polls',
  templateUrl: 'event-polls.html',
})
export class EventPollsPage {

  event: Event;
  subscriptions: ISubscription[] = [];
  polls: Poll[] = [];
  filteredPolls: Poll[] = [];
  searchText = '';
  isAdmin = false;
  userId: string;
  userEmail: string;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private afs: AngularFirestore,
    private afAuth: AngularFireAuth,
    private userProvider: UserProvider,
    private fb: FirebaseApp,
    private eventProvider: EventProvider,
    private mProv: MessagingProvider,
    private pollProvider: PollProvider

    ) {
    this.event = this.navParams.data;
    this.userId = this.afAuth.auth.currentUser.uid;
    this.userEmail = this.afAuth.auth.currentUser.email; 
    this.isAdmin = this.eventProvider.isEventAdmin(this.event, undefined, undefined)
    
    //let loader = this.mProv.getLoader('Loading event polls...');
    //loader.present();
    let postSubs = this.pollProvider.getPollsByEvent(this.event.id)
    .map(polls => polls.filter(poll => poll != null && poll.name.toLowerCase().includes(this.searchText.toLowerCase())))
    .subscribe(polls => {
      //loader.dismiss();
      this.polls = polls;
      this.changeSearch();
    })
    this.subscriptions.push(postSubs);
    
  }

  ngOnDestroy(): void {
    this.subscriptions.map(subscription => subscription.unsubscribe());
  }

  addPoll(){
    this.navCtrl.push(EditPollPage, {'event' : this.event, 'create': true});
  }

  openPoll(poll: Poll){
    this.navCtrl.push(PollPage, {'poll': poll ,'event': this.event});
  }

  changeSearch() {
    this.filteredPolls = this.polls.filter(poll => poll.name.toLowerCase().includes(this.searchText.toLowerCase()));
  }

  

  


}
