export class InviteRequest{
    id?: string
    requestedBy: string   //user or event admin
    requestDate: Date
    eventId : string
    eventName: string
    userId: string
    userName: string
    status: string  //pending, rejected, accepted
}