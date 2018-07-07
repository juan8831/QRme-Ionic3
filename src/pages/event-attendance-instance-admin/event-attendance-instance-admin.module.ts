import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { EventAttendanceInstanceAdminPage } from './event-attendance-instance-admin';

@NgModule({
  declarations: [
    EventAttendanceInstanceAdminPage,
  ],
  imports: [
    IonicPageModule.forChild(EventAttendanceInstanceAdminPage),
  ],
})
export class EventAttendanceInstanceAdminPageModule {}
