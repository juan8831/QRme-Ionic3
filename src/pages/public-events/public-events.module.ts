import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { PublicEventsPage } from './public-events';

@NgModule({
  declarations: [
    PublicEventsPage,
  ],
  imports: [
    IonicPageModule.forChild(PublicEventsPage),
  ],
})
export class PublicEventsPageModule {}
