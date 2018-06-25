import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { LoadingController, AlertController, ToastController } from 'ionic-angular';

/*
  Generated class for the MessagingProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class MessagingProvider {

  constructor(
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController
  ) {
  }

  showToastMessage(message: string){
    this.toastCtrl.create({message: message, duration: 4000}).present();
  }

  showAlertOkMessage(title: string, message: string ){
    let alert = this.alertCtrl.create({
      title: title,
      subTitle: message,
      buttons: ['OK']
    });
    alert.present();
  }

  getLoader(message: string){
    return this.loadingCtrl.create({ spinner: 'dots', content: message});
  }

  showYesNoConfirm(title: string, message: string, yesAction : () => void) {
    let confirm = this.alertCtrl.create({
      title: title,
      subTitle: message,
      buttons: [
        {
          text: 'Yes',
          handler: () => {
            yesAction();
          }
        },
        {
          text: 'No',
        }
      ]
    });
    confirm.present();
  }

}
