import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { EventQrcodePage } from './event-qrcode';
import { NgxQRCodeModule } from '../../../node_modules/ngx-qrcode2';

@NgModule({
  declarations: [
    EventQrcodePage,
  ],
  imports: [
    IonicPageModule.forChild(EventQrcodePage),
    NgxQRCodeModule
  ],
})
export class EventQrcodePageModule {}
