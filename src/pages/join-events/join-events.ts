import { Component, OnInit } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { PublicEventsPage } from '../public-events/public-events';
import { QrJoinEventPage } from '../qr-join-event/qr-join-event';
import { SearchEventsPage } from '../search-events/search-events';
import { ManageInvitesPage } from '../manage-invites/manage-invites';
import { InviteRequest } from '../../models/inviteRequest';
import { InviteRequestProvider } from '../../providers/invite-request/invite-request';
import { ISubscription } from 'rxjs/Subscription';
import { combineLatest } from 'rxjs/observable/combineLatest';
import { MessagingProvider } from '../../providers/messaging/messaging';
import { BarcodeScanner } from '@ionic-native/barcode-scanner';
import { EventProvider } from '../../providers/event/event';
import { SearchEventDetailPage } from '../search-event-detail/search-event-detail';
import { QRScanner } from '@ionic-native/qr-scanner';

@IonicPage()
@Component({
  selector: 'page-join-events',
  templateUrl: 'join-events.html',
})
export class JoinEventsPage implements OnInit {

  subscriptions: ISubscription [] = [];
  acceptedAndRejectedInvitesTotal: number = 0;

  searchEventsPage = SearchEventsPage;
  qrJoinEventPage = QrJoinEventPage;
  manageInvitesPage = ManageInvitesPage;

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    private inviteRequestProvider: InviteRequestProvider,
    private mProv: MessagingProvider,
    private barcodeScanner: BarcodeScanner,
    private eventProvider: EventProvider,
    private qrScanner: QRScanner
    ) {
  }

  ngOnInit(){
    var acceptedEvents$ = this.inviteRequestProvider.getInviteRequestsByUserAndType(undefined, 'accepted');
    var rejectedEvents$ = this.inviteRequestProvider.getInviteRequestsByUserAndType(undefined, 'rejected');
    var subs = combineLatest(acceptedEvents$, rejectedEvents$)
    .subscribe(([acceptedInvites, rejectedInvites]) => {
      this.acceptedAndRejectedInvitesTotal = acceptedInvites.length + rejectedInvites.length;
    });

    this.subscriptions.push(subs);
  }

  ngOnDestroy(): void {
    this.subscriptions.map(subscription => subscription.unsubscribe());
  }

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



}
