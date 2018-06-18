import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { QRScanner, QRScannerStatus } from '@ionic-native/qr-scanner';

/**
 * Generated class for the QrJoinEventPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-qr-join-event',
  templateUrl: 'qr-join-event.html',
})
export class QrJoinEventPage {

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    private qrScanner: QRScanner
  ) {
  }

  ionViewDidLoad() {
  }


  private scanQRCode() {
    this.qrScanner.prepare()
      .then((status: QRScannerStatus) => {
        if (status.authorized) {
          (window.document.querySelector('ion-app') as HTMLElement).classList.add('cameraView');

          // camera permission was granted
          // start scanning
          console.log('attempting to scan');
          let scanSub = this.qrScanner.scan().subscribe((text: string) => {
            console.log('Scanned something', text);
            this.qrScanner.hide(); // hide camera preview
            scanSub.unsubscribe(); // stop scanning
            (window.document.querySelector('ion-app') as HTMLElement).classList.remove('cameraView');

          });

          this.qrScanner.show()
          .then(_=> console.log('success scan'))
          .catch(_=> console.log('error scanning'));
        }
        else if (status.denied) {
          console.log('access denied');
          // camera permission was permanently denied
          // you must use QRScanner.openSettings() method to guide the user to the settings page
          // then they can grant the permission from there
        }
        else {
          console.log('access denied');
          // permission was denied, but not permanently. You can ask for permission again at a later time.
        }
      })
      .catch((e: any) => console.log('Error is', e));
  }
}
