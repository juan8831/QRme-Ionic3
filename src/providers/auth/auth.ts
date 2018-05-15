import { Injectable } from '@angular/core';
import firebase from 'firebase';

@Injectable()
export class AuthProvider {

  constructor() {}

  signup(email: string, password: string){
    return firebase.auth().createUserWithEmailAndPassword(email, password);
  }

  public signin(email: string, password: string){
    return firebase.auth().signInWithEmailAndPassword(email, password);
  }

  logout(){
    firebase.auth().signOut();
  }

  getEmail(){
    return firebase.auth().currentUser.email;
  }

  getActiveUser(){
    return firebase.auth().currentUser;
  }

}
