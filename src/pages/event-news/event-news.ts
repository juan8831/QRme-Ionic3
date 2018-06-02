import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, App, ViewController, ModalController } from 'ionic-angular';
import { Event } from '../../models/event';
import { EventDetailPage } from '../event-detail/event-detail';
import { TabsPage } from '../tabs/tabs';
import { EditEventPage } from '../edit-event/edit-event';
import { SelectedEventProvider } from '../../providers/selected-event/selected-event';
import { RootPageProvider } from '../../providers/root-page/root-page';
import { MyApp } from '../../app/app.component';
import { EventsPage } from '../events/events';
import { EventAttendancePage } from '../event-attendance/event-attendance';
import { EventPollsPage } from '../event-polls/event-polls';
import { EventBlogPageModule } from '../event-blog/event-blog.module';
import { EventBlogPage } from '../event-blog/event-blog';
import { UserProvider } from '../../providers/user/user';
import { AngularFireAuth } from 'angularfire2/auth';
import { EventProvider } from '../../providers/event/event';


@IonicPage()
@Component({
  selector: 'page-event-news',
  templateUrl: 'event-news.html',
})
export class EventNewsPage {

  event: Event;
  eventAttendancePage = EventAttendancePage;
  eventBlogPage = EventBlogPage;
  eventPollsPage = EventPollsPage;
  isManaging: boolean = false;


  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams, 
    public app: App, 
    private viewCtrl: ViewController,
    private selectedEventProvider: SelectedEventProvider,
    private rootPageProvider : RootPageProvider,
    private modalCtrl: ModalController,
    private userProvider: UserProvider,
    private afAuth: AngularFireAuth,
    private eventProvider: EventProvider
  ) {
    this.event = this.selectedEventProvider.getEvent();

    this.eventProvider.getAdminUsersForEvent(this.event).take(1).subscribe(users => {
      this.isManaging = this.afAuth.auth.currentUser.uid in users? true: false
      
    });
  
  }

  ionViewDidEnter(){
    //this.isManaging = this.event.adminList[this.userProvider.userProfile.id] == true ? true : false;
    //this.event = this.navParams.get('event');
   //console.log(this.event);
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad EventNewsPage');
  }

  onOpenInfo(){
    this.navCtrl.push(EventDetailPage, {event: this.event, 'isManaging': this.isManaging});
    //this.navCtrl.p
  }

  onGoHome(){
    //this.app.getRootNav().push(EventsPage);
    this.rootPageProvider.page.next(true);
    //this.myApp.rootPage = TabsPage;
    
  }

 

  onAttendance(){
    console.log("onAttendace");
    this.modalCtrl.create(EventAttendancePage).present();
  }

  

}