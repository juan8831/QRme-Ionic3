import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { EventsPage } from '../events/events';
import { PublicEventsPage } from '../public-events/public-events';
import { EditEventPage } from '../edit-event/edit-event';
import { EventNewsPage } from '../event-news/event-news';
import { EventAttendancePage } from '../event-attendance/event-attendance';
import { EventBlogPage } from '../event-blog/event-blog';
import { EventPollsPage } from '../event-polls/event-polls';
import { Event } from '../../models/event';

/**
 * Generated class for the EventTabsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-event-tabs',
  templateUrl: 'event-tabs.html',
})
export class EventTabsPage {

  event: any;
  tab1Root = EventNewsPage;
  tab2Root = EventAttendancePage;
  tab3Root = EventBlogPage;
  tab4Root = EventPollsPage;

  constructor(public navCtrl: NavController, public navParams: NavParams) {
    this.event = {'event': this.navParams.get('event')};
  }

  ionViewDidEnter() {
    console.log('event-tabs');
    this.event = {'event': this.navParams.get('event')};
  }

}
