import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { EventQrcodePage } from './event-qrcode';

@NgModule({
  declarations: [
    EventQrcodePage,
  ],
  imports: [
    IonicPageModule.forChild(EventQrcodePage),
  ],
})
export class EventQrcodePageModule {}
