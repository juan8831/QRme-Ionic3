import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { EditEventPicturePage } from './edit-event-picture';

@NgModule({
  declarations: [
    EditEventPicturePage,
  ],
  imports: [
    IonicPageModule.forChild(EditEventPicturePage),
  ],
})
export class EditEventPicturePageModule {}
