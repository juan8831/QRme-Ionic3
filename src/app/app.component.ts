import { Component, ViewChild } from '@angular/core';
import { Platform, NavController, MenuController, AlertController } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { TabsPage } from '../pages/tabs/tabs';
import { EventsPage } from '../pages/events/events';
import { PublicEventsPage } from '../pages/public-events/public-events';
import { SigninUpPage } from '../pages/signin-up/signin-up';
import { SettingsPage } from '../pages/settings/settings';
import { EventDetailPage } from '../pages/event-detail/event-detail';

import firebase from 'firebase';
import { RootPageProvider } from '../providers/root-page/root-page';
import { AngularFireAuth } from 'angularfire2/auth';
import { AuthProvider } from '../providers/auth/auth';
import { JoinEventsPage } from '../pages/join-events/join-events';
import { UserProvider } from '../providers/user/user';
import { MessagingProvider } from '../providers/messaging/messaging';
import {timer} from 'rxjs/observable/timer';
import { AboutPage } from '../pages/about/about';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  rootPage :any = EventsPage;
  eventsPage = EventsPage;
  publicEventsPage = PublicEventsPage;
  signInUpPage = SigninUpPage;
  settings = SettingsPage;
  joinEventsPage = JoinEventsPage;
  about = AboutPage;

  isAuthenticated = true;
  email = "";
  showSplash = true;
  

  @ViewChild('nav') nav: NavController;

   constructor(
    platform: Platform, 
    statusBar: StatusBar, 
    splashScreen: SplashScreen, 
    private menuCtrl: MenuController,
    private rootPageProvider : RootPageProvider,
    private authProvider: AuthProvider,
    private afAuth: AngularFireAuth,
    private userProvider: UserProvider,
    private mProv: MessagingProvider,
    private alertCtrl: AlertController
  ) {
    firebase.initializeApp({
      apiKey: "AIzaSyCIbx9StXPYu0Dohg3VadKgONnV5vCqKqY",
    authDomain: "qrme-65e1e.firebaseapp.com",
    databaseURL: "https://qrme-65e1e.firebaseio.com"
    });

    afAuth.authState.subscribe(user => {
      if(user){
            console.log("logged in..");
            this.isAuthenticated = true;
            //this.userProvider.getUserProfile();
            this.email = user.email;
            this.rootPage = EventsPage;
            //this.nav.setRoot(this.tabsPage);
          }
          else{
            console.log("logged out..");
            this.isAuthenticated = false;
            this.email = "";
            this.userProvider.userProfile = null;
            //this.nav.setRoot(this.signinPage)
            this.rootPage = SigninUpPage;
          }
      
    });

    // firebase.auth().onAuthStateChanged(user => {
    //   if(user){
    //     this.isAuthenticated = true;
    //     //this.email = user.email;
    //     this.rootPage = EventsPage;
    //     //this.nav.setRoot(this.tabsPage);
    //   }
    //   else{
    //     this.isAuthenticated = false;
    //     this.email = "";
    //     //this.nav.setRoot(this.signinPage)
    //     this.rootPage = SigninUpPage;
    //   }
    // });

    // this.rootPageProvider.getPage().subscribe(page => {
    //   if(page){
    //     this.nav.setRoot(EventsPage);
    //   }
    // });

    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      statusBar.styleDefault();
      splashScreen.hide();

      timer(3000).subscribe((() => this.showSplash = false ));

    });
  }

  onLoad(page: any){
    this.nav.setRoot(page);
    this.menuCtrl.close();
  }

  onLogout(){
   // this.afAuth.auth.signOut();
   //this.mProv.showYesNoConfirm('Log out?', , this.authProvider.logout)
   let confirm = this.alertCtrl.create({
    title: 'Log out?',
    subTitle: 'Are you sure you want to log out?',
    buttons: [
      {
        text: 'Yes',
        handler: () => {
          this.authProvider.logout();
        }
      },
      {
        text: 'No',
      }
    ]
  });
  confirm.present();
  this.menuCtrl.close();
  }






}
