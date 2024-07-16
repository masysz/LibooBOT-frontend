"use client"
import { FunctionComponent, ReactElement, useContext, useState, useEffect, useMemo } from "react";
import CustomImage from "../components/ui/image";
import images from "@/public/images";
import { ApplicationContext, ApplicationContextData } from "../context/ApplicationContext";
import { metrics } from "../constants/userMetrics";
import { useUpdateBoostRefillEndTime, useUpdateDailyBoosts, useUpdateUserLevels } from "../api/apiClient";
import { StorageKeys } from "../constants/storageKeys";
import { levels } from "../constants/levels";
import { MultiLevelRequest } from "../models/ILevel";
import ComponentLoader from "../components/Loader/ComponentLoader";
import { dailyBoostLimit } from "../constants/user";

interface BoostPageProps {

}

const BoostPage: FunctionComponent<BoostPageProps> = (): ReactElement => {

    const updateDailyBoosts = useUpdateDailyBoosts();
    const updateUserLevels = useUpdateUserLevels();
    const updateBoostRefillEndTime = useUpdateBoostRefillEndTime();

    const {
        userProfileInformation, fetchUserProfileInformation, updateUserProfileInformation,
        nextUpdateTimestamp, updateNextUpdateTimestamp, updateTimesClickedPerSession,
        timeLeft
    } = useContext(ApplicationContext) as ApplicationContextData;

    const userPoints = userProfileInformation?.points;
    const userLevel = userProfileInformation?.level;
    const nextLevelFee = userLevel && levels.find((level) => level.level === (userLevel + 1))?.fee;
    const highestLevel = levels[levels.length - 1].level;

    const [isRequestingBoosts, setIsRequestingBoosts] = useState(false);
    const [upgradeErrorMsg, setUpgradeErrorMsg] = useState<string>();
    const [isUpgradingLevel, setIsUpgradingLevel] = useState(false);

    async function handleUpdateDailyBoosts({ fetchOnly = false }: { fetchOnly: boolean }) {
        if (timeLeft !== '00:00:00' && timeLeft !== '') return;

        if (!fetchOnly) setIsRequestingBoosts(true);

        await updateDailyBoosts(userProfileInformation?.userId as string, fetchOnly ? "fetch" : "update")
            .then(async (response) => {

                if (!fetchOnly) {
                    // save the next update timestamp to the state & session storage
                    if (response.data?.data.dailyFreeBoosters >= 0) {
                        const nextUpdate = new Date();
                        nextUpdate.setMilliseconds(nextUpdate.getMilliseconds() + 1);
                        updateNextUpdateTimestamp(nextUpdate.getTime());
                        // console.log("🚀 ~ handleUpdateDailyBoosts ~ nextUpdate", nextUpdate.getTime().toString());
                        // sessionStorage.setItem(StorageKeys.BoostersNextTimeUpdate, nextUpdate.getTime().toString());
                        // console.log("🚀 ~ handleUpdateDailyBoosts ~ sessionStorage updated");

                        // update boost end time in the database to 3hours before now
                        const endTime = new Date(Date.now() - 3 * 60 * 60 * 1000);
                        console.log("🚀 ~ .then ~ endTime:", endTime)

                        await updateBoostRefillEndTime({ userId: userProfileInformation?.userId as string, refillEndTime: endTime })
                            .then((response) => {
                                console.log("Boost refill time reset", response);
                                updateTimesClickedPerSession(0);
                            })
                            .catch((error) => {
                                console.error("Error resetting boost refill time", error);
                            });
                    }
                };

                fetchUserProfileInformation();

                setIsRequestingBoosts(false);
            })
            .catch((error) => {
                console.log(error);
            });
    };

    function requestDailyBoosts() {
        if (isRequestingBoosts) return;

        const boosterExpirationDate = userProfileInformation?.dailyBoostersExp;
        const freeBoosters = userProfileInformation?.dailyFreeBoosters;

        if (freeBoosters && boosterExpirationDate && boosterExpirationDate.getTime() > Date.now() && freeBoosters == 0) {
            console.log("You can't request daily boosts yet");
            return;
        }

        handleUpdateDailyBoosts({ fetchOnly: false });
    };

    const timeLeftIsValid = timeLeft && timeLeft !== '00:00:00';

    function displayLevelMessage() {
        if (!userLevel) return;

        const chargePoints = levels.find((level) => level.level === (userLevel + 1))?.fee;

        if (userLevel == highestLevel) {
            return "You've reached the highest level";
        }

        const message = levels.map((level) => {
            if (level.level === userLevel) {
                return `${chargePoints?.toLocaleString()} points to reach level ${level.level + 1}`;
            }
        })

        return message;
    };

    async function requestLevelUpgrade() {
        if (userPoints && userLevel) {
            const chargePoints = levels.find((level) => level.level === (userLevel + 1))?.fee;

            if (!chargePoints) {
                console.log("Invalid level");
                return;
            };

            if (userPoints < chargePoints) {
                setUpgradeErrorMsg("Insufficient points to upgrade");
                console.log("Insufficient points to upgrade");
                return;
            };

            // construct the data
            const data: MultiLevelRequest = {
                level: userLevel + 1,
                userId: userProfileInformation?.userId as string,
            };

            setIsUpgradingLevel(true);

            await updateUserLevels(data)
                .then((response) => {
                    // console.log("🚀 ~ .then ~ response:", response)
                    updateUserProfileInformation(response.data?.data);
                    // fetchUserProfileInformation();
                })
                .catch((error) => {
                    console.log(error);
                })
                .finally(() => {
                    setIsUpgradingLevel(false);
                });
        }
    }

    useEffect(() => {
        handleUpdateDailyBoosts({ fetchOnly: true });
    }, []);

    useMemo(() => {
        // Get the time left from session storage
        const timeLeftFromStorage = sessionStorage.getItem(StorageKeys.BoostersNextTimeUpdate);

        // Set the time left to the state
        if (timeLeftFromStorage && timeLeftFromStorage !== 'NaN') {
            updateNextUpdateTimestamp(Number(timeLeftFromStorage));
        }
    }, []);

    useMemo(() => {
        if (upgradeErrorMsg) {
            setTimeout(() => {
                setUpgradeErrorMsg(undefined);
            }, 5000);
        }
    }, [upgradeErrorMsg])

    return (
        <main className="flex min-h-screen flex-col items-center py-14">
            {/* <h2 className="text-white font-medium text-3xl">Boost Points</h2> */}

            {
                userPoints &&
                <div className="flex flex-col items-center gap-2 mb-6">
                    <p className="text-gray-300 text-xs">Available balance</p>
                    <div className="flex items-center gap-1">
                        <span className="w-7 h-7 relative grid place-items-center">
                            <CustomImage src={images.coin} alt="Coin" />
                        </span>
                        <h1 className=" font-black text-3xl text-white">{(userPoints).toLocaleString()}{metrics(userPoints)?.pointSuffix}</h1>
                    </div>
                </div>
            }

            <div className="w-full flex flex-col gap-2 mb-10">
                <span className="font-bold text-white text-sm">Daily boosters (Free)</span>
                <button
                    onClick={() => requestDailyBoosts()}
                    className={`bg-gray-700 rounded-3xl flex flex-row items-end justify-between p-4 pr-5 hover:bg-gray-600 ${isRequestingBoosts || nextUpdateTimestamp > 0 || userProfileInformation?.dailyFreeBoosters == 0 ? "pointer-events-none opacity-70" : ""}`}>
                    <div className="flex flex-row items-center gap-3">
                        <span className="w-7 h-7 relative grid place-items-center">
                            <CustomImage src={images.coin} alt="Coin" />
                        </span>
                        <div className="flex flex-col gap-[2px] items-start">
                            <h5 className="text-white font-medium leading-3 text-base">Full energy</h5>
                            <p className="text-white/60 text-sm">{userProfileInformation?.dailyFreeBoosters}/{dailyBoostLimit} available</p>
                        </div>
                    </div>
                    {
                        timeLeftIsValid &&
                        <p className="text-white/50 text-sm">
                            Time left: {timeLeft}
                        </p>
                    }
                </button>
            </div>

            {
                userLevel &&
                <div className="w-full flex flex-col">
                    <span className="font-bold text-white text-sm mb-2">Boosters</span>
                    <button
                        onClick={() => requestLevelUpgrade()}
                        className={`bg-gray-700 rounded-3xl flex flex-row items-center justify-between p-4 pr-5 hover:bg-gray-600 mb-1 ${isUpgradingLevel || userProfileInformation.level == highestLevel ? "pointer-events-none opacity-70" : ""}`}>
                        <div className="flex flex-row items-center gap-3">
                            <span className="w-7 h-7 relative grid place-items-center">
                                <CustomImage src={images.coin} alt="Coin" className={userPoints && nextLevelFee && userPoints < nextLevelFee ? "grayscale" : ""} />
                            </span>
                            <div className="flex flex-col gap-[2px] items-start">
                                <h5 className="text-white font-medium leading-3 text-base">Multitap</h5>
                                <p className="text-white/60 text-sm">{displayLevelMessage()}</p>
                            </div>
                        </div>
                        <span className="text-white/50 w-5 h-5 relative">
                            {isUpgradingLevel && <ComponentLoader className="absolute inset-0 m-auto w-5 h-5" />}
                        </span>
                    </button>
                    {upgradeErrorMsg && <p className="text-red-500/80 text-sm">{upgradeErrorMsg}</p>}
                </div>
            }
        </main>
    );
}

export default BoostPage;