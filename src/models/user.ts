export class User{
    id: string  //use email as id
    name: string
    eventAdminList : Object
    eventInviteeList: Object
    pendingInvitationList?: string[]
    //password on firebase
}