"use client"
import { FunctionComponent, ReactElement, ReactNode, useState, useEffect, useContext, useCallback, useMemo } from "react";
import CustomImage from "./ui/image";
import images from "@/public/images";
import { motion } from "framer-motion";
import Topbar from "./Topbar";
import BottomBar from "./BottomBar";
import NextTopLoader from "nextjs-toploader";
import { ApplicationContext, ApplicationContextData } from "../context/ApplicationContext";
import { useRouter, useSearchParams } from "next/navigation";
import { UserProfileInformation } from "../models/IUser";
import { StorageKeys } from "../constants/storageKeys";
import { splashScreenVariant } from "../animations/splashScreen";
import { useCreateReferral, useCreateUser, useFetchUserBoostRefillEndTime, useUpdateBoostRefillEndTime } from "../api/apiClient";
import { ReferralCreationRequest } from "../models/IReferral";
import { debounce } from "lodash"

interface LayoutProps {
    children?: ReactNode;
}

const Layout: FunctionComponent<LayoutProps> = ({ children }): ReactElement => {

    const createUser = useCreateUser();
    const createReferral = useCreateReferral();
    const updateBoostRefillEndTime = useUpdateBoostRefillEndTime();
    const fetchUserBoostRefillEndTime = useFetchUserBoostRefillEndTime();

    const {
        userProfileInformation, fetchUserProfileInformation, updateUserProfileInformation,
        updateNextUpdateTimestamp, timesClickedPerSession,
        nextUpdateTimestamp, updateTimeLeft: setTimeLeft, updateTimesClickedPerSession,
    } = useContext(ApplicationContext) as ApplicationContextData;

    const router = useRouter();
    const [loaderIsVisible, setLoaderIsVisible] = useState(true);
    const [isReferralCreated, setIsReferralCreated] = useState(false);
    const [isBoostTimeRetrieved, setIsBoostTimeRetrieved] = useState(false);
    let isCreatingUser = false;

    const iswindow = typeof window !== 'undefined' ? true : false;

    const params = useSearchParams();
    const userId = params.get('id');
    const userName = params.get('userName');
    const referralId = params.get('referralId');

    async function handleCreateUser(userInfo: UserProfileInformation) {
        if (isCreatingUser) return;

        isCreatingUser = true;

        await createUser(userInfo)
            .then((response) => {
                fetchUserProfileInformation();
                console.log(response);
            })
            .catch((error) => {
                console.error(error);
            });
    };

    async function handleCreateReferral(userId: string, referrerId: string) {

        const data: ReferralCreationRequest = {
            userId: userId,
            referrerId
        };

        await createReferral(data)
            .then((response) => {
                console.log("Referral created", response);
                setIsReferralCreated(true);
            })
            .catch((error) => {
                console.error("Error creating referral", error);
            });
    };

    // hook to hide the loader after window is loaded and user profile information is fetched
    useEffect(() => {
        if (typeof window !== 'undefined' && userProfileInformation) {
            setLoaderIsVisible(false);
        }
    }, [iswindow, userProfileInformation]);

    // Effect to start the countdown timer for the next free daily boost update
    useEffect(() => {
        if (!nextUpdateTimestamp) return;

        const updateCountdown = () => {
            const now = new Date().getTime();
            const distance = nextUpdateTimestamp - now;

            if (distance < 0) {
                setTimeLeft('00:00:00');
                updateNextUpdateTimestamp(0);
                return;
            }

            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);

            setTimeLeft(`${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`);
        };

        // Update the countdown every second
        const interval = setInterval(updateCountdown, 1000);

        // Cleanup interval on component unmount
        return () => clearInterval(interval);
    }, [nextUpdateTimestamp]);

    function generate8RandomCharacters() {
        // generate 8 random characters involving letters and numbers
        let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < 8; i++) {
            let randomIndex = Math.floor(Math.random() * characters.length);
            result += characters[randomIndex];
        }
        return result;
    }

    // hook to create user profile
    useMemo(() => {
        if (!iswindow) return;

        if (userId) {

            // construct user information
            const userInfo: UserProfileInformation = {
                id: userId,
                userId: userId,
                dailyFreeBoosters: 4,
                telegramTaskDone: false,
                twitterTaskDone: false,
                level: 1,
                username: userName == 'None' || !userName ? generate8RandomCharacters() : userName
            }; 

            handleCreateUser(userInfo);

            // save to session storage
            sessionStorage.setItem(StorageKeys.UserInformation, JSON.stringify(userInfo));

            router.refresh();
        }

        const userProfileInformation = sessionStorage.getItem(StorageKeys.UserInformation);

        if (userProfileInformation) {
            fetchUserProfileInformation();
        }
    }, [userId, userName, iswindow]);

    // hook to create referral if referralId & user info is available, and referral is not created yet
    useMemo(() => {
        if (referralId && userProfileInformation && !isReferralCreated) {
            handleCreateReferral(userProfileInformation.userId, referralId);
        }
    }, [referralId, userProfileInformation]);

    const handleUpdateBoostRefillEndTime = useCallback(debounce(async (userId: string, endTime: Date) => {
        console.log("DB ACTION TRIGGERED!");
        await updateBoostRefillEndTime({ userId, refillEndTime: endTime })
            .then((response) => {
                console.log("Boost refill time updated", response);
            })
            .catch((error) => {
                console.error("Error updating boost refill time", error);
            });
    }, 1000), []);

    // Convert date to UTC
    function toUTCDate(date: Date): Date {
        return new Date(date.toISOString());
    };

    async function handleFetchUserBoostRefillEndTime(userId: string) {
        await fetchUserBoostRefillEndTime(userId)
            .then((response) => {
                setIsBoostTimeRetrieved(true);
                updateUserProfileInformation(response?.data.data);

                console.log("response?.data.data.boostRefillEndTime ", response?.data.data.boostRefillEndTime);

                // const currentTime = toUTCDate(new Date(Date.now()));
                const currentTime = new Date(Date.now() + 60 * 60 * 1000);
                const boostRefillEndTime = toUTCDate(new Date(new Date(response?.data.data.boostRefillEndTime).getTime() - 0));

                console.log("🚀 ~ .then ~ boostRefillEndTime:", boostRefillEndTime.toISOString());
                console.log("🚀 ~ .then ~ currentTime:", currentTime.toISOString());

                if (boostRefillEndTime < currentTime) {
                    updateTimesClickedPerSession(0);
                    return;
                };

                const timeDifference = boostRefillEndTime.getTime() - currentTime.getTime();
                const remainingTicks = Math.max(Math.floor(timeDifference / DEBOUNCE_DELAY_FOR_SESSION), 0);
                updateTimesClickedPerSession(remainingTicks);

                console.log("Boost refill time fetched", response);
            })
            .catch((error) => {
                console.error("Error fetching boost refill time", error);
            });
    };

    // const DEBOUNCE_DELAY_FOR_SESSION = 32400; // Delay for 3 clicks for 3hrs
    const DEBOUNCE_DELAY_FOR_SESSION = 10800; // Delay for 1 click for 3hrs

    // hook to fetch the user's boost refill end time
    useEffect(() => {
        if (userProfileInformation && !isBoostTimeRetrieved) {
            console.log("TIME TO RETRIEVE")
            handleFetchUserBoostRefillEndTime(userProfileInformation.userId);
        }
    }, [userProfileInformation, isBoostTimeRetrieved]);

    // Use a hook to update the timesClickedPerSession back to zero after the user has stopped clicking. Decrement the timesclickedpersession by 3 till the limit is reached
    useEffect(() => {
        if (!isBoostTimeRetrieved || timesClickedPerSession === undefined) return;

        if (timesClickedPerSession === 0) return;

        let endTime: Date | null = null;
        const currentTime = toUTCDate(new Date(Date.now() + 60 * 60 * 1000));

        const remainingTicks = timesClickedPerSession;
        endTime = toUTCDate(new Date(Date.now() + remainingTicks * DEBOUNCE_DELAY_FOR_SESSION));

        // if (userProfileInformation?.boostRefillEndTime && toUTCDate(new Date(userProfileInformation.boostRefillEndTime)) > currentTime) {
        //     console.log("🚀 ~ useEffect ~ boostRefillEndTime:", userProfileInformation.boostRefillEndTime)
        //     endTime = toUTCDate(new Date(new Date(userProfileInformation.boostRefillEndTime).getTime() - 60 * 60 * 1000));
        //     console.log("🚀 ~ useEffect ~ endTime 1:", endTime)
        // } else {
        //     const remainingTicks = timesClickedPerSession;
        //     endTime = toUTCDate(new Date(Date.now() + remainingTicks * DEBOUNCE_DELAY_FOR_SESSION));
        //     console.log("🚀 ~ useEffect ~ endTime 2:", endTime)
        // }

        let timer: NodeJS.Timeout;

        handleUpdateBoostRefillEndTime(userProfileInformation?.userId as string, endTime as Date);

        if (timesClickedPerSession > 0) {
            timer = setTimeout(async () => {
                updateTimesClickedPerSession(Math.max(timesClickedPerSession - 1, 0));

                // await handleUpdateBoostRefillEndTime(endTime as Date);
            }, DEBOUNCE_DELAY_FOR_SESSION);
        }

        return () => {
            if (timer) {
                clearTimeout(timer);
            }
        };
    }, [timesClickedPerSession, isBoostTimeRetrieved]);

    return (
        <motion.div
            initial="opened"
            animate={loaderIsVisible ? "opened" : "closed"}
        >
            {/* <NextTopLoader
                color="#ffffff"
                initialPosition={0.08}
                crawlSpeed={200}
                height={3}
                crawl={true}
                showSpinner={false}
                easing="ease"
                speed={200}
                shadow="0 0 10px #f1fa9e,0 0 5px #ceb0fa"
            /> */}

            {!loaderIsVisible && (
                <>
                    <Topbar />
                    {children}
                    <BottomBar />
                </>
            )}

            <motion.div
                variants={splashScreenVariant}
                className='w-[100vw] h-[100vh] fixed top-0 left-0 z-30 min-h-[100vh] grid place-items-center bg-white pointer-events-none'>
                <div className='w-60 h-60 animate-pulse transition-all duration-150 ease-in-out object-contain relative'>
                    <CustomImage src={images.splash} alt='logo' />
                </div>
            </motion.div>
        </motion.div>
    );
}

export default Layout;