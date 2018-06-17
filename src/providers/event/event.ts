import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Event } from '../../models/event';
import { AngularFireDatabase } from 'angularfire2/database';
import { AngularFireAuth } from 'angularfire2/auth';
import { UserProvider } from '../user/user';
import { of } from 'rxjs/observable/of';
//import { merge, mergeAll, combineAll } from 'rxjs/operators';

import { from } from 'rxjs/observable/from';
import { forkJoin } from 'rxjs/observable/forkJoin';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/combineLatest';
import { mergeAll } from 'rxjs/operator/mergeAll';
import { combineLatest } from 'rxjs/observable/combineLatest';
import { AngularFirestore, AngularFirestoreCollection } from 'angularfire2/firestore';
import { FirebaseApp } from 'angularfire2';

@Injectable()
export class EventProvider {

  dbRef: any
  eventsCollection: AngularFirestoreCollection<Event>;

  constructor(public http: HttpClient,
    private afDB: AngularFireDatabase,
    private afs: AngularFirestore,
    private afAuth: AngularFireAuth,
    private userProvider: UserProvider,
    private fb: FirebaseApp
  ) {
    this.dbRef = this.afDB.list('events');
    this.eventsCollection = this.afs.collection('events', ref => ref.orderBy('name', 'asc'));
  }

  //Create new event with admin & invitee subcollections. Add eventId to the User's admin list
  CreateNewEventAndSynchronizeWithUser(event: Event) {
      var newEventDocRef = this.fb.firestore().collection('events').doc();
      let eventId = newEventDocRef.id;
      
      var newEventAdminDocRef = this.fb.firestore().doc(`events/${eventId}`).collection('users').doc('admin');//.set({ 'users': users })
      var newEventInviteeDocRef = this.fb.firestore().doc(`events/${eventId}`).collection('users').doc('invitee');
      var userAdminDocRef = this.fb.firestore().doc(`users/${this.afAuth.auth.currentUser.uid}`).collection('events').doc('admin');

      return this.fb.firestore().runTransaction(transaction => {
        return transaction.get(userAdminDocRef).then(userAdminDoc => {
          var userAdminEvents = userAdminDoc.data().events;
          userAdminEvents[eventId] = event.name;
          
          transaction.update(userAdminDocRef, {'events': userAdminEvents});
          
          transaction.set(newEventDocRef, Object.assign({}, event));
          
          let users = {};
          users[this.afAuth.auth.currentUser.uid] = true;
          transaction.set(newEventAdminDocRef, { 'users': users });
          transaction.set(newEventInviteeDocRef, {'users': {}});

        });
      });
  }

  getAllEvents(): Observable<Event[]> {

    return this.eventsCollection.snapshotChanges().map(changes => {
      return changes.map(action => {
        const data = action.payload.doc.data() as Event;
        data.id = action.payload.doc.id;
        return data;
      });
    });
  }

  getEventsByCategory(categoryName: string): Observable<Event[]> {
    return this.afDB.list('events', ref => ref.orderByChild(`category`).equalTo(categoryName))
      .snapshotChanges().map(changes => {
        return changes.map(action => {
          const data = action.payload.val() as Event;
          data.id = action.payload.key
          return data;
        });
      });

  }

  getEvent(id: string) {
    return this.afs.doc(`events/${id}`).snapshotChanges().map(action => {

      if (action.payload.exists === false) {
        var nonExistentEvent = new Event();
        nonExistentEvent.id = id;
        nonExistentEvent.name = null;
        return nonExistentEvent;
      }
      else {
        const data = action.payload.data() as Event;
        data.id = action.payload.id;
        return data;
      }
    });
  }

  getInviteeUsersForEvent(event: Event){
    return this.afs.doc(`events/${event.id}`).collection('users').doc('invitee').snapshotChanges().map(action => {
      if (action.payload.exists === false) {
        return null;
      }
      else {
        const data = action.payload.data().users;
        //data.id = action.payload.id;
        return data;
      }
    });    
  }

  getAdminUsersForEvent(event: Event){
    return this.afs.doc(`events/${event.id}`).collection('users').doc('admin').snapshotChanges().map(action => {
      if (action.payload.exists === false) {
        return null;
      }
      else {
        const data = action.payload.data().users;
        //data.id = action.payload.id;
        return data;
      }
    });  
  }
  

  // getEventsForAdmin()  {
  //   return this.userProvider.getCurrentUser().switchMap(user => {
  //     return from(user.eventAdminList).flatMap((event : string) => {
  //       return (this.getEvent(event).toArray());
  //     })
  //  });

  // }

  getEventsForAdmin(idList): Observable<Event[]> {

    return combineLatest(idList.map((eventId) => this.getEvent(eventId)));

  }

  updateEvent(event: Event) {
    var eventDocRef = this.fb.firestore().doc(`events/${event.id}`);
    return eventDocRef.update(event);
  }

  //delete event and its users  subcollection
  deleteEvent(event: Event) {
    var batch = this.fb.firestore().batch();
    batch.delete(this.fb.firestore().doc(`events/${event.id}`));
    batch.delete(this.fb.firestore().doc(`events/${event.id}`).collection('users').doc('admin'));
    batch.delete(this.fb.firestore().doc(`events/${event.id}`).collection('users').doc('invitee'));
    return batch.commit();
   
  }

  addUserToInviteeList(userId: string, eventId: string) {
    var inviteeDocRef = this.fb.firestore().doc(`events/${eventId}`).collection('users').doc('invitee');
    return this.fb.firestore().runTransaction(transaction => {
      return transaction.get(inviteeDocRef).then(inviteeDoc => {
        var users = inviteeDoc.data().users;
        users[userId] = true;
        transaction.update(inviteeDocRef, { 'users': users });
      });
    });
  }

  synchronizeInviteeWithEvent(userId: string, eventId: string, eventName: string) {
    var usersDocRef = this.fb.firestore().doc(`events/${eventId}`).collection('users').doc('invitee');
    var eventsDocRef = this.fb.firestore().doc(`users/${userId}`).collection('events').doc('invitee');

    return this.fb.firestore().runTransaction(transaction => {
      return transaction.get(usersDocRef).then(userDoc => {
        return transaction.get(eventsDocRef).then(eventDoc => {

          //add userId to event's invitee events
          var users = userDoc.data().users;
          users[userId] = true;

          //add event to user's invitee events
          var events = eventDoc.data().events;
          events[eventId] = eventName;

          transaction.update(usersDocRef, { 'users': users });
          transaction.update(eventsDocRef, { 'events': events });
        });
      });
    });
  }

  desynchronizeInviteeWithEvent(userId: string, eventId: string) {
    var usersDocRef = this.fb.firestore().doc(`events/${eventId}`).collection('users').doc('invitee');
    var eventsDocRef = this.fb.firestore().doc(`users/${this.afAuth.auth.currentUser.uid}`).collection('events').doc('invitee');

    return this.fb.firestore().runTransaction(transaction => {
      return transaction.get(usersDocRef).then(userDoc => {
        return transaction.get(eventsDocRef).then(eventDoc => {

          //delete userId from event's invitee events
          var users = userDoc.data().users;
          delete users[userId];

          //delete event from user's invitee events
          var events = eventDoc.data().events;
          delete events[eventId];

          transaction.update(usersDocRef, { 'users': users });
          transaction.update(eventsDocRef, { 'events': events });
        });
      });
    });
  
  }





}
