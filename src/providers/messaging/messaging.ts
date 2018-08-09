import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { LoadingController, AlertController, ToastController } from 'ionic-angular';

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

  getLoader(message: string, duration = 5000){
    if(duration == 0){
      return this.loadingCtrl.create({ spinner: 'dots', content: message});
    }
    return this.loadingCtrl.create({ spinner: 'dots', content: message, duration: duration });
  }
}
