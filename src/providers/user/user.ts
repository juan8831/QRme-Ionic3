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
import { combineLatest } from 'rxjs/observable/combineLatest';
import { of } from 'rxjs/observable/of';

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
    let subs$ = this.afAuth.authState.switchMap(user => {
      if(user){
      return this.getUser(user.uid);
      }
      else{
        return of(null);
      }
    })
    .catch(err => {
      return of(null);
    });
    subs$.subscribe(user => {
      if(user){
        this.userProfile = user;
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
    return this.userDoc.snapshotChanges().map(action => {
      if (action.payload.exists === false) {
        return null;
      }
      else {
        const data = action.payload.data() as User;
        data.id = action.payload.id;
        return data;
      }
    });
  }

  updateUser(user: User) {

    this.userDoc = this.afs.doc(`users/${user.id}`);
    return this.userDoc.update(user);
  }

  /*
  Get list of event ids that user is managing
  */
  getManagingEventIdsList() : Observable<DocumentData>  {
    if(!this.afAuth.auth.currentUser){
      return of(null);
    }
    var eventsDoc = this.afs.doc(`users/${this.afAuth.auth.currentUser.uid}`).collection('events').doc('admin');
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

  /*
  Get list of event ids for which user is invitee
  */
  getInvitedEventIdsList() : Observable<DocumentData> {
    if(!this.afAuth.auth.currentUser){
      return of(null);
    }
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

  deleteUser(userId: string) {
    this.userDoc = this.afs.doc(`users/${userId}`);
    return this.userDoc.delete();
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

  getUsersWithList(idList): Observable<User[]> {
    return combineLatest(idList.map((userId) => this.getUser(userId)));
  }

}
