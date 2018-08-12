import { Component, OnInit } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController, ActionSheetController, ActionSheet } from 'ionic-angular';
import { SearchEventsPage } from '../search-events/search-events';
import { ManageInvitesPage } from '../manage-invites/manage-invites';
import { InviteRequestProvider } from '../../providers/invite-request/invite-request';
import { ISubscription } from 'rxjs/Subscription';
import { combineLatest } from 'rxjs/observable/combineLatest';
import { MessagingProvider } from '../../providers/messaging/messaging';
import { BarcodeScanner } from '@ionic-native/barcode-scanner';
import { EventProvider } from '../../providers/event/event';
import { SearchEventDetailPage } from '../search-event-detail/search-event-detail';
import { QRScanner } from '@ionic-native/qr-scanner';
import { ErrorProvider } from '../../providers/error/error';

@IonicPage()
@Component({
  selector: 'page-join-events',
  templateUrl: 'join-events.html',
})
export class JoinEventsPage implements OnInit {

  subscriptions: ISubscription[] = [];
  acceptedAndRejectedInvitesTotal: number = 0;

  searchEventsPage = SearchEventsPage;
  manageInvitesPage = ManageInvitesPage;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private inviteRequestProvider: InviteRequestProvider,
    private mProv: MessagingProvider,
    private barcodeScanner: BarcodeScanner,
    private eventProvider: EventProvider,
    private actionSheetCtrl: ActionSheetController,
    private errorProvider: ErrorProvider
  ) {
  }

  ngOnInit() {
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


  openSearchPage(mode: string) {
    if (mode == 'all') {
      this.navCtrl.push(SearchEventsPage, { category: 'all' });
      return;
    }

    let actionSheet = this.actionSheetCtrl.create({
      cssClass: 'categories-select',
      buttons: [
        {
          text: 'Ceremony',
          icon: 'ribbon',
          cssClass: 'ceremony-select',
          handler: () => {
            this.searchByCategory('ceremony', actionSheet);
            return false;
          }
        },
        {
          text: 'Education',
          icon: 'school',
          cssClass: 'education-select',
          handler: () => {
            this.searchByCategory('education', actionSheet);
            return false;
          }
        },
        {
          text: 'Conference',
          icon: 'contacts',
          cssClass: 'conference-select',
          handler: () => {
            this.searchByCategory('conference', actionSheet);
            return false;
          }
        },
        {
          text: 'Meeting',
          icon: 'briefcase',
          cssClass: 'meeting-select',
          handler: () => {
            this.searchByCategory('meeting', actionSheet);
            return false;
          }
        },
        {
          text: 'Sports',
          icon: 'football',
          cssClass: 'sports-select',
          handler: () => {
            this.searchByCategory('sports', actionSheet);
            return false;
          }
        },
        {
          text: 'Festival',
          icon: 'bonfire',
          cssClass: 'festival-select',
          handler: () => {
            this.searchByCategory('festival', actionSheet);
            return false;
          }
        },
        {
          text: 'Concert',
          icon: 'musical-note',
          cssClass: 'concert-select',
          handler: () => {
            this.searchByCategory('concert', actionSheet);
            return false;
          }
        },
        {
          text: 'Party',
          icon: 'headset',
          cssClass: 'party-select',
          handler: () => {
            this.searchByCategory('party', actionSheet);
            return false;
          }
        },
        {
          text: 'Other',
          icon: 'help',
          cssClass: 'other-select',
          handler: () => {
            this.searchByCategory('other', actionSheet);
            return false;
          }
        },
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'cancel-select',
          handler: () => {
          }
        }

      ]
    });
    actionSheet.present();
  }

  searchByCategory(category: string, actionSheet: ActionSheet) {
    let transition = actionSheet.dismiss();
    transition.then(() => this.navCtrl.push(SearchEventsPage, { category: category }));
  }

  private scanQRCode() {
    var loader = this.mProv.getLoader('Loading...');
    loader.present();
    this.barcodeScanner.scan({ disableSuccessBeep: true })
      .then(barcodeData => {
        loader.dismiss();
        if (!barcodeData.cancelled) {
          var eventLoader = this.mProv.getLoader('Getting event information...');
          eventLoader.present();
          this.eventProvider.getEvent(barcodeData.text).take(1).subscribe(event => {
            eventLoader.dismiss();
            if (event == null || event.name == null) {
              this.mProv.showAlertOkMessage('Error', 'Could not find any event with this QR code');
            }
            else {
              this.navCtrl.push(SearchEventDetailPage, { 'event': event });
            }
          })
        }
      })
      .catch(err => {
        loader.dismiss();
        if (err == 'Access to the camera has been prohibited; please enable it in the Settings app to continue.') {
          this.mProv.showAlertOkMessage('Error', err);
          //todo open only if user wants to change settings
          //this.qrScanner.openSettings();
        }
        else{
          this.mProv.showAlertOkMessage('Error', 'Could not scan QR Code');
          this.errorProvider.reportError('JoinEventsPage', err, undefined);
        }
      });
    loader.dismiss();

  }
}
