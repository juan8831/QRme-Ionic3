import { Component, OnInit } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { Poll } from '../../models/poll';
import { Event } from '../../models/event';
import { PollProvider } from '../../providers/poll/poll';
import { ISubscription } from 'rxjs/Subscription';
import { MessagingProvider } from '../../providers/messaging/messaging';
import { AngularFireAuth } from 'angularfire2/auth';
import { retry } from 'rxjs/operator/retry';

@IonicPage()
@Component({
  selector: 'page-poll',
  templateUrl: 'poll.html',
})
export class PollPage implements OnInit {

  poll: Poll;
  event: Event;
  subscriptions: ISubscription[] = [];
  hasVotedInPoll = false;


  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    private pollProvider: PollProvider,
    private mProv: MessagingProvider,
    private afAuth: AngularFireAuth
  ) {
  }

  ngOnInit(){

    let poll : Poll = this.navParams.get('poll');
    this.event = this.navParams.get('event');
    let pollSubs = this.pollProvider.getPoll(poll.id).subscribe(poll => {
      if(poll){
        this.poll = poll;
        //if(this.poll.)
      }
    });
    this.subscriptions.push(pollSubs);
  }

  ngOnDestroy(): void {
    this.subscriptions.map(subscription => subscription.unsubscribe());    
  }
  
  async vote(option){

    let loader = this.mProv.getLoader('Recording vote...');
    loader.present();

    let maxRetries = 5;
    let retryCount = 0;
    let voteSuccess = false;

    do{
      try{
        await this.sendVoteRequest(undefined, option);
        voteSuccess = true;
      }
      catch(err){
        retryCount++;
      }
    }
    while(!voteSuccess && retryCount < maxRetries );

    loader.dismiss();
    
    if(voteSuccess){
      this.mProv.showToastMessage('Vote successfully recorded');
    }
    else{
      this.mProv.showAlertOkMessage('Error', 'Could not record vote. Please try again later.');
      console.log('Could not record vote');
    }

    
    // this.pollProvider.vote(this.poll, undefined, option )
    // .then(_=> {
    //   loader.dismiss();
    //   this.mProv.showToastMessage('Vote successfully recorded');
    // })
    // .catch(err => {
    //   loader.dismiss();
    //   this.mProv.showAlertOkMessage('Error', 'Could not record vote. Please try again later.');
    //   console.log(err);
    // })

  }

  sendVoteRequest(userId, option){
    return this.pollProvider.vote(this.poll, userId, option );
  }

  hasVoted(option){
    if(this.afAuth.auth.currentUser.uid in option.voteIds){
      this.hasVotedInPoll = true;
      return true;
    }
    else{
      this.hasVoted;
    }

  }

}
