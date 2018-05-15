import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Event } from '../../models/event';
import { AngularFireDatabase } from 'angularfire2/database';


@Injectable()
export class EventProvider {

  dbRef : any

  constructor(public http: HttpClient, private afDB: AngularFireDatabase) {
    this.dbRef = this.afDB.list('events');
  }

  addEvent(event: Event){
    //const userId = this.authProvider.getActiveUser().uid;
    const url = 'https://qrme-65e1e.firebaseio.com' + '/event.json?';
    //+ 'auth=' + token;
    //return this.http.put(url, event );

    return this.dbRef.push(event);


    //this.http.put()

  }

  getEvents(){
    return this.dbRef.snapshotChanges().map(changes => {
      return changes.map(action => {
        const data = action.payload.val() as Event;        
        data.id = action.payload.key
        return data;
      });
    });
  }

  updateEvent(event: Event){
    return this.dbRef.update(event.id, event);
  }

  deleteEvent(event: Event){
    return this.dbRef.remove(event.id);
  }


  

}
