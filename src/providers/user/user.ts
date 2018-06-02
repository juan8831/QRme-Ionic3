import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { User } from '../../models/user';
import { AngularFireDatabase } from 'angularfire2/database';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from 'angularfire2/firestore';
import { Observable } from 'rxjs/observable';
import { AngularFireAuth } from 'angularfire2/auth';
import { GESTURE_REFRESHER } from 'ionic-angular';
import {FirebaseApp} from 'angularfire2';
import { DocumentData } from '@firebase/firestore-types';
import { Event } from '../../models/event';

@Injectable()
export class UserProvider {

  currentEmail: string;
  usersCollection: AngularFirestoreCollection<User>;
  userDoc: AngularFirestoreDocument<User>;
  users: Observable<User[]>;
  user: Observable<User>;
  userProfile: User = null;

  adminEventsList : Observable<any>;
  inviteeEventsList : Observable<any>;


  constructor(
    public http: HttpClient,
    private afDB: AngularFireDatabase,
    private afs: AngularFirestore,
    private afAuth: AngularFireAuth,
    private fb: FirebaseApp

  ) {
    this.usersCollection = this.afs.collection('users', ref => ref.orderBy('name', 'asc'));
    this.afAuth.authState.subscribe(user => {
      if(user){
        this.getUser(this.afAuth.auth.currentUser.uid).subscribe(user => {
          this.userProfile = user;
        });
      }
    });
  }

  

  getUsers(): Observable<User[]> {
    this.users = this.usersCollection.snapshotChanges().map(changes => {
      return changes.map(action => {
        const data = action.payload.doc.data() as User;
        data.id = action.payload.doc.id;
        return data;
      });
    });

    return this.users;
  }

  //set id as email
  addUser(user: User) {
    return this.usersCollection.doc(user.id).set(Object.assign({}, user))
      .then(_ => {
        return this.afs.doc(`users/${user.id}`).collection('events').doc('admin').set({ 'events': {} })
          .then(_ => {
            return this.afs.doc(`users/${user.id}`).collection('events').doc('invitee').set({ 'events': {} });
          });
      });
  }

  getAdminList(id: string): Observable<User> {
    this.userDoc = this.afs.doc(`users/${id}/eventAdminList`);
    if (id = null) return null;
    this.user = this.userDoc.snapshotChanges().map(action => {
      if (action.payload.exists === false) {
        return null;
      }
      else {
        const data = action.payload.data() as User;
        data.id = action.payload.id;
        return data;
      }
    });

    return this.user;
  }





  getUser(id: string): Observable<User> {
    this.userDoc = this.afs.doc<User>(`users/${id}`);
    if (id = null) return null;
    this.user = this.userDoc.snapshotChanges().map(action => {
      if (action.payload.exists === false) {
        return null;
      }
      else {
        const data = action.payload.data() as User;
        data.id = action.payload.id;
        return data;
      }
    });

    return this.user;
  }

  updateUser(user: User) {

    this.userDoc = this.afs.doc(`users/${user.id}`);
    return this.userDoc.update(user);
  }

  getEventAdminList() : Observable<DocumentData>  {
    var eventsDoc = this.afs.doc(`users/${this.afAuth.auth.currentUser.uid}`).collection('events').doc('admin');
    //if (id = null) return null;
    this.adminEventsList = eventsDoc.snapshotChanges().map(action => {
      if (action.payload.exists === false) {
        return null;
      }
      else {
        const data = action.payload.data();
        //data.id = action.payload.id;
        return data;
      }
    });

    return this.adminEventsList;

  }

  getEventInviteeList() : Observable<DocumentData> {
    var eventsDoc = this.afs.doc(`users/${this.afAuth.auth.currentUser.uid}`).collection('events').doc('invitee');
    //if (id = null) return null;
    return eventsDoc.snapshotChanges().map(action => {
      if (action.payload.exists === false) {
        return null;
      }
      else {
        const data = action.payload.data();
        //data.id = action.payload.id;
        return data;
      }
    });

  }

  updateEventAdminList(user: User) {
    this.afs.doc(`users/${user.id}`).collection('events').doc('admin').update({ 'events': user.eventAdminList });
  }

  updateEventInviteeList(user: User) {
    this.afs.doc(`users/${user.id}`).collection('events').doc('invitee').update({ 'events': user.eventInviteeList });
  }

  addEventToUserInviteeList(id: string){
    var inviteeDocRef = this.fb.firestore().doc(`users/${this.afAuth.auth.currentUser.uid}`).collection('events').doc('invitee');
    return this.fb.firestore().runTransaction(transaction => {
      return transaction.get(inviteeDocRef).then(inviteeDoc => {
        var events = inviteeDoc.data().events;
        events[id] = true;
        transaction.update(inviteeDocRef, {'events': events} );
      });
    });
  }

  addEventToUserAdminList(id: string, name: string) {
    var adminDocRef = this.fb.firestore().doc(`users/${this.afAuth.auth.currentUser.uid}`).collection('events').doc('admin');
    return this.fb.firestore().runTransaction(transaction => {
      return transaction.get(adminDocRef).then(adminDoc => {
        var events = adminDoc.data().events;
        events[id] = name;
        transaction.update(adminDocRef, {'events': events} );
      });
    });
  }






  deleteUser(user: User) {
    this.userDoc = this.afs.doc(`users/${user.id}`);
    this.userDoc.delete();
  }

  //get signed in user
  getCurrentUserObservable(): Observable<User> {
    return this.getUser(this.afAuth.auth.currentUser.uid);
  }

  getUserProfile() {
    return this.afAuth.authState.switchMap(user => {
      return this.getUser(user.uid);
    });

  }

  setUserProfile() {
    this.afAuth.authState.subscribe(user => {
      this.getUser(user.uid).subscribe(userProfile => this.userProfile = userProfile);
    });
  }


  deleteEventForUser(userId: string, eventId: string) {
    return this.getUser(userId).first().switchMap(user => {
      delete user.eventAdminList[eventId];
      return this.updateUser(user);
    });
  }

  deleteAdminEventsForUser(eventsToDelete: Event []) {
    var adminDocRef = this.fb.firestore().doc(`users/${this.afAuth.auth.currentUser.uid}`).collection('events').doc('admin');
    return this.fb.firestore().runTransaction(transaction => {
      return transaction.get(adminDocRef).then(adminDoc => {
        let events = adminDoc.data().events;
        eventsToDelete.map(event => delete events[event.id]);
        transaction.update(adminDocRef, {'events': events} );
      });
    });
  }

  deleteInviteeEventsForUser(eventsToDelete: Event []) {
    var inviteeDocRef = this.fb.firestore().doc(`users/${this.afAuth.auth.currentUser.uid}`).collection('events').doc('invitee');
    return this.fb.firestore().runTransaction(transaction => {
      return transaction.get(inviteeDocRef).then(inviteeDoc => {
        let events = inviteeDoc.data().events;
        eventsToDelete.map(event => delete events[event.id]);
        transaction.update(inviteeDocRef, {'events': events} );
      });
    });
  }

}
