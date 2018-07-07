import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { EventAttendanceAdminPage } from './event-attendance-admin';

@NgModule({
  declarations: [
    EventAttendanceAdminPage,
  ],
  imports: [
    IonicPageModule.forChild(EventAttendanceAdminPage),
  ],
})
export class EventAttendanceAdminPageModule {}
