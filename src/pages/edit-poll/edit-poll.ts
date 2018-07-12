import { Component, OnInit } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController } from 'ionic-angular';
import { Poll } from '../../models/poll';
import { MessagingProvider } from '../../providers/messaging/messaging';
import { NgForm } from '@angular/forms';
import { AngularFireAuth } from 'angularfire2/auth';
import { UserProvider } from '../../providers/user/user';
import { Event } from '../../models/event';
import { PollProvider } from '../../providers/poll/poll';

/**
 * Generated class for the EditPollPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-edit-poll',
  templateUrl: 'edit-poll.html',
})
export class EditPollPage implements OnInit {

  event: Event;
  create = true;
  poll: Poll;

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    private alertCtrl: AlertController,
    private mProv: MessagingProvider,
    private afAuth: AngularFireAuth,
    private userProvider: UserProvider,
    private pollProvider: PollProvider
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
      this.poll = this.navParams.get('post');
    }

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

    if(this.create){    
      let loader = this.mProv.getLoader('Creating new blog post...');
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
        console.log(err);
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
        console.log(err);
      });
    }
  }

  showDeleteConfirm(){

    let confirm = this.alertCtrl.create({
      title: 'Delete?',
      message: 'Are you sure you want to delete this blog post?',
      buttons: [
        {
          text: 'Yes',
          handler: () => {
            this.deletePost();
          }
        },
        {
          text: 'No',
        }
      ]
    });
    confirm.present();
  }

  deletePost(){
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
        console.log(err);
      })
  }

}
