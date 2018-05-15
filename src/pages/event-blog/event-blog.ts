import { Component, OnInit } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { Event } from '../../models/event';

@IonicPage()
@Component({
  selector: 'page-event-blog',
  templateUrl: 'event-blog.html',
})
export class EventBlogPage implements OnInit {

  event: Event;

  constructor(public navCtrl: NavController, public navParams: NavParams) {
    this.event = this.navParams.data; 
  }

  ngOnInit(): void {
    
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad EventBlogPage');
  }

}
