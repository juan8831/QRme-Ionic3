import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SearchEventsCategoriesPage } from './search-events-categories';

@NgModule({
  declarations: [
    SearchEventsCategoriesPage,
  ],
  imports: [
    IonicPageModule.forChild(SearchEventsCategoriesPage),
  ],
})
export class SearchEventsCategoriesPageModule {}
