import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { EventInvitationsPage } from './event-invitations';

@NgModule({
  declarations: [
    EventInvitationsPage,
  ],
  imports: [
    IonicPageModule.forChild(EventInvitationsPage),
  ],
})
export class EventInvitationsPageModule {}
