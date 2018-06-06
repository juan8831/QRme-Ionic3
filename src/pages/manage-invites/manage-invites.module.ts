import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ManageInvitesPage } from './manage-invites';

@NgModule({
  declarations: [
    ManageInvitesPage,
  ],
  imports: [
    IonicPageModule.forChild(ManageInvitesPage),
  ],
})
export class ManageInvitesPageModule {}
