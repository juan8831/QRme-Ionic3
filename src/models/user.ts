export class User{
    id: string  // auth uid
    name: string
    email: string
    eventAdminList : Object
    eventInviteeList: Object
    pendingInvitationList?: string[]
    //password on firebase
}