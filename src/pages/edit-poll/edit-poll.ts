import { Component, OnInit } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController } from 'ionic-angular';
import { Poll } from '../../models/poll';
import { MessagingProvider } from '../../providers/messaging/messaging';
import { NgForm } from '@angular/forms';
import { AngularFireAuth } from 'angularfire2/auth';
import { UserProvider } from '../../providers/user/user';
import { Event } from '../../models/event';
import { PollProvider } from '../../providers/poll/poll';
import { ErrorProvider } from '../../providers/error/error';
import { ISubscription } from '../../../node_modules/rxjs/Subscription';

@IonicPage()
@Component({
  selector: 'page-edit-poll',
  templateUrl: 'edit-poll.html',
})
export class EditPollPage implements OnInit {

  event: Event;
  create = true;
  poll: Poll;
  pageName = 'EditPollPage';
  subscriptions: ISubscription [] = [];

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    private alertCtrl: AlertController,
    private mProv: MessagingProvider,
    private afAuth: AngularFireAuth,
    private userProvider: UserProvider,
    private pollProvider: PollProvider,
    private errorProvider: ErrorProvider
  ) {
    this.create = this.navParams.get('create');
  }

  ngOnInit(){
    if(this.create){
      this.poll = new Poll();
      this.poll.options = [];
      this.event = this.navParams.get('event');
    }
    else{
      let poll = this.navParams.get('poll');
      let subs = this.pollProvider.getPoll(poll.id)
      .subscribe(poll => {
        if(poll){
          this.poll = poll;
        }
        else{
          this.mProv.showAlertOkMessage('Error', "Poll has been deleted.");
          this.navCtrl.pop();
        }
      });
      this.subscriptions.push(subs);
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.map(subscription => subscription.unsubscribe());
  }

  showPollOptionPrompt(){
    const prompt = this.alertCtrl.create({
      title: 'New Poll Option',
      message: "Add new poll option",
      inputs: [
        {
          name: 'pollOptionName',
          placeholder: 'Option name'
        },
      ],
      buttons: [
        {
          text: 'Cancel',
        },
        {
          text: 'Save',
          handler: data => {
            //this.poll.options[data.pollOptionName] = 0;
            const optionName = data.pollOptionName;
            let option = {'name': optionName, 'count': 0, 'voteIds': {}}
            this.poll.options.push(option);
          }
        }
      ]
    });
    prompt.present();
  }

  deleteOption(index: number){
    this.poll.options.splice(index, 1);
  }

  onSubmit(f: NgForm){
    
    this.poll.name = f.value.name;

    if(this.poll.options.length < 2){
      this.mProv.showAlertOkMessage('Error', 'Poll must have at least 2 options');
      return;
    }

    let optionsName = [];
    let repeatedOptionName = false;
    this.poll.options.forEach(option => {
      if(optionsName.indexOf(option.name) != -1){
        this.mProv.showAlertOkMessage('Error', 'All poll option names must be unique.');
        repeatedOptionName = true;
      }
      optionsName.push(option.name);
    });

    if(repeatedOptionName){
      return;
    }

    if(this.create){    
      let loader = this.mProv.getLoader('Creating new poll...');
      loader.present();
     
      this.poll.date = new Date();
      this.poll.creatorId = this.afAuth.auth.currentUser.uid;
      this.poll.creatorName = this.userProvider.userProfile.name;
      this.poll.eventId = this.event.id;
      this.pollProvider.createPoll(this.poll)
      .then(_=> {
        loader.dismiss();
        this.mProv.showToastMessage('Successfully created poll!');
        this.navCtrl.pop();
      })
      .catch(err => {
        loader.dismiss();
        this.mProv.showAlertOkMessage('Error', 'Could not create poll');
        this.errorProvider.reportError(this.pageName, err, this.event.id, 'Could not create poll');
      });
    }
    else{
      let loader = this.mProv.getLoader('Updating poll...');
      loader.present();
      this.pollProvider.updatePoll(this.poll)
      .then(_=> {
        loader.dismiss();
        this.mProv.showToastMessage('Successfully updated poll!');
        this.navCtrl.pop();
      })
      .catch(err => {
        loader.dismiss();
        this.mProv.showAlertOkMessage('Error', 'Could not update poll');
        this.errorProvider.reportError(this.pageName, err, this.event.id, 'Could not update poll');
      });
    }
  }

  showDeleteConfirm(){

    let confirm = this.alertCtrl.create({
      title: 'Delete?',
      message: 'Are you sure you want to delete this poll?',
      buttons: [
        {
          text: 'Yes',
          handler: () => {
            this.deletePoll();
          }
        },
        {
          text: 'No',
        }
      ]
    });
    confirm.present();
  }

  deletePoll(){
    let loader = this.mProv.getLoader('Deleting poll...');
    loader.present();
    this.pollProvider.deletePoll(this.poll)
      .then(_ => {
        loader.dismiss();
        this.mProv.showToastMessage('Poll successfully deleted.');
        this.navCtrl.pop();
      })
      .catch(err => {
        loader.dismiss();
        this.mProv.showAlertOkMessage('Error', 'Could not delete poll. Please try again later.');
        this.errorProvider.reportError(this.pageName, err, this.event.id, 'Could not delete poll');
      })
  }

}
