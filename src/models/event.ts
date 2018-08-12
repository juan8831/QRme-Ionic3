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
    creatorEmail?: string
    creatorName: string
    category: string
    type: string
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
    allowInviteePosts: boolean
    allowInviteePolls: boolean;
    calculatedStart?: Date;
    
    constructor(){}
}