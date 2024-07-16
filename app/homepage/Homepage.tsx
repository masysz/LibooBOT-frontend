"use client"
import { ReactElement, FunctionComponent, useState, useContext, useEffect, useCallback } from "react";
import images from "@/public/images";
import { AnimatePresence, motion } from "framer-motion";
import CustomImage from "../components/ui/image";
import { Icons } from "../components/ui/icons";
import { metrics } from "../constants/userMetrics";
import { ApplicationContext, ApplicationContextData } from "../context/ApplicationContext";
import { useUpdateUserPoints } from "../api/apiClient";
import { PointsUpdateRequest } from "../models/IPoints";
import { Metrics } from "../enums/IMetrics";
import { sessionLimit } from "../constants/user";

interface HomepageProps {}

const Homepage: FunctionComponent<HomepageProps> = (): ReactElement => {
    const updateUserPoints = useUpdateUserPoints();

    const {
        userProfileInformation, fetchUserProfileInformation, updateUserProfileInformation,
        timesClickedPerSession, updateTimesClickedPerSession,
    } = useContext(ApplicationContext) as ApplicationContextData;

    const [taps, setTaps] = useState<number>(0);
    const [isClicked, setIsClicked] = useState(false);

    const handleUpdateUserPoints = useCallback(async () => {
        if (taps === 0) return;

        const data: PointsUpdateRequest = {
            userId: userProfileInformation?.userId as string,
            points: taps,
        };

        try {
            await updateUserPoints(data);
            fetchUserProfileInformation();
        } catch (error) {
            console.error(error);
        }
    }, [taps, updateUserPoints, userProfileInformation?.userId, fetchUserProfileInformation]);

    useEffect(() => {
        if (userProfileInformation) {
            setTaps(userProfileInformation.points ?? 0);
        }
    }, [userProfileInformation]);

    useEffect(() => {
        const timer = setTimeout(() => {
            handleUpdateUserPoints();
        }, 1000); // Save points every second

        return () => clearTimeout(timer);
    }, [taps, handleUpdateUserPoints]);

    const handleClick = () => {
        if (timesClickedPerSession === undefined || sessionLimit - timesClickedPerSession <= 0) return;

        if (userProfileInformation) {
            setTaps(prevTaps => prevTaps + (1 * userProfileInformation.level));
            updateTimesClickedPerSession(timesClickedPerSession + 1);
            setIsClicked(true);

            setTimeout(() => {
                setIsClicked(false);
            }, 300); // Reset click animation state after 300ms
        }
    };

    const swapColorBasedOnStatus = () => {
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

    return (
        <main className="flex min-h-screen flex-col items-center py-20 pb-32 select-none">
            {userProfileInformation && (
                <>
                    <div className="flex flex-col items-center mb-12">
                        <div className="flex flex-row gap-2 items-center">
                            <span className="w-7 h-7 relative grid place-items-center">
                                <CustomImage src={images.coin} alt="Coin" />
                            </span>
                            <h1 className="text-[40px] text-white font-extrabold">
                                {taps.toLocaleString()}
                                {metrics(taps)?.pointSuffix}
                            </h1>
                        </div>
                        <div className="flex flex-row gap-3 items-center">
                            <div className="flex flex-row gap-2 items-center">
                                <span className="w-6 h-6 grid place-items-center">
                                    <Icons.Trophy className="opacity-40" />
                                </span>
                                <p className={`${swapColorBasedOnStatus()} text-sm`}>
                                    {metrics(taps)?.status}
                                </p>
                            </div>
                            <span className="h-4 w-[1px] bg-slate-50/50 block" />
                            <div className="flex flex-row gap-2 items-center">
                                <span className="w-6 h-6 grid place-items-center">
                                    <Icons.Star />
                                </span>
                                <p className="text-white/60 text-sm">
                                    Level: {userProfileInformation.level}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex relative mb-12">
                        <div className="absolute w-full h-full flex items-center justify-end z-20 pointer-events-none">
                            <AnimatePresence>
                                {isClicked &&
                                    [...Array(10)].map((_, index) => (
                                        <motion.div
                                            key={index}
                                            initial={{ opacity: 1, y: 0 }}
                                            animate={{ opacity: 0, y: -200 }}
                                            exit={{ opacity: 0, y: -200 }}
                                            transition={{ duration: 1 }}
                                            className="absolute z-20 text-lg text-white pr-6"
                                        >
                                            +{userProfileInformation.level}
                                        </motion.div>
                                    ))}
                            </AnimatePresence>
                        </div>
                        <motion.span
                            onClick={handleClick}
                            whileTap={{
                                scale: 0.9,
                                filter: "brightness(1.25)",
                                transition: { duration: 0.1 },
                            }}
                            className="w-60 h-60 relative cursor-pointer"
                        >
                            <CustomImage priority src={images.clicker} alt="Durov" />
                        </motion.span>
                    </div>

                    {timesClickedPerSession !== undefined && (
                        <div className="flex flex-row items-center text-white mb-5">
                            <p className="text-slate-400">Energy level:</p>&nbsp;
                            <span className="text-base">
                                {sessionLimit - timesClickedPerSession}/{sessionLimit}
                            </span>
                        </div>
                    )}
                </>
            )}
        </main>
    );
};

export default Homepage;
