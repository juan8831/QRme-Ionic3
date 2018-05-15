import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';
import { Event } from '../../models/event';
import { SelectedEventProvider } from '../../providers/selected-event/selected-event';


@IonicPage()
@Component({
  selector: 'page-event-attendance',
  templateUrl: 'event-attendance.html',
})
export class EventAttendancePage {

  event: Event;
  constructor(public navCtrl: NavController, 
    public navParams: NavParams, 
    private selectedEventProvider : SelectedEventProvider,
    private viewCtrl: ViewController
  ) {
    this.event = this.selectedEventProvider.getEvent();
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad EventAttendancePage');
    //this.event = this.navParams.get('event');
  }

  onGoToEvent(){
    this.viewCtrl.dismiss();

  }

}
