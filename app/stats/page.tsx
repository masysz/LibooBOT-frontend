import { FunctionComponent, ReactElement } from "react";
import StatsPage from "./StatsPage";

interface StatsProps {
    
}
 
const Stats: FunctionComponent<StatsProps> = ():ReactElement => {
    return ( 
        <StatsPage />
     );
}
 
export default Stats;