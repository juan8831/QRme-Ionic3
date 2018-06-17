import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { EventInviteesPage } from './event-invitees';

@NgModule({
  declarations: [
    EventInviteesPage,
  ],
  imports: [
    IonicPageModule.forChild(EventInviteesPage),
  ],
})
export class EventInviteesPageModule {}
