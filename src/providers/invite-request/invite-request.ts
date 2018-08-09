import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from 'angularfire2/firestore';
import { InviteRequest } from '../../models/inviteRequest';
import { Observable } from 'rxjs/observable';
import { AngularFireAuth } from 'angularfire2/auth';

@Injectable()
export class InviteRequestProvider {

  inviteRequestCollection: AngularFirestoreCollection<InviteRequest>;
  inviteRequestDoc: AngularFirestoreDocument<InviteRequest>;
  inviteRequests: Observable<InviteRequest[]>;
  inviteRequest: Observable<InviteRequest>;

  constructor(
    private afs: AngularFirestore,
    private afAuth: AngularFireAuth
  ) {
    this.inviteRequestCollection = this.afs.collection('inviteRequests', ref => ref.orderBy('requestDate', 'asc'));
  }

  createInviteRequest(inviteRequest: InviteRequest) {
    return this.inviteRequestCollection.add(Object.assign({}, inviteRequest));
  }

  updateInviteRequest(inviteRequest: InviteRequest){
    var inviteRequestDoc = this.afs.doc(`inviteRequests/${inviteRequest.id}`);
    return inviteRequestDoc.update(inviteRequest);
  }

  deleteInviteRequest(inviteRequest: InviteRequest){
    var inviteRequestDoc = this.afs.doc(`inviteRequests/${inviteRequest.id}`);
    return inviteRequestDoc.delete();
  }

  getInviteRequest(id: string) {
    if (id = null) return null;
    var inviteRequestDoc = this.afs.doc<InviteRequest>(`inviteRequests/${id}`);
    var inviteRequest = inviteRequestDoc.snapshotChanges().map(action => {
      if (action.payload.exists === false) {
        return null;
      }
      else {
        const data = action.payload.data() as InviteRequest;
        data.id = action.payload.id;
        return data;
      }
    });

    return inviteRequest;
  }

  getInviteRequestsByEvent(eventId: string): Observable<InviteRequest[]> {
    var inviteRequestsCollection = this.afs.collection('inviteRequests', ref => ref.where('eventId', '==', eventId).orderBy('requestDate', 'asc'));

    this.inviteRequests = inviteRequestsCollection.snapshotChanges().map(changes => {
      return changes.map(action => {
        const data = action.payload.doc.data() as InviteRequest;
        data.id = action.payload.doc.id;
        return data;
      });
    });

    return this.inviteRequests;
  }

  getAllInviteRequestsByUser(userId: string = this.afAuth.auth.currentUser.uid): Observable<InviteRequest[]> {
    var inviteRequestsCollection = this.afs.collection('inviteRequests', ref => ref.where('userId', '==', userId).orderBy('requestDate', 'asc'));

    this.inviteRequests = inviteRequestsCollection.snapshotChanges().map(changes => {
      return changes.map(action => {
        const data = action.payload.doc.data() as InviteRequest;
        data.id = action.payload.doc.id;
        return data;
      });
    });

    return this.inviteRequests;
  }

  getInviteRequestsByUserAndType(userId: string = this.afAuth.auth.currentUser.uid, requestStatus: string): Observable<InviteRequest[]> {
    var inviteRequestsCollection = this.afs.collection('inviteRequests', ref => 
    ref.where('userId', '==', userId).where('status', '==', requestStatus).orderBy('requestDate', 'asc'));

    this.inviteRequests = inviteRequestsCollection.snapshotChanges().map(changes => {
      return changes.map(action => {
        const data = action.payload.doc.data() as InviteRequest;
        data.id = action.payload.doc.id;
        return data;
      });
    });

    return this.inviteRequests;
  }

  getInviteRequestsByEventAndType(eventId: string, requestStatus: string): Observable<InviteRequest[]> {
    var inviteRequestsCollection = this.afs.collection('inviteRequests', ref => 
    ref.where('eventId', '==', eventId).where('status', '==', requestStatus).orderBy('requestDate', 'asc'));
    this.inviteRequests = inviteRequestsCollection.snapshotChanges().map(changes => {
      return changes.map(action => {
        const data = action.payload.doc.data() as InviteRequest;
        data.id = action.payload.doc.id;
        return data;
      });
    });

    return this.inviteRequests;
  }

  getInviteRequestByUserAndEvent(userId: string = this.afAuth.auth.currentUser.uid, eventId: string): Observable<InviteRequest[]> {
    var inviteRequestsCollection = this.afs.collection('inviteRequests', 
    ref => ref.where('userId', '==', userId).where('eventId', '==', eventId).orderBy('requestDate', 'asc'));

    this.inviteRequests = inviteRequestsCollection.snapshotChanges().map(changes => {
      return changes.map(action => {
        const data = action.payload.doc.data() as InviteRequest;
        data.id = action.payload.doc.id;
        return data;
      });
    });

    return this.inviteRequests;
  }



}
