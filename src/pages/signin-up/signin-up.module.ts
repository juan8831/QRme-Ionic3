import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SigninUpPage } from './signin-up';

@NgModule({
  declarations: [
    SigninUpPage,
  ],
  imports: [
    IonicPageModule.forChild(SigninUpPage),
  ],
})
export class SigninUpPageModule {}
