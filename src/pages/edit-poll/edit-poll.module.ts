import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { EditPollPage } from './edit-poll';

@NgModule({
  declarations: [
    EditPollPage,
  ],
  imports: [
    IonicPageModule.forChild(EditPollPage),
  ],
})
export class EditPollPageModule {}
