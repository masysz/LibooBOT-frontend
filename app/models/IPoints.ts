import { Task } from "../enums/ITask";

export interface PointsUpdateRequest {
    userId: string;
    points: number;
    task?: Task
}