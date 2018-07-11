import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { PollPage } from './poll';

@NgModule({
  declarations: [
    PollPage,
  ],
  imports: [
    IonicPageModule.forChild(PollPage),
  ],
})
export class PollPageModule {}
