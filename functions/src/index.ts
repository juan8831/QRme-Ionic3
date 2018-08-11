import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { user } from '../node_modules/firebase-functions/lib/providers/auth';

admin.initializeApp(functions.config().firebase);



/*
Delete events subcollection under user
Delete all events that user was managing 
Remove user from all events that he was invited to 
*/
export const onAccountDelete = functions.firestore.document(`users/{userId}`)
    .onDelete(async event => {
        const data = event.data();
        const userId = event.id;
        let managingEventIds = [];
        event.ref.collection('events').doc('admin').get()
            .then(result => {
                managingEventIds = Object.keys(result.data().events);
                console.log(managingEventIds);
                managingEventIds.forEach(async eventId => {
                    await admin.firestore().doc(`events/${eventId}`).delete();
                    console.log('Deleted event: ' + eventId);
                });
            })
            .catch(err => {
                console.log('Could not get managing event ids');
            });

        let invitedEventIds = [];
        event.ref.collection('events').doc('invitee').get()
            .then(result => {
                invitedEventIds = Object.keys(result.data().events);
                console.log('Invite Ids: ' + invitedEventIds);
                invitedEventIds.forEach(async eventId => {
                    await removeInviteeUserFromEvent(userId, eventId);
                })

            })
            .catch(err => {
                console.log('Could not get invitee event ids');
            });


        //delete events subcollection
        try {
            await event.ref.collection('events').doc('admin').delete();
            await event.ref.collection('events').doc('invitee').delete();
            console.log('deleted admin & invitee subcollection')
        }
        catch (err) {
            console.log(err);
        }
    });


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
export const onEventDelete = functions.firestore.document(`events/{messageId}`)
    .onDelete(async event => {
        const data = event.data();
        const eventId = event.id;
        console.log('eventId: ' + eventId);
        let eventUsersQuery = event.ref //admin.firestore().doc(`events/${eventId}`)
            .collection('users')
            .doc('invitee');

        try {
            let result = await eventUsersQuery.get();
            let usersList = [];
            console.log(result.data());
            if (result.data() != undefined || result.data() != null) {
                usersList = Object.keys(result.data().users);
            }
            console.log(`Found ${usersList.length} invitees.`);
            usersList.forEach(async userId => {
                await removeEventIdFromUser(userId, eventId, 'invitee')
            });

            await removeEventIdFromUser(data.creatorId, eventId, 'admin');

            await deleteEventComponent('posts', eventId);
            await deleteEventComponent('polls', eventId);
            await deleteEventComponent('inviteRequests', eventId);

            let queryResults = await event.ref.collection('attendance').get();
            if (queryResults != null) {
                console.log(`${queryResults.size} attendance records to delete.`);
                queryResults.forEach(async record => {
                    await record.ref.delete()
                });
            }
            await admin.firestore().doc(`events/${event.id}`).collection('users').doc('admin').delete();
            await admin.firestore().doc(`events/${event.id}`).collection('users').doc('invitee').delete();

            admin.storage().bucket().file(`eventPictures/${event.id}`).delete()
                .then(_ => {
                    console.log('Deleted event picture');
                })
                .catch(err => {
                    console.log(err);
                })
        }
        catch (err) {
            console.log(err);
        }
    });


/*
Delete all comments from post
*/
export const onPostDelete = functions.firestore.document(`posts/{messageId}`)
    .onDelete(async post => {
        let queryResults = await post.ref.collection('comments').get();
        if(queryResults != null){
            console.log(`${queryResults.size} comments to delete.`);
                queryResults.forEach(async record => {
                    await record.ref.delete()
                });
        }
    });



async function removeEventIdFromUser(userId: string, eventId: string, mode: string) {
    var eventsDocRef = admin.firestore().doc(`users/${userId}`).collection('events').doc(mode);
    await admin.firestore().runTransaction(transaction => {
        return transaction.get(eventsDocRef).then(eventDoc => {
            //delete event from user's events
            var events = eventDoc.data().events;
            delete events[eventId];
            transaction.update(eventsDocRef, { 'events': events });
        });
    });
    console.log(`Removed event: ${eventId} from user: ${userId}, mode: ${mode}`);
}

async function removeInviteeUserFromEvent(userId: string, eventId: string) {
    var usersDocRef = admin.firestore().doc(`events/${eventId}`).collection('users').doc('invitee');
    console.log(`Starting transaction for user ${userId} with event ${eventId}`);
    await admin.firestore().runTransaction(transaction => {
        return transaction.get(usersDocRef).then(userDoc => {
            //delete userId from event's invitee events
            var users = userDoc.data().users;
            delete users[userId];
            transaction.update(usersDocRef, { 'users': users });
        });
    });
    console.log(`Removed ${userId} from ${eventId} invitees`);

}


async function deleteEventComponent(componentName: string, eventId: string) {
    let query = admin.firestore().collection(componentName).where('eventId', '==', eventId);

    try {
        var result = await query.get();
        console.log(`${result.size} ${componentName} found for event ${eventId}`);
        result.forEach(async doc => {
            await doc.ref.delete();
        });

    }
    catch (err) {
        console.log(`Could not execute query: ${componentName}`)
    }
}