import { User } from "./user";

export enum RepeatType{
    Never = 'Never',
    Day1 = "Repeats Once a Day",
    Week1 = 'Repeats Once a Week',
    Week2 = 'Repeats Every 2 Weeks',
    Month1 = 'Repeats Once a Month',
    Year1 = 'Repeats Once a Year',
}

export class Event{
    id: string
    name: string
    description?: string
    creatorId: string
    location?: string
    locationLat?: number
    locationLong?: number
    creator: string
    creatorName: string
    inviteeList : object //User[]
    adminList: object// User[]
    category: string
    type: string
    blogId?: string
    recurring?: boolean
    date: Date
    time: Date
    isVisibleInPublicSearch: boolean
    eventImageUrl: string
    allDay: boolean
    repeat: RepeatType
    endRepeat: string
    endRepeatDate: any
    starts: any
    ends: any
    allowManualAttendance: boolean
    minutesBeforeAttendance: number
    minutesAfterAttendance: number
    
    constructor(){}

    // constructor(name, description, location, recurring, type){
    //     this.name = name;
    //     this.description = description;
    //     this.location = location;
    //     this.recurring = recurring;
    //     this.type = type;
    // }

}