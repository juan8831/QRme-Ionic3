import { Component, ViewChild } from '@angular/core';
import { Platform, NavController, MenuController } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { TabsPage } from '../pages/tabs/tabs';
import { EventsPage } from '../pages/events/events';
import { PublicEventsPage } from '../pages/public-events/public-events';
import { SigninUpPage } from '../pages/signin-up/signin-up';
import { SettingsPage } from '../pages/settings/settings';
import { EventDetailPage } from '../pages/event-detail/event-detail';

import firebase from 'firebase';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  rootPage:any = EventsPage;
  eventsPage = EventsPage;
  publicEventsPage = PublicEventsPage
  signInUpPage = SigninUpPage
  settings = SettingsPage

  isAuthenticated = true;
  

  @ViewChild('nav') nav: NavController;

  constructor(
    platform: Platform, 
    statusBar: StatusBar, 
    splashScreen: SplashScreen, 
    private menuCtrl: MenuController
  ) {
    firebase.initializeApp({
      apiKey: "AIzaSyCIbx9StXPYu0Dohg3VadKgONnV5vCqKqY",
    authDomain: "qrme-65e1e.firebaseapp.com",
    databaseURL: "https://qrme-65e1e.firebaseio.com"
    });



    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      statusBar.styleDefault();
      splashScreen.hide();
    });
  }

  onLoad(page: any){
    this.nav.setRoot(page);
    this.menuCtrl.close();
  }






}
