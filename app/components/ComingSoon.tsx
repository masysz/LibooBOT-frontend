import { ReactElement, FunctionComponent } from "react"
import CustomImage from "./ui/image";
import images from "@/public/images";

interface ComingSoonProps {

}

const ComingSoon: FunctionComponent<ComingSoonProps> = (): ReactElement => {
    return (
        <div className="my-8">
            <span className="w-56 h-56 relative block mb-3">
                <CustomImage src={images.splash} alt="Buffy" />
            </span>
            <h4 className="text-white font-normal text-xl text-center">Coming Soon</h4>
        </div>
    );
}

export default ComingSoon;