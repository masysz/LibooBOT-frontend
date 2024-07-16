import { FunctionComponent, ReactElement } from "react";
import TaskPage from "./TaskPage";

interface TaskProps {
    
}
 
const Task: FunctionComponent<TaskProps> = ():ReactElement => {
    return ( 
        <TaskPage />
     );
}
 
export default Task;