import { Component, OnInit, ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { Poll } from '../../models/poll';
import { Event } from '../../models/event';
import { PollProvider } from '../../providers/poll/poll';
import { ISubscription } from 'rxjs/Subscription';
import { MessagingProvider } from '../../providers/messaging/messaging';
import { AngularFireAuth } from 'angularfire2/auth';
import { Chart } from 'chart.js';
import { EventProvider } from '../../providers/event/event';
import { EditPollPage } from '../edit-poll/edit-poll';

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
  isAdminOrCreator = false;

  constructor
    (
    public navCtrl: NavController,
    public navParams: NavParams,
    private pollProvider: PollProvider,
    private mProv: MessagingProvider,
    private afAuth: AngularFireAuth,
    private eventProvider: EventProvider
    ) { }

  @ViewChild('doughnutCanvas') doughnutCanvas;


  doughnutChart: Chart;

  ngOnInit() {

    this.doughnutChart = new Chart(this.doughnutCanvas.nativeElement, {

      type: 'pie',
      data: {
        labels: [],
        datasets: [{
          data: [],
          backgroundColor: ["#3e95cd", "#8e5ea2", "#3cba9f", "#e8c3b9", "#c45850"],

        }],
      }

    });



    let poll: Poll = this.navParams.get('poll');
    this.event = this.navParams.get('event');
    let pollSubs = this.pollProvider.getPoll(poll.id).subscribe(poll => {
      if (poll) {
        this.poll = poll;
        this.doughnutChart.data.labels = this.poll.options.map(option => option.name);
        this.doughnutChart.data.datasets.forEach((dataset) => {
          dataset.data = this.poll.options.map(option => option.count);
        });
        this.doughnutChart.update();

        if (this.poll.creatorId === this.afAuth.auth.currentUser.uid) {
          this.isAdminOrCreator = true;
        }
      }
      else{
        this.mProv.showAlertOkMessage('Poll Deleted', 'The poll has been deleted.');
        this.navCtrl.pop();
        return;
      }
    });
    this.subscriptions.push(pollSubs);

    if (this.eventProvider.isEventAdmin(this.event, undefined, undefined)) {
      this.isAdminOrCreator = true;
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.map(subscription => subscription.unsubscribe());
  }

  async vote(option) {

    let loader = this.mProv.getLoader('Recording vote...');
    loader.present();

    let maxRetries = 5;
    let retryCount = 0;
    let voteSuccess = false;

    do {
      try {
        await this.sendVoteRequest(undefined, option);
        voteSuccess = true;
      }
      catch (err) {
        retryCount++;
      }
    }
    while (!voteSuccess && retryCount < maxRetries);

    loader.dismiss();

    if (voteSuccess) {
      this.mProv.showToastMessage('Vote successfully recorded');
    }
    else {
      this.mProv.showAlertOkMessage('Error', 'Could not record vote. Please try again later.');
      console.log('Could not record vote');
    }
  }

  sendVoteRequest(userId, option) {
    return this.pollProvider.vote(this.poll, userId, option);
  }

  hasVoted(option) {
    if (this.afAuth.auth.currentUser.uid in option.voteIds) {
      this.hasVotedInPoll = true;
      return true;
    }
    else {
      this.hasVoted;
    }

  }

  openEditPoll() {
    this.navCtrl.push(EditPollPage, { 'poll': this.poll, 'create': false });
  }

}
