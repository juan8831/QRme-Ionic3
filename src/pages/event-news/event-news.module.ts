import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { EventNewsPage } from './event-news';

@NgModule({
  declarations: [
    EventNewsPage,
  ],
  imports: [
    IonicPageModule.forChild(EventNewsPage),
  ],
})
export class EventNewsPageModule {}
