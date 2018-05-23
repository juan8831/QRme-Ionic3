import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { User } from '../../models/user';
import {AngularFireDatabase} from 'angularfire2/database';
import {AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from 'angularfire2/firestore';
import {Observable} from 'rxjs/observable';
import { AngularFireAuth } from 'angularfire2/auth';
import { GESTURE_REFRESHER } from 'ionic-angular';

@Injectable()
export class UserProvider {

  currentEmail: string;
  usersCollection: AngularFirestoreCollection<User>;
  userDoc: AngularFirestoreDocument<User>;
  users: Observable<User[]>;
  user: Observable<User>;
  userProfile : User = null;

  constructor(
    public http: HttpClient,
    private afDB: AngularFireDatabase,
    private afs: AngularFirestore,
    private afAuth: AngularFireAuth
  
  ) { 
    this.usersCollection = this.afs.collection('users', ref => ref.orderBy('name', 'asc'));
  }

  getUsers(): Observable<User[]>{
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
   addUser(user: User){
     return this.usersCollection.doc(user.id).set(Object.assign({}, user));
   }

   getUser(id: string): Observable<User>{
     this.userDoc = this.afs.doc<User>(`users/${id}`);
     if(id = null) return null;
     this.user = this.userDoc.snapshotChanges().map(action =>{
        if(action.payload.exists === false){
          return null;
        }
        else{
          const data = action.payload.data() as User;
          data.id = action.payload.id;
          return data;
        }
     });

     return this.user;  
   }

   updateUser(user: User){
     this.userDoc = this.afs.doc(`users/${user.id}`);
     return this.userDoc.update(user)
   }

   deleteUser(user: User){
    this.userDoc = this.afs.doc(`users/${user.id}`);
    this.userDoc.delete();
  }

  //get signed in user
  getCurrentUserObservable(): Observable<User>  { 
     return this.getUser(this.afAuth.auth.currentUser.email);
    //else
     // return this.getUser("joe@gmail.com");
  }

    getUserProfile() {
    return this.afAuth.authState.switchMap(user => {
      return this.getUser(user.uid);
    });

  }

    setUserProfile(){
      this.afAuth.authState.subscribe(user => {
        this.getUser(user.uid).subscribe(userProfile => this.userProfile = userProfile);
      });
    } 
   

   deleteEventForUser (userId: string, eventId: string){
     return this.getUser(userId).first().switchMap(user => {
        delete user.eventAdminList[eventId];
        return this.updateUser(user);   
    });

   // return promise;
  }

}
