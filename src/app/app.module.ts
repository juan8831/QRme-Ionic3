import { NgModule, ErrorHandler } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { MyApp } from './app.component';

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { EventAttendancePage } from '../pages/event-attendance/event-attendance';
import { EventDetailPage } from '../pages/event-detail/event-detail';
import { EventsPage } from '../pages/events/events';
import { SigninUpPage } from '../pages/signin-up/signin-up';
import { SettingsPage } from '../pages/settings/settings';
import { EditEventPage } from '../pages/edit-event/edit-event';
import { EventProvider } from '../providers/event/event';

import { HttpClientModule } from '@angular/common/http'

import {AngularFireModule} from 'angularfire2';
import {AngularFireAuthModule} from 'angularfire2/auth';
import {AngularFireDatabaseModule} from 'angularfire2/database';
import { AngularFireStorageModule } from 'angularfire2/storage';
import { EventNewsPage } from '../pages/event-news/event-news';
import { EventBlogPage } from '../pages/event-blog/event-blog';
import { EventPollsPage } from '../pages/event-polls/event-polls';
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
import { ChangePasswordPage } from '../pages/change-password/change-password';
import { AboutPage } from '../pages/about/about';
import { ErrorProvider } from '../providers/error/error';
import { IonicStorageModule } from '@ionic/storage';
import { TutorialPage } from '../pages/tutorial/tutorial';
import { AboutPageModule } from '../pages/about/about.module';
import { EventAttendancePageModule } from '../pages/event-attendance/event-attendance.module';
import { EventDetailPageModule } from '../pages/event-detail/event-detail.module';
import { EventsPageModule } from '../pages/events/events.module';
import { SigninUpPageModule } from '../pages/signin-up/signin-up.module';
import { SettingsPageModule } from '../pages/settings/settings.module';
import { EditEventPageModule } from '../pages/edit-event/edit-event.module';
import { EventNewsPageModule } from '../pages/event-news/event-news.module';
import { EventBlogPageModule } from '../pages/event-blog/event-blog.module';
import { EventPollsPageModule } from '../pages/event-polls/event-polls.module';
import { JoinEventsPageModule } from '../pages/join-events/join-events.module';
import { SearchEventsPageModule } from '../pages/search-events/search-events.module';
import { SearchEventDetailPageModule } from '../pages/search-event-detail/search-event-detail.module';
import { ManageInvitesPageModule } from '../pages/manage-invites/manage-invites.module';
import { EventInviteesPageModule } from '../pages/event-invitees/event-invitees.module';
import { EventInvitationsPageModule } from '../pages/event-invitations/event-invitations.module';
import { SearchEventsCategoriesPageModule } from '../pages/search-events-categories/search-events-categories.module';
import { EditEventPicturePageModule } from '../pages/edit-event-picture/edit-event-picture.module';
import { EventQrcodePageModule } from '../pages/event-qrcode/event-qrcode.module';
import { EventAttendanceAdminPageModule } from '../pages/event-attendance-admin/event-attendance-admin.module';
import { EventAttendanceInstanceAdminPageModule } from '../pages/event-attendance-instance-admin/event-attendance-instance-admin.module';
import { InviteeAttendanceRecordPageModule } from '../pages/invitee-attendance-record/invitee-attendance-record.module';
import { EditPostPageModule } from '../pages/edit-post/edit-post.module';
import { EditCommentPageModule } from '../pages/edit-comment/edit-comment.module';
import { PostPageModule } from '../pages/post/post.module';
import { EditPollPageModule } from '../pages/edit-poll/edit-poll.module';
import { PollPageModule } from '../pages/poll/poll.module';
import { ForgotPasswordPageModule } from '../pages/forgot-password/forgot-password.module';
import { ChangePasswordPageModule } from '../pages/change-password/change-password.module';
import { TutorialPageModule } from '../pages/tutorial/tutorial.module';
import { PercentPipe } from '../../node_modules/@angular/common';
import { AppVersion } from '@ionic-native/app-version';
import { PrivacyPage } from '../pages/privacy/privacy';
import { PrivacyPageModule } from '../pages/privacy/privacy.module';

@NgModule({
  declarations: [
    MyApp
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
    ChartsModule,
    IonicStorageModule.forRoot(),
    AboutPageModule,
    EventAttendancePageModule,
    EventDetailPageModule,
    EventsPageModule,
    SigninUpPageModule,
    SettingsPageModule,
    EditEventPageModule,
    EventNewsPageModule,
    EventAttendancePageModule,
    EventBlogPageModule,
    EventPollsPageModule,
    JoinEventsPageModule,
    SearchEventsPageModule,
    SearchEventDetailPageModule,
    ManageInvitesPageModule,
    EventInviteesPageModule,
    EventInvitationsPageModule,
    SearchEventsCategoriesPageModule,
    EditEventPicturePageModule,
    EventQrcodePageModule,
    EventAttendanceAdminPageModule,
    EventAttendanceInstanceAdminPageModule,
    InviteeAttendanceRecordPageModule,
    EditPostPageModule,
    EditCommentPageModule,
    PostPageModule,
    EditPollPageModule,
    PollPageModule,
    ForgotPasswordPageModule,
    ChangePasswordPageModule,
    TutorialPageModule,
    PrivacyPageModule
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    EventAttendancePage,
    EventDetailPage,
    EventsPage,
    SigninUpPage,
    SettingsPage,
    EditEventPage,
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
    ForgotPasswordPage,
    ChangePasswordPage,
    AboutPage,
    TutorialPage,
    PrivacyPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    EventProvider,
    AuthProvider,
    UserProvider,
    MessagingProvider,
    InviteRequestProvider,
    BarcodeScanner,
    Camera,
    File,
    SocialSharing,
    BlogProvider,
    PollProvider,
    ErrorProvider,
    PercentPipe,
    AppVersion
  ]
})
export class AppModule {}
