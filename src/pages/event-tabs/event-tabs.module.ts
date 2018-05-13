import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { EventTabsPage } from './event-tabs';

@NgModule({
  declarations: [
    EventTabsPage,
  ],
  imports: [
    IonicPageModule.forChild(EventTabsPage),
  ],
})
export class EventTabsPageModule {}
