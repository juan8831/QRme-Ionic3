import { Component, OnInit } from '@angular/core';
import { IonicPage, NavController, NavParams, App, ViewController, ModalController } from 'ionic-angular';
import { Event } from '../../models/event';
import { EventDetailPage } from '../event-detail/event-detail';
import { TabsPage } from '../tabs/tabs';
import { EditEventPage } from '../edit-event/edit-event';
import { SelectedEventProvider } from '../../providers/selected-event/selected-event';
import { MyApp } from '../../app/app.component';
import { EventsPage } from '../events/events';
import { EventAttendancePage } from '../event-attendance/event-attendance';
import { EventPollsPage } from '../event-polls/event-polls';
import { EventBlogPageModule } from '../event-blog/event-blog.module';
import { EventBlogPage } from '../event-blog/event-blog';
import { UserProvider } from '../../providers/user/user';
import { AngularFireAuth } from 'angularfire2/auth';
import { EventProvider } from '../../providers/event/event';
import { EventInviteesPage } from '../event-invitees/event-invitees';
import { EventInvitationsPage } from '../event-invitations/event-invitations';
import { AngularFirestoreModule } from 'angularfire2/firestore';
import { AngularFireStorage } from 'angularfire2/storage';
import { FirebaseApp } from 'angularfire2';
import { EventAttendanceAdminPage } from '../event-attendance-admin/event-attendance-admin';
import { EventQrcodePage } from '../event-qrcode/event-qrcode';

@IonicPage()
@Component({
  selector: 'page-event-news',
  templateUrl: 'event-news.html',
})
export class EventNewsPage implements OnInit {

  event: Event;
  eventAttendancePage = EventAttendancePage;
  eventInviteesPage = EventInviteesPage;
  eventBlogPage = EventBlogPage;
  eventPollsPage = EventPollsPage;
  isManaging: boolean = false;
  imageURL: string;


  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public app: App,
    private viewCtrl: ViewController,
    private selectedEventProvider: SelectedEventProvider,
    private modalCtrl: ModalController,
    private userProvider: UserProvider,
    private afAuth: AngularFireAuth,
    private eventProvider: EventProvider,
    private storage: AngularFireStorage,
    private firebase: FirebaseApp
  ) {
  }

  ngOnInit(): void {
    let event = this.selectedEventProvider.getEvent();
    this.eventProvider.getEvent(event.id).subscribe(event => {
      this.event = event;
      console.log(event);
      this.isManaging = this.eventProvider.isEventAdmin(this.event, undefined, undefined);
    })

  }



  // ionViewDidEnter(){
  //   //this.isManaging = this.event.adminList[this.userProvider.userProfile.id] == true ? true : false;
  //   //this.event = this.navParams.get('event');
  //  //console.log(this.event);

  //     this.firebase.storage().ref().child(`eventPictures/${this.event.id}`).getDownloadURL()
  //       .then(result => {
  //         this.imageURL = result;
  //       })
  //       .catch(err => {
  //         this.imageURL = 'assets/imgs/calendar.png';
  //       })
  // }

  ionViewDidLoad() {
    console.log('ionViewDidLoad EventNewsPage');
  }

  onOpenInfo() {
    this.navCtrl.push(EventDetailPage, { event: this.event, 'isManaging': this.isManaging });
    //this.navCtrl.p
  }


  onAttendance() {
    console.log("onAttendace");
    this.modalCtrl.create(EventAttendancePage).present();
  }

  openAttendance() {
    if (this.isManaging) {
      this.navCtrl.push(EventAttendanceAdminPage, this.event);
    }
    else {
      this.navCtrl.push(EventAttendancePage, this.event);
    }
  }

  openQrpage() {
    let modal = this.modalCtrl.create(EventQrcodePage, { 'event': this.event });
    modal.present();
  }
}