"use client"
import Link from "next/link";
import { FunctionComponent, ReactElement, useContext } from "react";
import CustomImage from "./ui/image";
import images from "@/public/images";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { ApplicationContext, ApplicationContextData } from "../context/ApplicationContext";

interface BottomBarProps {

}

const BottomBar: FunctionComponent<BottomBarProps> = (): ReactElement => {

    const pathname = usePathname();

    const { timeLeft } = useContext(ApplicationContext) as ApplicationContextData;

    const links = [
        {
            title: "Refer",
            icon: images.buffies,
            href: "/refer"
        },
        {
            title: "Task",
            icon: images.task,
            href: "/task"
        },
        {
            title: "Tap",
            icon: images.coin,
            href: "/"
        },
        {
            title: "Boost",
            icon: images.boost,
            href: "/boost"
        },
        {
            title: "Stats",
            icon: images.stats,
            href: "/stats"
        },
        {
            title: "NFT",
            icon: images.nft_coin,
            href: "/nft"
        },
    ]

    return (
        <footer className="fixed bottom-4 flex flex-col">
            {
                timeLeft && timeLeft !== "00:00:00" &&
                <div className=" bg-gray-600 w-[210px] p-2 py-1 mx-auto rounded-t-md">
                    <p className="text-sm text-white text-center">Time till next boost: {timeLeft}</p>
                </div>
            }
            <div className="bg-white/10 text-white rounded-2xl p-2 flex flow-row gap-1 w-[calc(100vw_-_48px)] justify-between z-20 backdrop-blur-md">
                {/* <footer className="fixed bottom-0 left-0 bg-white/10 text-white rounded-t-2xl p-2 py-4 flex flow-row gap-1 w-full justify-between z-20"> */}
                {
                    links.map((link, index) => (
                        <Link key={index} href={link.href} className={`flex flex-col items-center rounded-xl p-2 w-full text-xs font-semibold hover:bg-slate-50/10 ${pathname == link.href ? "bg-white/20 border-[1px] border-orange-400 shadow-inner pointer-events-none" : ""}`}>
                            <motion.span
                                animate={{
                                    scale: pathname == link.href ? [1, 0.8, 1] : 1,
                                    transitionBehavior: "ease-in-out",
                                    transition: {
                                        duration: 1.5,
                                        repeat: Infinity
                                    }
                                }}
                                className="w-7 h-7 relative block">
                                <CustomImage src={link.icon} alt="Buffy" />
                            </motion.span>
                            {link.title}
                        </Link>
                    ))
                }
            </div>
        </footer>
    );
}

export default BottomBar;