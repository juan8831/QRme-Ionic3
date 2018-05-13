export interface User{
    id: string
    name: string
    eventAdminList : Event[]
    eventInviteeList: Event[]
    pendingInvitationList: Event[]
    //password on firebase
}