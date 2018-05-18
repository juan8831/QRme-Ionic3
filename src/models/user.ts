export class User{
    id: string  //use email as id
    name: string
    eventAdminList? : string[]
    eventInviteeList?: string[]
    pendingInvitationList?: string[]
    //password on firebase
}