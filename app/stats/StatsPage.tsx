"use client"
import { FunctionComponent, ReactElement, useState, useEffect } from "react";
import CustomImage from "../components/ui/image";
import images from "@/public/images";
import { useFetchLeaderboard } from "../api/apiClient";
import { metrics } from "../constants/userMetrics";
import { useRouter } from "next/navigation";

interface StatsPageProps {

}

interface LeaderboardData {
    username: string;
    points: number;
}

const StatsPage: FunctionComponent<StatsPageProps> = (): ReactElement => {

    const fetchLeaderboard = useFetchLeaderboard();
    const router = useRouter();

    const [leaderboard, setLeaderboard] = useState<LeaderboardData[]>();
    const [isFetchingStats, setIsFetchingStats] = useState(true);

    async function handleFetchLeaderboard(showLoader: boolean = false) {
        if (showLoader) {
            setIsFetchingStats(true);
            setLeaderboard(undefined);
        };

        await fetchLeaderboard()
            .then((response) => {
                setLeaderboard(response.data);
                setIsFetchingStats(false)
            })
            .catch((error) => {
                console.log(error);
            });
    };

    useEffect(() => {
        if (isFetchingStats) handleFetchLeaderboard();
    }, [router, isFetchingStats])


    return (
        <main className="flex min-h-screen flex-col items-center py-14 pb-24">
            <h2 className="text-white font-medium text-3xl">Leaderboard</h2>

            {
                !isFetchingStats &&
                <button
                    onClick={() => handleFetchLeaderboard(true)}
                    className="p-2 rounded-full bg-transparent text-gray-400 border-none mx-auto mt-5">
                    Reload
                </button>
            }

            {
                leaderboard && !isFetchingStats &&
                <div className="mt-6 w-full rounded-md overflow-hidden">
                    <table className="table-auto w-full">
                        <thead>
                            <tr>
                                <th className="text-gray-500 bg-white p-2 text-left">Rank</th>
                                <th className="text-gray-500 bg-white p-2 text-left">Username</th>
                                <th className="text-gray-500 bg-white p-2 text-left">Points</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                leaderboard?.map((user, index) => (
                                    <tr key={index}>
                                        <td className="text-white p-2">{index + 1}</td>
                                        <td className="text-white p-2 flex items-baseline gap-2">
                                            <p className="max-w-[180px] overflow-ellipsis overflow-hidden whitespace-nowrap">@{user.username}</p>
                                            {/* <span className="text-xs text-yellow-400 bg-yellow-300/20 py-[2px] px-1 rounded-md font-medium">{metrics(Number(user.points))?.status}</span> */}
                                        </td>
                                        <td className="text-white text-right p-2 font-semibold">{user.points.toLocaleString()}</td>
                                    </tr>
                                ))
                            }
                        </tbody>
                    </table>
                </div>
            }
            {
                !leaderboard && isFetchingStats &&
                <>
                    <div className="w-16 h-16 mt-20 border-4 border-blue-400 border-t-transparent border-solid rounded-full animate-spin" />
                    {/* <p className="text-white text-center mt-8">Fetching leaderboard...</p> */}
                </>
            }

            {/* <div className="my-8">
                <span className="w-56 h-56 relative block mb-3">
                    <CustomImage src={images.splash} alt="Buffy" />
                </span>
                <h4 className="text-white font-normal text-xl text-center">Coming Soon</h4>
            </div> */}
        </main>
    );
}

export default StatsPage;