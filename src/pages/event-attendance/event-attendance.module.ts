import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { EventAttendancePage } from './event-attendance';

@NgModule({
  declarations: [
    EventAttendancePage,
  ],
  imports: [
    IonicPageModule.forChild(EventAttendancePage),
  ],
})
export class EventAttendancePageModule {}
