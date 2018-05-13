import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { EventPollsPage } from './event-polls';

@NgModule({
  declarations: [
    EventPollsPage,
  ],
  imports: [
    IonicPageModule.forChild(EventPollsPage),
  ],
})
export class EventPollsPageModule {}
