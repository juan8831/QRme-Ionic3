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
admin.initializeApp(functions.config().firebase);
/*
Delete events subcollection under user
Delete all events that user was managing
Remove user from all events that he was invited to
*/
exports.onAccountDelete = functions.firestore.document(`users/{userId}`)
    .onDelete((userDoc) => __awaiter(this, void 0, void 0, function* () {
    const data = userDoc.data();
    const userId = userDoc.id;
    let managingEventIds = [];
    userDoc.ref.collection('events').doc('admin').get()
        .then(result => {
        managingEventIds = Object.keys(result.data().events);
        console.log(managingEventIds);
        managingEventIds.forEach((eventId) => __awaiter(this, void 0, void 0, function* () {
            yield admin.firestore().doc(`events/${eventId}`).delete();
            console.log(`Deleted admin event: ${eventId} | userId: ${userId}`);
        }));
    })
        .catch(err => {
        console.log(`Could not get managing event ids | userId: ${userId}`);
    });
    let invitedEventIds = [];
    userDoc.ref.collection('events').doc('invitee').get()
        .then(result => {
        invitedEventIds = Object.keys(result.data().events);
        console.log('Invite Ids: ' + invitedEventIds);
        invitedEventIds.forEach((eventId) => __awaiter(this, void 0, void 0, function* () {
            yield removeInviteeUserFromEvent(userId, eventId);
            console.log(`Deleted invitee event: ${eventId} | userId: ${userId}`);
        }));
    })
        .catch(err => {
        console.log(err + `Could not get invitee event ids | userId: ${userId}`);
    });
    //delete events subcollection
    try {
        yield userDoc.ref.collection('events').doc('admin').delete();
        yield userDoc.ref.collection('events').doc('invitee').delete();
        console.log(`deleted admin & invitee subcollection | userId: ${userId}`);
    }
    catch (err) {
        console.log(err + `could not delete admin & invitee subcollections for userId: ${userId}`);
    }
}));
/*
Unsubscribe all invitees
Unsubscribe admin

delete invite request
delete posts
delete polls
delete attendance records

delete event invitees & admin subcollections
delete event picture if any
*/
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
        console.log(result.data() + ` | eventId: ${eventId}`);
        if (result.data() != undefined || result.data() != null) {
            usersList = Object.keys(result.data().users);
        }
        console.log(`Found ${usersList.length} invitees. | eventId: ${eventId}`);
        usersList.forEach((userId) => __awaiter(this, void 0, void 0, function* () {
            yield removeEventIdFromUser(userId, eventId, 'invitee');
        }));
        yield removeEventIdFromUser(data.creatorId, eventId, 'admin');
        yield deleteEventComponent('posts', eventId);
        yield deleteEventComponent('polls', eventId);
        yield deleteEventComponent('inviteRequests', eventId);
        let queryResults = yield event.ref.collection('attendance').get();
        if (queryResults != null) {
            console.log(`${queryResults.size} attendance records to delete.`);
            queryResults.forEach((record) => __awaiter(this, void 0, void 0, function* () {
                yield record.ref.delete();
            }));
        }
        yield admin.firestore().doc(`events/${event.id}`).collection('users').doc('admin').delete();
        console.log(`Deleted admin from users subcollection | eventId: ${eventId}`);
        yield admin.firestore().doc(`events/${event.id}`).collection('users').doc('invitee').delete();
        console.log(`Deleted invitee from users subcollection | eventId: ${eventId}`);
        admin.storage().bucket().file(`eventPictures/${event.id}`).delete()
            .then(_ => {
            console.log('Deleted event picture');
        })
            .catch(err => {
            console.log(err);
        });
    }
    catch (err) {
        console.log(err);
    }
}));
/*
Delete all comments from post
*/
exports.onPostDelete = functions.firestore.document(`posts/{messageId}`)
    .onDelete((post) => __awaiter(this, void 0, void 0, function* () {
    try {
        let queryResults = yield post.ref.collection('comments').get();
        if (queryResults != null) {
            console.log(`${queryResults.size} comments to delete for post ${post.id}`);
            queryResults.forEach((record) => __awaiter(this, void 0, void 0, function* () {
                yield record.ref.delete();
            }));
        }
    }
    catch (err) {
        console.log(err + `| Could not delete comments for post ${post.id}`);
    }
}));
/*
- Delete all polls, posts, invite requests, attendance records,  that belong to user that left event
- Delete onLeaveRequest
-TODO: delete poll votes and comments
*/
exports.onLeaveRequestCreate = functions.firestore.document(`leaveEventRequests/{id}`)
    .onCreate((data) => __awaiter(this, void 0, void 0, function* () {
    let eventId = data.data().eventId;
    let userId = data.data().userId;
    console.log(`Processing onLeaveRequest for user: ${userId} | event: ${eventId}`);
    yield deleteEventComponentWithUserId('polls', 'creatorId', eventId, userId);
    yield deleteEventComponentWithUserId('posts', 'authorId', eventId, userId);
    yield deleteEventComponentWithUserId('inviteRequests', 'userId', eventId, userId);
    let attendanceQuery = admin.firestore().doc(`events/${eventId}`).collection('attendance').where('userId', '==', userId);
    try {
        var result = yield attendanceQuery.get();
        console.log(`${result.size} attendance records found for userId: ${userId} | event: ${eventId}`);
        result.forEach((doc) => __awaiter(this, void 0, void 0, function* () {
            yield doc.ref.delete();
        }));
    }
    catch (err) {
        console.log(`Could not execute query for attendance records for userId: ${userId} | event: ${eventId}`);
    }
    data.ref.delete()
        .then(() => console.log(`LeaveRequest deleted for userId: ${userId} | event: ${eventId}.`))
        .catch(err => {
        console.log(`Could not delete LeaveRequest userId: ${userId} | event: ${eventId}.` + err);
    });
}));
function removeEventIdFromUser(userId, eventId, mode) {
    return __awaiter(this, void 0, void 0, function* () {
        var eventsDocRef = admin.firestore().doc(`users/${userId}`).collection('events').doc(mode);
        try {
            yield admin.firestore().runTransaction(transaction => {
                return transaction.get(eventsDocRef).then(eventDoc => {
                    //delete event from user's events
                    var events = eventDoc.data().events;
                    delete events[eventId];
                    transaction.update(eventsDocRef, { 'events': events });
                });
            });
            console.log(`Removed event: ${eventId} from user: ${userId}, mode: ${mode}`);
        }
        catch (err) {
            console.log(err + `Could not remove event ${eventId} from user ${userId}`);
        }
    });
}
function removeInviteeUserFromEvent(userId, eventId) {
    return __awaiter(this, void 0, void 0, function* () {
        let usersDocRef = admin.firestore().doc(`events/${eventId}`).collection('users').doc('invitee');
        var leaveRequestRef = admin.firestore().collection('leaveEventRequests').doc();
        try {
            yield admin.firestore().runTransaction(transaction => {
                return transaction.get(usersDocRef).then(userDoc => {
                    //delete userId from event's invitee events
                    var users = userDoc.data().users;
                    delete users[userId];
                    transaction.update(usersDocRef, { 'users': users });
                    transaction.set(leaveRequestRef, { 'userId': userId, 'eventId': eventId });
                });
            });
            console.log(`Removed ${userId} from ${eventId} invitees`);
        }
        catch (err) {
            console.log(`Could not remove ${userId} from ${eventId} invitees`);
        }
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
            console.log(`Could not execute query/deletion: ${componentName}`);
        }
    });
}
function deleteEventComponentWithUserId(componentName, creatorProperty, eventId, userId) {
    return __awaiter(this, void 0, void 0, function* () {
        let query = admin.firestore().collection(componentName).where('eventId', '==', eventId).where(creatorProperty, '==', userId);
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
//# sourceMappingURL=index.js.map