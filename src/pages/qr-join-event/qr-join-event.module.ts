import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { QrJoinEventPage } from './qr-join-event';

@NgModule({
  declarations: [
    QrJoinEventPage,
  ],
  imports: [
    IonicPageModule.forChild(QrJoinEventPage),
  ],
})
export class QrJoinEventPageModule {}
