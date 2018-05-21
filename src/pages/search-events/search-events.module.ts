import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SearchEventsPage } from './search-events';

@NgModule({
  declarations: [
    SearchEventsPage,
  ],
  imports: [
    IonicPageModule.forChild(SearchEventsPage),
  ],
})
export class SearchEventsPageModule {}
