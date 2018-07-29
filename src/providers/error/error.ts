import { Injectable } from '@angular/core';
import { AngularFirestore } from '../../../node_modules/angularfire2/firestore';
import { Error } from '../../models/error';
import { AngularFireAuth } from '../../../node_modules/angularfire2/auth';

@Injectable()
export class ErrorProvider {

  constructor
  (
    private afs: AngularFirestore,
    private afAuth: AngularFireAuth
  ) { }

  reportError(pageName, error, eventId = "", extraInfo = "") {
    let newError = new Error();
    newError.pageName = pageName;
    newError.error = error.message ? error.message : '';
    newError.eventId = eventId;
    newError.extraInfo = extraInfo;
    newError.date = new Date();
    newError.userId = this.afAuth.auth.currentUser.uid;

    try {
      this.afs.collection('errors').add(Object.assign({}, newError));
    }
    catch (err) {
      console.log(err)
    }
  }

}
