import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SearchEventDetailPage } from './search-event-detail';

@NgModule({
  declarations: [
    SearchEventDetailPage,
  ],
  imports: [
    IonicPageModule.forChild(SearchEventDetailPage),
  ],
})
export class SearchEventDetailPageModule {}
