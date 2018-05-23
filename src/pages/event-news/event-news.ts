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
    private userProvider: UserProvider
  ) {
    this.event = this.selectedEventProvider.getEvent();
    if(this.event.adminList){
      this.isManaging = this.event.adminList[this.userProvider.userProfile.id] == true ? true : false;
    }
  

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

  onOpenEdit(){
    this.navCtrl.push(EditEventPage, {type: 'edit', event: this.event});
  }

  onAttendance(){
    console.log("onAttendace");
    this.modalCtrl.create(EventAttendancePage).present();
  }

  

}