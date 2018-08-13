import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Event, RepeatType } from '../../models/event';
import { AngularFireDatabase } from 'angularfire2/database';
import { AngularFireAuth } from 'angularfire2/auth';
import { UserProvider } from '../user/user';
import { of } from 'rxjs/observable/of';
//import { merge, mergeAll, combineAll } from rxjs/operators';'

import { from } from 'rxjs/observable/from';
import { forkJoin } from 'rxjs/observable/forkJoin';
//import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/combineLatest';
import { mergeAll } from 'rxjs/operator/mergeAll';
import { combineLatest } from 'rxjs/observable/combineLatest';
import { AngularFirestore, AngularFirestoreCollection } from 'angularfire2/firestore';
import { FirebaseApp } from 'angularfire2';
import { AttendanceRecord } from '../../models/attendance';
import { Observable } from 'rxjs';

@Injectable()
export class EventProvider {

  dbRef: any
  eventsCollection: AngularFirestoreCollection<Event>;
  defaultEventImage = 'assets/imgs/calendar.png';

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

  isEventAdmin(event: Event, userId = this.afAuth.auth.currentUser.uid, userEmail = this.afAuth.auth.currentUser.email): boolean {
    if (event.creatorId && event.creatorId === userId) {
      return true;
    }
    if (event.creatorEmail === userEmail) {
      return true;
    }
    return false;
  }

  //Create new event with admin & invitee subcollections. Add eventId to the User's admin list
  CreateNewEventAndSynchronizeWithUser(event: Event, newEventDocRef = this.fb.firestore().collection('events').doc()) {
    //var newEventDocRef = this.fb.firestore().collection('events').doc();
    let eventId = newEventDocRef.id;

    var newEventAdminDocRef = this.fb.firestore().doc(`events/${eventId}`).collection('users').doc('admin');//.set({ 'users': users })
    var newEventInviteeDocRef = this.fb.firestore().doc(`events/${eventId}`).collection('users').doc('invitee');
    var userAdminDocRef = this.fb.firestore().doc(`users/${this.afAuth.auth.currentUser.uid}`).collection('events').doc('admin');

    return this.fb.firestore().runTransaction(transaction => {
      return transaction.get(userAdminDocRef).then(userAdminDoc => {
        var userAdminEvents = userAdminDoc.data().events;
        userAdminEvents[eventId] = event.name;

        transaction.update(userAdminDocRef, { 'events': userAdminEvents });

        transaction.set(newEventDocRef, Object.assign({}, event));

        let users = {};
        users[this.afAuth.auth.currentUser.uid] = true;
        transaction.set(newEventAdminDocRef, { 'users': users });
        transaction.set(newEventInviteeDocRef, { 'users': {} });

      });
    });
  }

  getAllEvents(): Observable<Event[]> {
    let collection = this.afs.collection('events', ref => ref
      .where('isVisibleInPublicSearch', '==', true)
      .orderBy('name', 'asc'));
    return collection.snapshotChanges().map(changes => {
      return changes.map(action => {
        const data = action.payload.doc.data() as Event;
        data.id = action.payload.doc.id;
        return data;
      });
    });
  }

  getEventsWithFilter(collection: AngularFirestoreCollection<any>): Observable<Event[]> {
    return collection.snapshotChanges().map(changes => {
      return changes.map(action => {
        const data = action.payload.doc.data() as Event;
        data.id = action.payload.doc.id;
        return data;
      });
    });
  }

  getEventsByCategory(categoryName: string): Observable<Event[]> {
    let collection = this.afs.collection('events', ref => ref
      .orderBy('name', 'asc')
      .where('category', '==', categoryName)
      .where('isVisibleInPublicSearch', '==', true));
    return this.getEventsWithFilter(collection);
  }

  getEvent(id: string) {
    return this.afs.doc(`events/${id}`).snapshotChanges().map(action => {

      if (action.payload.exists === false) {
        return null;
      }
      else {
        const data = action.payload.data() as Event;
        data.id = action.payload.id;
        return data;
      }
    });
  }

  getInviteeUsersForEvent(event: Event) {
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

  getAdminUsersForEvent(event: Event) {
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


  addAttendanceRecord(event: Event, date: Date, userId: string = this.afAuth.auth.currentUser.uid) {
    let newRecord = new AttendanceRecord();
    newRecord.date = date;
    newRecord.userId = userId;

    let eventId = event.id;

    let recordId = userId + date.toISOString();

    var newRecordRef = this.fb.firestore().doc(`events/${eventId}`).collection('attendance').doc(recordId);
    return newRecordRef.set(Object.assign({}, newRecord));

    // return this.fb.firestore().batch((transaction => {
    //   // return transaction.get(newRecordRef).then(recordDoc => {
    //   //   var recordExists = recordDoc.data() != null;
    //   //   if(!recordExists){
    //   //     transaction.set(newRecordRef, Object.assign({}, newRecord));
    //   //   }
    //   // });
    //   return transaction.set(newRecordRef, Object.assign({}, newRecord));
    // });
  }

  deleteAttendanceRecord(event: Event, date: Date, userId: string = this.afAuth.auth.currentUser.uid) {
    let newRecord = new AttendanceRecord();
    newRecord.date = date;
    newRecord.userId = userId;

    let eventId = event.id;

    let recordId = userId + date.toISOString();

    var newRecordRef = this.fb.firestore().doc(`events/${eventId}`).collection('attendance').doc(recordId);
    return newRecordRef.delete();

    // return this.fb.firestore().batch((transaction => {
    //   // return transaction.get(newRecordRef).then(recordDoc => {
    //   //   var recordExists = recordDoc.data() != null;
    //   //   if(!recordExists){
    //   //     transaction.set(newRecordRef, Object.assign({}, newRecord));
    //   //   }
    //   // });
    //   return transaction.set(newRecordRef, Object.assign({}, newRecord));
    // });
  }

  getAttendanceRecordByEventAndDateAndUser(event: Event, date: Date, userId: string = this.afAuth.auth.currentUser.uid): Observable<AttendanceRecord> {
    let recordId = userId + date.toISOString();
    let doc = this.afs.doc(`events/${event.id}`).collection('attendance').doc(recordId)
    return doc.snapshotChanges().map(action => {
      if (action.payload.exists === false) {
        return null;
      }
      else {
        const data = action.payload.data() as AttendanceRecord;
        data.id = action.payload.id;
        return data;
      }
    });
  }

  getAttendanceRecordsByEventAndDateAndUser(event: Event, date: Date, userId: string = this.afAuth.auth.currentUser.uid) {

    let collection = this.afs.doc(`events/${event.id}`).collection('attendance', ref => ref
      .where('date', '==', date)
      .where('userId', '==', userId));

    return collection.snapshotChanges().map(changes => {
      return changes.map(action => {
        const data = action.payload.doc.data() as AttendanceRecord;
        data.id = action.payload.doc.id;
        return data;
      });
    });
  }

  getAttendanceRecordsByEventAndUser(event: Event, userId: string = this.afAuth.auth.currentUser.uid) {

    let collection = this.afs.doc(`events/${event.id}`).collection('attendance', ref => ref
      .where('userId', '==', userId));

    return collection.snapshotChanges().map(changes => {
      return changes.map(action => {
        const data = action.payload.doc.data() as AttendanceRecord;
        data.id = action.payload.doc.id;
        return data;
      });
    });
  }

  getAttendanceRecordsByEventAndDate(event: Event, date: Date) {

    let collection = this.afs.doc(`events/${event.id}`).collection('attendance', ref => ref
      .where('date', '==', date));

    return collection.snapshotChanges().map(changes => {
      return changes.map(action => {
        const data = action.payload.doc.data() as AttendanceRecord;
        data.id = action.payload.doc.id;
        return data;
      });
    });
  }


  // getEventsForAdmin()  {
  //   return this.userProvider.getCurrentUser().switchMap(user => {
  //     return from(user.eventAdminList).flatMap((event : string) => {
  //       return (this.getEvent(event).toArray());
  //     })
  //  });

  // }

  getEventsWithIds(idList): Observable<Event[]> {
    if(!idList || idList.length == 0)
      return of([]);
    return combineLatest(idList.map((eventId) => this.getEvent(eventId)));
  }



  updateEvent(event: Event) {
    var eventDocRef = this.fb.firestore().doc(`events/${event.id}`);
    return eventDocRef.update(event);
  }

  //delete event and its users and attedance subcollections
  deleteEvent(event: Event) {
    var batch = this.fb.firestore().batch();
    batch.delete(this.fb.firestore().doc(`events/${event.id}`));
    //batch.delete(this.fb.firestore().doc(`events/${event.id}`).collection('users').doc('admin'));
    //batch.delete(this.fb.firestore().doc(`events/${event.id}`).collection('users').doc('invitee'));
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

  desynchronizeInviteeWithEvent(userId: string = this.afAuth.auth.currentUser.uid, eventId: string) {
    var usersDocRef = this.fb.firestore().doc(`events/${eventId}`).collection('users').doc('invitee');
    var eventsDocRef = this.fb.firestore().doc(`users/${userId}`).collection('events').doc('invitee');
    var leaveRequestRef = this.fb.firestore().collection('leaveEventRequests').doc();

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
          transaction.set(leaveRequestRef, {'userId': userId, 'eventId': eventId});
        });
      });
    });

  }

  getNextEventDate(event: Event): Date {
    let today = new Date();
    if(event.allDay){
      today.setHours(0,0,0,0);
    }
    let start = new Date(event.starts);
    let nextDate = event.starts;

    if (event.repeat == RepeatType.Never) {
      return nextDate;
    }

    if (event.endRepeat != RepeatType.Never && event.endRepeatDate < today) {
      return event.starts;
    }

    while (nextDate < today) {
      switch (event.repeat) {
        case RepeatType.Day1: {
          nextDate = this.addDays(nextDate, 1);
          break;
        }
        case RepeatType.Week1: {
          nextDate = this.addDays(nextDate, 7);
          break;
        }
        case RepeatType.Week2: {
          nextDate = this.addDays(nextDate, 14);
          break;
        }
        case RepeatType.Month1: {
          nextDate = this.addMonths(nextDate, 1);
          break;
        }
        case RepeatType.Year1: {
          nextDate = this.addYears(nextDate, 1);
          break;
        }
      }
    }

    if (event.endRepeat != RepeatType.Never && nextDate > event.endRepeatDate) {
      return event.starts;
    }


    return nextDate;
  }

  getNextEventDateEnd(event: Event): Date {
    let nextDate = this.getNextEventDate(event);
    if(nextDate == null){
      return event.ends;
    }
    let diffInMs = Math.abs(new Date(event.ends).getTime() - new Date(event.starts).getTime());
    return this.addMinutes(nextDate, diffInMs / 60000);
  }



  getEventDates(event: Event, fromDate: Date, toDate: Date): Date[] {
    let result: Date[] = [];
    let nextDate = event.starts;
    
    if (event.repeat == RepeatType.Never) {
      return [nextDate];
    }
    if (event.endRepeat != RepeatType.Never && event.endRepeatDate < fromDate) {
      return [];
    }

    while (nextDate < toDate) {
      if (event.endRepeat != RepeatType.Never && nextDate > event.endRepeatDate) {
        return result;
      }
      if (nextDate >= fromDate && nextDate <= toDate) {
        result.push(nextDate);
      }
      switch (event.repeat) {
        case RepeatType.Day1: {
          nextDate = this.addDays(nextDate, 1);
          break;
        }
        case RepeatType.Week1: {
          nextDate = this.addDays(nextDate, 7);
          break;
        }
        case RepeatType.Week2: {
          nextDate = this.addDays(nextDate, 14);
          break;
        }
        case RepeatType.Month1: {
          nextDate = this.addMonths(nextDate, 1);
          break;
        }
        case RepeatType.Year1: {
          nextDate = this.addYears(nextDate, 1);
          break;
        }
      }

    }
    return result;
  }


  getDateWithoutTime(date: Date): Date {
    date.setHours(0, 0, 0, 0);
    return date;
  }

  addMinutes(date, minutes): Date {
    var result = new Date(date);
    result.setMinutes(result.getMinutes() + minutes);
    return result;
  }

  addDays(date, days): Date {
    var result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }
  addMonths(date, months): Date {
    var result = new Date(date);
    result.setMonth(result.getMonth() + months);
    return result;
  }

  addYears(date, years): Date {
    var result = new Date(date)
    result.setFullYear(result.getFullYear() + years);
    return result;
  }

  /* Convert a BOGUS ISO 8601 Local date string (with a Z) to a real ISO 8601 UTC date string.
 * localDateString should be of format:  YYYY-MM-DDTHH-mm-ss.sssZ
 */
  convertBogusISO8601LocalwZtoRealUTC(localDateString: string): string {
    const ISO_8601_UTC_REGEXP = /^(\d{4})(-\d{2})(-\d{2})T(\d{2})(\:\d{2}(\:\d{2}(\.\d{3})?)?)?Z$/;
    try {
      if (localDateString.match(ISO_8601_UTC_REGEXP)) {
        let utcDateString: string;
        let localDate: Date = new Date(localDateString);
        let tzOffset: number = new Date().getTimezoneOffset() * 60 * 1000;
        let newTime: number = localDate.getTime() + tzOffset;
        let utcDate: Date = new Date(newTime);
        utcDateString = utcDate.toJSON()
        return utcDateString;
      } else {
        // throw 'Incorrect BOGUS local ISO8601 date string';
      }
    }
    catch (err) {
      alert('Date string is formatted incorrectly: \n' + err);
    }
  }

  /* Convert a real ISO 8601 UTC date stringto a BOGUS ISO 8601 local date string (with a Z).
  * utcDateString should be of format:  YYYY-MM-DDTHH-mm-ss.sssZ
  */
  convertISO8601UTCtoBogusLocalwZ(utcDateString: string): string {
    const ISO_8601_UTC_REGEXP = /^(\d{4})(-\d{2})(-\d{2})T(\d{2})(\:\d{2}(\:\d{2}(\.\d{3})?)?)?Z$/;
    try {
      if (utcDateString.match(ISO_8601_UTC_REGEXP)) {
        let localDateString: string;
        let utcDate: Date = new Date(utcDateString);
        let tzOffset: number = new Date().getTimezoneOffset() * 60 * 1000;
        let newTime: number = utcDate.getTime() - tzOffset;
        let localDate: Date = new Date(newTime);
        localDateString = localDate.toJSON()
        return localDateString;
      } else {
        //throw 'Incorrect UTC ISO8601 date string';
      }
    }
    catch (err) {
      alert('Date string is formatted incorrectly: \n' + err);
    }
  }






}
