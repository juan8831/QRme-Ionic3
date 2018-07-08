import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { InviteeAttendanceRecordPage } from './invitee-attendance-record';

@NgModule({
  declarations: [
    InviteeAttendanceRecordPage,
  ],
  imports: [
    IonicPageModule.forChild(InviteeAttendanceRecordPage),
  ],
})
export class InviteeAttendanceRecordPageModule {}
