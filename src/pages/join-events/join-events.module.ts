import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { JoinEventsPage } from './join-events';

@NgModule({
  declarations: [
    JoinEventsPage,
  ],
  imports: [
    IonicPageModule.forChild(JoinEventsPage),
  ],
})
export class JoinEventsPageModule {}
