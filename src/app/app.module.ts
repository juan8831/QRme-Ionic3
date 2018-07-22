import { NgModule, ErrorHandler } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { MyApp } from './app.component';

import { AboutPage } from '../pages/about/about';
import { ContactPage } from '../pages/contact/contact';
import { HomePage } from '../pages/home/home';
import { TabsPage } from '../pages/tabs/tabs';

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { EventAttendancePage } from '../pages/event-attendance/event-attendance';
import { EventDetailPage } from '../pages/event-detail/event-detail';
import { EventsPage } from '../pages/events/events';
import { PublicEventsPage } from '../pages/public-events/public-events';
import { SigninUpPage } from '../pages/signin-up/signin-up';
import { SettingsPage } from '../pages/settings/settings';
import { EditEventPage } from '../pages/edit-event/edit-event';
import { EventProvider } from '../providers/event/event';

import { HttpClientModule } from '@angular/common/http'

import {AngularFireModule} from 'angularfire2';
import {AngularFireAuthModule} from 'angularfire2/auth';
import {AngularFireDatabaseModule} from 'angularfire2/database';
import { AngularFireStorageModule } from 'angularfire2/storage';
import { EventTabsPage } from '../pages/event-tabs/event-tabs';
import { EventNewsPage } from '../pages/event-news/event-news';
import { EventBlogPage } from '../pages/event-blog/event-blog';
import { EventPollsPage } from '../pages/event-polls/event-polls';
import { RootPageProvider } from '../providers/root-page/root-page';
import { SelectedEventProvider } from '../providers/selected-event/selected-event';
import { AuthProvider } from '../providers/auth/auth';
import { UserProvider } from '../providers/user/user';
import { AngularFirestore, AngularFirestoreModule } from 'angularfire2/firestore';
import { JoinEventsPage } from '../pages/join-events/join-events';
import { SearchEventsPage } from '../pages/search-events/search-events';
import { SearchEventDetailPage } from '../pages/search-event-detail/search-event-detail';
import { firebaseConfig } from '../environment';
import { MessagingProvider } from '../providers/messaging/messaging';
import { ManageInvitesPage } from '../pages/manage-invites/manage-invites';
import { InviteRequestProvider } from '../providers/invite-request/invite-request';
import { EventInviteesPage } from '../pages/event-invitees/event-invitees';
import { EventInvitationsPage } from '../pages/event-invitations/event-invitations';

import { QRScanner } from '@ionic-native/qr-scanner';
import {NgxQRCodeModule} from 'ngx-qrcode2';
import {BarcodeScanner} from '@ionic-native/barcode-scanner';
import { SearchEventsCategoriesPage } from '../pages/search-events-categories/search-events-categories';

import { Camera, CameraOptions } from '@ionic-native/camera';

import { File } from '@ionic-native/file';
import { EditEventPicturePage } from '../pages/edit-event-picture/edit-event-picture';
import { EventQrcodePage } from '../pages/event-qrcode/event-qrcode';

import { SocialSharing } from '@ionic-native/social-sharing';
import { EventAttendanceAdminPage } from '../pages/event-attendance-admin/event-attendance-admin';
import { EventAttendanceInstanceAdminPage } from '../pages/event-attendance-instance-admin/event-attendance-instance-admin';
import { InviteeAttendanceRecordPage } from '../pages/invitee-attendance-record/invitee-attendance-record';
import { EditPostPage } from '../pages/edit-post/edit-post';
import { EditCommentPage } from '../pages/edit-comment/edit-comment';
import { PostPage } from '../pages/post/post';
import { BlogProvider } from '../providers/blog/blog';
import { PollProvider } from '../providers/poll/poll';
import { EditPollPage } from '../pages/edit-poll/edit-poll';
import { PollPage } from '../pages/poll/poll';
import { ChartsModule } from 'ng2-charts';
import { ForgotPasswordPage } from '../pages/forgot-password/forgot-password';

@NgModule({
  declarations: [
    MyApp,
    AboutPage,
    ContactPage,
    HomePage,
    TabsPage,
    EventAttendancePage,
    EventDetailPage,
    EventsPage,
    PublicEventsPage,
    SigninUpPage,
    SettingsPage,
    EditEventPage,
    EventTabsPage,
    EventNewsPage,
    EventAttendancePage,
    EventBlogPage,
    EventPollsPage,
    JoinEventsPage,
    SearchEventsPage,
    SearchEventDetailPage,
    ManageInvitesPage,
    EventInviteesPage,
    EventInvitationsPage,
    SearchEventsCategoriesPage,
    EditEventPicturePage,
    EventQrcodePage,
    EventAttendanceAdminPage,
    EventAttendanceInstanceAdminPage,
    InviteeAttendanceRecordPage,
    EditPostPage,
    EditCommentPage,
    PostPage,
    EditPollPage,
    PollPage,
    ForgotPasswordPage
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp),
    HttpClientModule,
    AngularFireModule.initializeApp(firebaseConfig, 'qrME'),
    AngularFireDatabaseModule,
    AngularFireAuthModule,
    AngularFirestoreModule,
    AngularFireStorageModule,
    NgxQRCodeModule,
    ChartsModule
   // AngularFirestoreModule.enablePersistence()

  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    AboutPage,
    ContactPage,
    HomePage,
    TabsPage,
    EventAttendancePage,
    EventDetailPage,
    EventsPage,
    PublicEventsPage,
    SigninUpPage,
    SettingsPage,
    EditEventPage,
    EventTabsPage,
    EventNewsPage,
    EventAttendancePage,
    EventBlogPage,
    EventPollsPage,
    JoinEventsPage,
    SearchEventsPage,
    SearchEventDetailPage,
    ManageInvitesPage,
    EventInviteesPage,
    EventInvitationsPage,
    SearchEventsCategoriesPage,
    EditEventPicturePage,
    EventQrcodePage,
    EventAttendanceAdminPage,
    EventAttendanceInstanceAdminPage,
    InviteeAttendanceRecordPage,
    EditPostPage,
    EditCommentPage,
    PostPage,
    EditPollPage,
    PollPage,
    ForgotPasswordPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    EventProvider,
    RootPageProvider,
    SelectedEventProvider,
    AuthProvider,
    UserProvider,
    MessagingProvider,
    InviteRequestProvider,
    QRScanner,
    BarcodeScanner,
    Camera,
    File,
    SocialSharing,
    BlogProvider,
    PollProvider
  ]
})
export class AppModule {}
