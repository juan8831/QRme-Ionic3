import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Poll } from '../../models/poll';
import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFirestore } from 'angularfire2/firestore';
import { UserProvider } from '../user/user';
import { FirebaseApp } from 'angularfire2';
import { Transaction } from '@firebase/firestore-types';


@Injectable()
export class PollProvider {


  constructor(
    private afs: AngularFirestore,
    private afAuth: AngularFireAuth,
    private userProvider: UserProvider,
    private fb: FirebaseApp

  ) {
  }

  getPoll(id: string){
    const pollDoc = this.afs.doc(`polls/${id}`);
    if (id = null) return null;
    return pollDoc.snapshotChanges().map(action => {
      if (action.payload.exists === false) {
        return null;
      }
      else {
        const data = action.payload.data() as Poll;
        data.id = action.payload.id;
        return data;
      }
    });
  }

  getPollsByEvent(eventId: string) {
    let pollCollection = this.afs.collection('polls', ref => ref
      .where('eventId', '==', eventId)
      .orderBy('date', 'asc'));
    return pollCollection.snapshotChanges().map(changes => {
      return changes.map(action => {
        const data = action.payload.doc.data() as Poll;
        data.id = action.payload.doc.id;
        return data;
      });
    });
  }

  createPoll(poll: Poll){
    const pollCollection = this.afs.collection<Poll>('polls');
    return pollCollection.add(Object.assign({}, poll));
  }

  deletePoll(poll: Poll){
    const pollDoc = this.afs.doc(`polls/${poll.id}`);
    return pollDoc.delete();
  }

  updatePoll(poll: Poll){
    const pollDoc = this.afs.doc(`polls/${poll.id}`);
    return pollDoc.update(Object.assign({}, poll));
  }

  vote(poll: Poll, userId = this.afAuth.auth.currentUser.uid, selectedOption) {

    var pollRef = this.fb.firestore().doc(`polls/${poll.id}`);
    return this.fb.firestore().runTransaction(transaction => {
      return transaction.get(pollRef).then(pollDoc => {
        let canVote = true;
        let updateOptions =  pollDoc.data().options;
        updateOptions.forEach((option: any) => {
          if(option.name === selectedOption.name){
            if(option.voteIds[userId] != true && canVote){
              option.voteIds[userId] = true;
              option.count++;
              canVote = false;
            }    
          }
          //delete vote from other options if the user previously voted
          else{
            if(option.voteIds[userId] == true){
              delete option.voteIds[userId];
              option.count--;;
            } 
          }
        });
        //pollDoc.data().options = options;
        transaction.update(pollRef, {options: updateOptions } );

      })
    });
   

  }

}
