import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { QRScanner, QRScannerStatus } from '@ionic-native/qr-scanner';
import { BarcodeScanner } from '@ionic-native/barcode-scanner';
import { MessagingProvider } from '../../providers/messaging/messaging';
import { EventProvider } from '../../providers/event/event';
import { SearchEventDetailPage } from '../search-event-detail/search-event-detail';

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

  qrData = null;
  createdCode = null;
  scannedCode = null;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private qrScanner: QRScanner,
    private barcodeScanner: BarcodeScanner,
    private mProv: MessagingProvider,
    private eventProvider: EventProvider
  ) {
  }

  ionViewDidLoad() {
  }


  // private scanQRCode() {
  //   this.qrScanner.prepare()
  //     .then((status: QRScannerStatus) => {
  //       if (status.authorized) {
  //         (window.document.querySelector('ion-app') as HTMLElement).classList.add('cameraView');

  //         // camera permission was granted
  //         // start scanning
  //         console.log('attempting to scan');
  //         let scanSub = this.qrScanner.scan().subscribe((text: string) => {
  //           console.log('Scanned something', text);
  //           this.qrScanner.hide(); // hide camera preview
  //           scanSub.unsubscribe(); // stop scanning
  //           (window.document.querySelector('ion-app') as HTMLElement).classList.remove('cameraView');

  //         });

  //         this.qrScanner.show()
  //         .then(_=> console.log('success scan'))
  //         .catch(_=> console.log('error scanning'));
  //       }
  //       else if (status.denied) {
  //         console.log('access denied');
  //         // camera permission was permanently denied
  //         // you must use QRScanner.openSettings() method to guide the user to the settings page
  //         // then they can grant the permission from there
  //       }
  //       else {
  //         console.log('access denied');
  //         // permission was denied, but not permanently. You can ask for permission again at a later time.
  //       }
  //     })
  //     .catch((e: any) => console.log('Error is', e));
  // }

  private scanQRCode() {
    var loader = this.mProv.getLoader('Loading...');
    loader.present();
    this.barcodeScanner.scan({ disableSuccessBeep: true })
            .then(barcodeData => {
              loader.dismiss();
              console.log('scanned!');
              if(!barcodeData.cancelled){
                var eventLoader = this.mProv.getLoader('Getting event information...');
                eventLoader.present();
                this.eventProvider.getEvent(barcodeData.text).take(1).subscribe(event => {
                  eventLoader.dismiss();
                  if(event == null || event.name == null){
                    this.mProv.showAlertOkMessage('Error', 'Could not find any event with this QR code');
                  }
                  else{
                    this.navCtrl.push(SearchEventDetailPage, {event: event});
                  }
                })
              }
              
              this.scannedCode = barcodeData.text;
            })
            .catch(err => {
              loader.dismiss();
              console.log(err);
              if(err == 'Access to the camera has been prohibited; please enable it in the Settings app to continue.'){
                this.mProv.showAlertOkMessage('Error', err);
                //todo open only if user wants to change settings
                this.qrScanner.openSettings();
              }
              this.mProv.showAlertOkMessage('Error', 'Could not scan QR Code');
            });
      loader.dismiss();        

  }

  createCode() {
    this.createdCode = "JuanCamiloLopez";
  }
}
