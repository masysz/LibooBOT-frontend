import images from "@/public/images";
import Image from "next/image";
import { FunctionComponent, ReactElement } from "react";
import CustomImage from "../components/ui/image";

interface NftProps {

}

const Nft: FunctionComponent<NftProps> = (): ReactElement => {
    return (
        <main className="flex min-h-screen flex-col items-center py-14">
            <div className="w-56 h-56 rounded-xl relative overflow-hidden mb-10">
                <CustomImage src={images.buffy_nft} alt="Buffy NFT" />
            </div>
            <p className="text-white text-center mb-5">
                Discover the <span className="text-orange-400">LIFE BOOSTER NFT COLLECTION</span> – featuring <span className="font-medium">more than 1250</span> unique NFTs showcasing $LIBOO character with a ton of utilities, coming soon on the TON Blockchain.
            </p>
            <p className="text-white text-center">
                Top users with high referrals and points in the game will win a change to grab a rare NFT.
            </p>
        </main>
    );
}

export default Nft;