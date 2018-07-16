import { Injectable } from '@angular/core';
import firebase from 'firebase';
import { AngularFireAuth } from 'angularfire2/auth';

@Injectable()
export class AuthProvider {

  constructor(private afsAuth: AngularFireAuth) {}

  signup(email: string, password: string){
    return firebase.auth().createUserWithEmailAndPassword(email, password);
  }

  public signin(email: string, password: string){
    //return firebase.auth().signInWithEmailAndPassword(email, password);
    return this.afsAuth.auth.signInWithEmailAndPassword(email, password);
  }

  logout(){
    //firebase.auth().signOut();
    this.afsAuth.auth.signOut();
  }

  getEmail(){
   // return firebase.auth().currentUser.email;
   if(this.afsAuth.auth.currentUser){
    return this.afsAuth.auth.currentUser.email;
   }
   return "";
   
  }

  getActiveUser(){
    return firebase.auth().currentUser;
  }

}
