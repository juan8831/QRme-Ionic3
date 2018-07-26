"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const functions = require("firebase-functions");
const admin = require("firebase-admin");
// Start writing Firebase Functions
// https://firebase.google.com/docs/functions/typescript
admin.initializeApp(functions.config().firebase);
/*
Delete events subcollection under user
Delete all events that user was managing
Remove user from all events that he was invited to
*/
exports.onAccountDelete = functions.firestore.document(`users/{userId}`)
    .onDelete((event) => __awaiter(this, void 0, void 0, function* () {
    const data = event.data();
    const userId = event.id;
    let managingEventIds = [];
    event.ref.collection('events').doc('admin').get()
        .then(result => {
        managingEventIds = Object.keys(result.data().events);
        console.log(managingEventIds);
        managingEventIds.forEach((eventId) => __awaiter(this, void 0, void 0, function* () {
            yield admin.firestore().doc(`events/${eventId}`).delete();
            console.log('Deleted event: ' + eventId);
        }));
    })
        .catch(err => {
        console.log('Could not get managing event ids');
    });
    let invitedEventIds = [];
    event.ref.collection('events').doc('invitee').get()
        .then(result => {
        invitedEventIds = Object.keys(result.data().events);
        console.log('Invite Ids: ' + invitedEventIds);
        invitedEventIds.forEach((eventId) => __awaiter(this, void 0, void 0, function* () {
            yield removeInviteeUserFromEvent(userId, eventId);
        }));
    })
        .catch(err => {
        console.log('Could not get invitee event ids');
    });
    //delete events subcollection
    try {
        yield event.ref.collection('events').doc('admin').delete();
        yield event.ref.collection('events').doc('invitee').delete();
        console.log('deleted admin & invitee subcollection');
    }
    catch (err) {
        console.log(err);
    }
}));
//Unsubscribe all invitees
//delete attendance records
//delete invite request
//delete posts
//delete polls
//delete actual event
// unsubscribe admin done in client code
// delete picture done in client code, but will be done here instead
exports.onEventDelete = functions.firestore.document(`events/{messageId}`)
    .onDelete((event) => __awaiter(this, void 0, void 0, function* () {
    const data = event.data();
    const eventId = event.id;
    console.log('eventId: ' + eventId);
    let eventUsersQuery = event.ref //admin.firestore().doc(`events/${eventId}`)
        .collection('users')
        .doc('invitee');
    try {
        let result = yield eventUsersQuery.get();
        let usersList = [];
        console.log(result.data());
        if (result.data() != undefined || result.data() != null) {
            usersList = Object.keys(result.data().users);
        }
        console.log(`Found ${usersList.length} invitees.`);
        usersList.forEach((user) => __awaiter(this, void 0, void 0, function* () {
            yield removeEventFromUser(user, eventId)
                .then()
                .catch(err => console.log(err));
        }));
    }
    catch (err) {
        console.log(err);
    }
    yield deleteEventComponent('posts', eventId);
    yield deleteEventComponent('polls', eventId);
    yield deleteEventComponent('inviteRequests', eventId);
    event.ref.collection('attendance').get()
        .then(queryResults => {
        console.log(`${queryResults.size} attendance records to delete.`);
        queryResults.forEach(record => {
            record.ref.delete()
                .then()
                .catch(err => {
                console.log('unable to delete attendance record' + err);
            });
        });
    })
        .catch(err => console.log(err));
    try {
        yield admin.firestore().doc(`events/${event.id}`).collection('users').doc('admin').delete();
        yield admin.firestore().doc(`events/${event.id}`).collection('users').doc('invitee').delete();
    }
    catch (err) {
        console.log(err);
    }
    admin.storage().bucket().file(`eventPictures/${event.id}`).delete()
        .then(_ => {
        console.log('Deleted event picture');
    })
        .catch(err => {
        console.log(err);
    });
}));
function removeEventFromUser(userId, eventId) {
    return __awaiter(this, void 0, void 0, function* () {
        var eventsDocRef = admin.firestore().doc(`users/${userId}`).collection('events').doc('invitee');
        var usersDocRef = admin.firestore().doc(`events/${eventId}`).collection('users').doc('invitee');
        console.log(`Starting transaction for user ${userId} with event ${eventId}`);
        yield admin.firestore().runTransaction(transaction => {
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
                });
            });
        });
        console.log(`Desynced ${userId} from ${eventId}`);
    });
}
function removeInviteeUserFromEvent(userId, eventId) {
    return __awaiter(this, void 0, void 0, function* () {
        var usersDocRef = admin.firestore().doc(`events/${eventId}`).collection('users').doc('invitee');
        console.log(`Starting transaction for user ${userId} with event ${eventId}`);
        yield admin.firestore().runTransaction(transaction => {
            return transaction.get(usersDocRef).then(userDoc => {
                //delete userId from event's invitee events
                var users = userDoc.data().users;
                delete users[userId];
                transaction.update(usersDocRef, { 'users': users });
            });
        });
        console.log(`Removed ${userId} from ${eventId} invitees`);
    });
}
function deleteEventComponent(componentName, eventId) {
    return __awaiter(this, void 0, void 0, function* () {
        let query = admin.firestore().collection(componentName).where('eventId', '==', eventId);
        try {
            var result = yield query.get();
            console.log(`${result.size} ${componentName} found for event ${eventId}`);
            result.forEach((doc) => __awaiter(this, void 0, void 0, function* () {
                yield doc.ref.delete();
            }));
        }
        catch (err) {
            console.log(`Could not execute query: ${componentName}`);
        }
    });
}
// export const deleteEvent = functions.firestore.document(`events/{messageId}`)
// .onDelete(event => {
//     console.log('starting event delete');
//     //
// })
//# sourceMappingURL=index.js.map