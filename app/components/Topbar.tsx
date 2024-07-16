import { FunctionComponent, ReactElement, useContext } from "react";
import CustomImage from "./ui/image";
import Button from "./ui/button";
import { usePathname } from "next/navigation";
import { ApplicationContext, ApplicationContextData } from "../context/ApplicationContext";
import Link from "next/link";

interface TopbarProps {

}

const Topbar: FunctionComponent<TopbarProps> = (): ReactElement => {

    const pathname = usePathname();
    const { userProfileInformation } = useContext(ApplicationContext) as ApplicationContextData;

    return (
        <header className="flex flex-row items-center justify-between">
            {
                userProfileInformation ?
                    <>
                        <div className="flex flex-row items-center gap-3">
                            <span className="w-12 h-12 rounded-full overflow-hidden relative border-4 border-orange-400">
                                {/* <CustomImage src={images.avatar} alt="User" /> */}
                                {userProfileInformation.username && <CustomImage src={`https://placehold.co/300x300/8133F1/FFFFFF/png?text=${userProfileInformation.username[0].toUpperCase()}&font=Raleway`} alt="User" />}
                            </span>
                            <div>
                                <h3 className="text-xl font-semibold text-white">{userProfileInformation.username}</h3>
                                {/* <span className="text-sm text-slate-300">#{userProfileInformation.userId}</span> */}
                            </div>
                        </div>
                        <div>
                            {
                                pathname !== "/refer" &&
                                <Link
                                    className="text-white bg-orange-500 text-sm py-3 px-6 rounded-full hover:bg-primary-foreground hover:text:bg-primary font-semibold"
                                    href="/refer">
                                    Refer friends
                                </Link>
                            }
                            {/* <Button className="bg-orange-500 text-sm !font-semibold">Refer friends</Button> */}
                        </div>
                    </> : <Button className="bg-orange-500 text-base !font-semibold mx-auto w-full">Login</Button>
            }
        </header>
    );
}

export default Topbar;