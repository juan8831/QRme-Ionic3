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


@Injectable()
export class EventProvider {

  dbRef : any

  constructor(public http: HttpClient, 
    private afDB: AngularFireDatabase, 
    private afAuth: AngularFireAuth,
    private userProvider: UserProvider
  )  
    {
    this.dbRef = this.afDB.list('events');
    }

  addEvent(event: Event){
    //const userId = this.authProvider.getActiveUser().uid;
    //const url = 'https://qrme-65e1e.firebaseio.com' + '/event.json?';
    //+ 'auth=' + token;
    //return this.http.put(url, event );

    

    return this.dbRef.push(event);
    // var id = 'juan@gmail.com'.replace(/[.]/g, '%20');
    // return this.afDB.object(`/events/${id}`).set(event);


    //this.http.put()

  }

  getEvents() : Observable<Event[]>{
    

    return this.afDB.list('events')
    .snapshotChanges().map(changes => {
      return changes.map(action => {
        const data = action.payload.val() as Event;        
        data.id = action.payload.key
        return data;
      });
    });
  }

  getEventsByCategory(categoryName: string): Observable<Event[]>{
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
    return this.afDB.object(`events/${id}`).snapshotChanges().map(action => {

          const data = action.payload.val() as Event; 
          if(data != null){
            data.id = action.payload.key;
            return data;
          }
          else{
            return null;
          }
          //if(data == null) return null;       
          
        
      });
  }

  // getEventsForAdmin()  {
  //   return this.userProvider.getCurrentUser().switchMap(user => {
  //     return from(user.eventAdminList).flatMap((event : string) => {
  //       return (this.getEvent(event).toArray());
  //     })
  //  });

  // }

  getEventsForAdmin(idList) : Observable<Event[]>  {
   // var x : Observable<Event []>;
    // return combineLatest((this.userProvider.getCurrentUser())
    //   .mergeMap(user => from(Object.keys(user.eventAdminList)))
    //   .map((eventId) => this.getEvent(eventId)));
    return combineLatest(idList.map((eventId) => this.getEvent(eventId)));
    //   .mergeMap(user => from(Object.keys(user.eventAdminList)))
    //   .map((eventId) => this.getEvent(eventId)));
      
      //.map(event => event as Event)
      

      //.do(result => console.log(result));
      
      //return combineLatest(x);

    //.concat(user => from(Object.keys(user.eventAdminList)))
    //.do(result => console.log(result))
    //.mergeMap(eventId => this.getEvent(eventId));
    //.subscribe(event => console.log)


      // Object.keys(user.eventAdminList)

      // var list= [];
      // for(var event in user.eventAdminList)
      // {
      //   list.push(event);
      // }

      // return from(list).concatMap(event => this.getEvent(event)); 

      //return from(list);

      //user.eventAdminList.forEach(event => list.push(this.getEvent(event)));

      //return forkJoin(user.eventAdminList.map(event => this.getEvent(event)));
      //return from(user.eventAdminList).mergeMap(event => this.getEvent(event));   
      
     //(from(user.eventAdminList).flatMap(event => this.getEvent(event)).map(event => event as Event));

   

    // return this.userProvider.getCurrentUser()
    // .concatMap(user => from(user.eventAdminList)

  }

  updateEvent(event: Event){
    return this.dbRef.update(event.id, event);
  }

  deleteEvent(event: Event){
    return this.dbRef.remove(event.id);
  }

  


  

}
