import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

// Start writing Firebase Functions
// https://firebase.google.com/docs/functions/typescript

admin.initializeApp(functions.config().firebase);

//Unsubscribe all invitees
//delete attendance records
//delete invite request
//delete posts
//delete polls
//delete actual event
// unsubscribe admin done in client code
// delete picture done in client code
export const onEventDelete  = functions.firestore.document(`events/{messageId}`)
    .onDelete(async event => {
        const data = event.data();
        const eventId = event.id;
        console.log('eventId: ' + eventId);
        let eventUsersQuery = event.ref //admin.firestore().doc(`events/${eventId}`)
        .collection('users')
        .doc('invitee');

        try{
            let result = await eventUsersQuery.get();
            let usersList = [];
            console.log(result.data());
            if(result.data() != undefined || result.data() != null){
                usersList = Object.keys(result.data().users);
            } 
            console.log(`Found ${usersList.length} invitees.`);
            usersList.forEach(async user => {
                await removeEventFromUser(user, eventId)
                .then()
                .catch(err => console.log(err));
            });
        }        
        catch(err){
            console.log(err);  
        }

    
        await deleteEventComponent('posts', eventId);
        await deleteEventComponent('polls', eventId);
        await deleteEventComponent('inviteRequests', eventId);

        event.ref.collection('attendance').get()
        .then(queryResults => {
            console.log(`${queryResults.size} attendance records to delete.`);
            queryResults.forEach(record => {
                record.ref.delete()
                .then()
                .catch(err => {
                    console.log('unable to delete attendance record' + err);
                })
            });
        })
        .catch(err => console.log(err));

        try{
            await admin.firestore().doc(`events/${event.id}`).collection('users').doc('admin').delete();
            await admin.firestore().doc(`events/${event.id}`).collection('users').doc('invitee').delete();
        }
        catch(err){
            console.log(err);
        }
       
    });


async function removeEventFromUser(userId: string, eventId: string){
    var eventsDocRef = admin.firestore().doc(`users/${userId}`).collection('events').doc('invitee');
    var usersDocRef = admin.firestore().doc(`events/${eventId}`).collection('users').doc('invitee');

    console.log(`Starting transaction for user ${userId} with event ${eventId}`);
    await admin.firestore().runTransaction(transaction => {
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


}


async function deleteEventComponent(componentName: string, eventId: string) {
    let query = admin.firestore().collection(componentName).where('eventId', '==', eventId);
    
    try{
        var result = await query.get();
        console.log(`${result.size} ${componentName} found for event ${eventId}`);
        result.forEach(async doc => {
            await doc.ref.delete();
        });

    }
    catch(err){
        console.log(`Could not execute query: ${componentName}`)
    }
}

// export const deleteEvent = functions.firestore.document(`events/{messageId}`)
// .onDelete(event => {
//     console.log('starting event delete');

//     //

// })

