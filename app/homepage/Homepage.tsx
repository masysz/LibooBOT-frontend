"use client"
import { ReactElement, FunctionComponent, useState, useContext, useMemo, useEffect, useCallback } from "react"
import images from "@/public/images";
import { AnimatePresence, motion } from "framer-motion"
import CustomImage from "../components/ui/image";
import { Icons } from "../components/ui/icons";
import { metrics } from "../constants/userMetrics";
import { ApplicationContext, ApplicationContextData } from "../context/ApplicationContext";
import { useUpdateUserPoints } from "../api/apiClient";
import { PointsUpdateRequest } from "../models/IPoints";
import { Metrics } from "../enums/IMetrics";
import { sessionLimit } from "../constants/user";

interface HomepageProps {

}

const Homepage: FunctionComponent<HomepageProps> = (): ReactElement => {

    const updateUserPoints = useUpdateUserPoints();

    const {
        userProfileInformation, fetchUserProfileInformation, updateUserProfileInformation,
        timesClickedPerSession, updateTimesClickedPerSession,
    } = useContext(ApplicationContext) as ApplicationContextData;

    const [taps, setTaps] = useState<number>(0);
    const [isBoostTimeRetrieved, setIsBoostTimeRetrieved] = useState(false);

    async function handleUpdateUserPoints() {

        // construct the data 
        const data: PointsUpdateRequest = {
            userId: userProfileInformation?.userId as string,
            points: taps
        };

        await updateUserPoints(data)
            .then(() => {
                // console.log(response);
                fetchUserProfileInformation();
            })
            .catch((error) => {
                console.error(error);
            });
    };

    useMemo(() => {
        if (userProfileInformation) {
            setTaps(userProfileInformation.points ?? 0);
        }
    }, [userProfileInformation]);

    const DEBOUNCE_DELAY = 1000; // Adjust the delay as needed

    useEffect(() => {
        if (taps === 0) return;

        const timer = setTimeout(() => {
            handleUpdateUserPoints();
        }, DEBOUNCE_DELAY);

        return () => {
            clearTimeout(timer);
        };
    }, [taps]);

    // // const DEBOUNCE_DELAY_FOR_SESSION = 32400; // Delay for 3 clicks for 3hrs
    // const DEBOUNCE_DELAY_FOR_SESSION = 10800; // Delay for 1 click for 3hrs

    // // Use a hook to update the timesClickedPerSession back to zero after the user has stopped clicking. Decrement the timesclickedpersession by 3 till the limit is reached
    // useEffect(() => {

    //     if (sessionLimit - timesClickedPerSession >= sessionLimit || timesClickedPerSession <= 0) {
    //         // reset the state
    //         setTimesClickedPerSession(0);
    //         return;
    //     };

    //     const timer = setTimeout(() => {
    //         // Decrement the timesClickedPerSession by 3
    //         setTimesClickedPerSession(timesClickedPerSession - 1);
    //     }, DEBOUNCE_DELAY_FOR_SESSION);

    //     // save the timesClickedPerSession to the session storage
    //     sessionStorage.setItem(StorageKeys.TimesClickedPerSession, timesClickedPerSession.toString());

    //     return () => {
    //         clearTimeout(timer);
    //     };
    // }, [timesClickedPerSession]);

    function swapColorBasedOnStatus() {
        if (metrics(taps)?.status === Metrics.NOOB) {
            return "text-green-500/60";
        } else if (metrics(taps)?.status === Metrics.BEGINNER) {
            return "text-yellow-400/60";
        } else if (metrics(taps)?.status === Metrics.INTERMEDIATE) {
            return "text-red-200/60";
        } else if (metrics(taps)?.status === Metrics.PRO) {
            return "text-blue-300/60";
        } else if (metrics(taps)?.status === Metrics.MASTER) {
            return "text-purple-300/60";
        } else if (metrics(taps)?.status === Metrics.LEGEND) {
            return "text-white/60";
        }
    };
    const [isClicked, setIsClicked] = useState(false);
    // useMemo(() => {
    //     if (isClicked) {
    //         setIsClicked(false);
    //     } 
    // }, [isClicked])

    // async function _handleUpdateBoostRefillEndTime(endTime: Date) {
    //     await updateBoostRefillEndTime({ username: userProfileInformation?.username as string, refillEndTime: endTime })
    //         .then((response) => {
    //             console.log("Boost refill time updated", response);
    //         })
    //         .catch((error) => {
    //             console.error("Error updating boost refill time", error);
    //         });
    // };

    return (
        <main className="flex min-h-screen flex-col items-center py-20 pb-32 select-none">
            {
                userProfileInformation &&
                <>
                    <div className="flex flex-col items-center mb-12">
                        <div className="flex flex-row gap-2 items-center">
                            <span className="w-7 h-7 relative grid place-items-center">
                                <CustomImage src={images.coin} alt="Coin" />
                            </span>
                            <h1 className="text-[40px] text-white font-extrabold">{(taps).toLocaleString()}{metrics(taps)?.pointSuffix}</h1>
                        </div>
                        <div className="flex flex-row gap-3 items-center">
                            <div className="flex flex-row gap-2 items-center">
                                <span className="w-6 h-6 grid place-items-center">
                                    <Icons.Trophy className="opacity-40" />
                                </span>
                                <p className={`${swapColorBasedOnStatus()} text-sm`}>{metrics(taps)?.status}</p>
                            </div>
                            <span className="h-4 w-[1px] bg-slate-50/50 block" />
                            <div className="flex flex-row gap-2 items-center">
                                <span className="w-6 h-6 grid place-items-center">
                                    <Icons.Star />
                                </span>
                                <p className="text-white/60 text-sm">Level: {userProfileInformation.level}</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex relative mb-12">
                        <div className="absolute w-full h-full flex items-center justify-end z-20 pointer-events-none">
                            <AnimatePresence>
                                {
                                    isClicked &&
                                    ([...Array(10)]).map((click, index) => (
                                        <motion.div
                                            key={`${Date.now()}${index}`}
                                            initial={{ opacity: 1, y: 0 }}
                                            animate={{ opacity: 0, y: -200 }}
                                            exit={{ opacity: 0, y: -200 }}
                                            transition={{ duration: 1 }}
                                            // style={{ left: click.x, top: click.y }}
                                            className="absolute z-20 text-lg text-white pr-6"
                                        >
                                            +{userProfileInformation.level}
                                        </motion.div>
                                    ))
                                }
                            </AnimatePresence>
                        </div>
                        <motion.span
                            onClick={() => {
                                if (timesClickedPerSession === undefined) return;

                                if (sessionLimit - timesClickedPerSession <= 0) return;

                                setTaps(taps + (1 * userProfileInformation.level));

                                updateTimesClickedPerSession(timesClickedPerSession + 1);

                                setIsClicked(!isClicked);
                            }}
                            whileTap={{
                                // scale: 1.1,
                                filter: "brightness(1.25)",
                                transition: { duration: 0.1 }
                            }}
                            className="w-60 h-60 relative">
                            <CustomImage priority src={images.clicker} alt="Durov" />
                        </motion.span>
                    </div>

                    {
                        timesClickedPerSession !== undefined &&
                        <div className="flex flex-row items-center text-white mb-5">
                            <p className="text-slate-400">Energy level:</p>&nbsp;
                            <span className="text-base">{sessionLimit - timesClickedPerSession}/{sessionLimit}</span>
                        </div>
                    }

                    {/* {
                        userProfileInformation.referralCount ?
                            <div className="flex flex-row items-center text-white">
                                <p className="text-slate-400">Referral points:</p>&nbsp;
                                <span className="text-xl">{(userProfileInformation.referralCount * 1000).toLocaleString()}</span>
                            </div> : <></>
                    } */}
                </>
            }
        </main>
    );
}

export default Homepage;