import { DateTime } from "ionic-angular";
import { User } from "./user";

export interface Attendance{
    id: string
    eventId: string 
    date?: DateTime
    attendees: User[]
    
}