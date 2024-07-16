import { FunctionComponent, ReactElement } from "react";
import BoostPage from "./BoostPage";

interface BoostProps {

}

const Boost: FunctionComponent<BoostProps> = (): ReactElement => {
    return (
        <BoostPage />
    );
}

export default Boost;