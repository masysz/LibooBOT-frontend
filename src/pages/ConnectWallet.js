import React, { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { TonConnectButton, useTonAddress, useTonConnectUI } from "@tonconnect/ui-react";
import tonwallet from "../images/tonwallet.webp";
import { MdOutlineKeyboardArrowRight } from "react-icons/md";
import { IoClose, IoCheckmarkSharp } from "react-icons/io5";
import { useUser } from "../context/userContext";
import { db } from "../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import "../App.css"; // Pastikan file CSS Anda terimport

const Connect = () => {
    const { id, taskCompleted, setTaskCompleted } = useUser();
    const taskID = "connect_3000"; // Assign a unique ID to this task
    const [isConnectModalVisible, setIsConnectModalVisible] = useState(false);
    const [isCopied, setIsCopied] = useState(false); // State untuk menandai apakah alamat sudah dicopy
    const userFriendlyAddress = useTonAddress();
    const rawAddress = useTonAddress(false);
    const [tonConnectUI] = useTonConnectUI();

    useEffect(() => {
        checkTaskCompletion(id, taskID).then((completed) => {
            setTaskCompleted(completed);
        });
        // eslint-disable-next-line
    }, [id]);

    useEffect(() => {
        if (userFriendlyAddress) {
            saveTaskCompletionToFirestore(id, taskID, userFriendlyAddress, true).then(() => {
                setTaskCompleted(true);
            });
        }
        // eslint-disable-next-line
    }, [userFriendlyAddress]);

    const checkTaskCompletion = async (id, taskId) => {
        try {
            const userTaskDocRef = doc(db, "walletTasks", `${id}_${taskId}`);
            const docSnap = await getDoc(userTaskDocRef);
            if (docSnap.exists()) {
                return docSnap.data().completed;
            } else {
                return false;
            }
        } catch (e) {
            console.error("Error checking task completion: ", e);
            return false;
        }
    };

    const saveTaskCompletionToFirestore = async (id, taskId, address, isCompleted) => {
        try {
            const userTaskDocRef = doc(db, "walletTasks", `${id}_${taskId}`);
            await setDoc(
                userTaskDocRef,
                { userId: id, taskId: taskId, address: address, completed: isCompleted },
                { merge: true }
            );
            console.log('Task completion status saved to Firestore.');
        } catch (e) {
            console.error("Error saving task completion status: ", e);
        }
    };

    const handleDisconnect = async () => {
        try {
            await tonConnectUI.disconnect();
            setTaskCompleted(false);
        } catch (e) {
            console.error("Error disconnecting wallet: ", e);
        }
    };

    const handleCopyAddress = () => {
        navigator.clipboard.writeText(userFriendlyAddress);
        setIsCopied(true);

        // Reset copied status after 3 seconds
        setTimeout(() => {
            setIsCopied(false);
        }, 3000);
    };

    return (
        <>
            <div onClick={() => setIsConnectModalVisible(true)} className="bg-cards rounded-[10px] p-[14px] flex justify-between items-center">
                <div className="flex flex-1 items-center space-x-2">
                    <div>
                        <img src={tonwallet} alt="tonwallet" className="w-[50px]" />
                    </div>
                    <div className="flex flex-col space-y-1">
                        <span className="font-semibold">Connect your TON wallet</span>
                    </div>
                </div>
                <div>
                    {taskCompleted ? (
                        <div className="checkmark-container">
                            <IoCheckmarkSharp className="w-[20px] h-[20px] text-[#5bd173] mt-[2px]" />
                        </div>
                    ) : (
                        <MdOutlineKeyboardArrowRight className="w-[20px] h-[20px] text-[#e0e0e0] mt-[2px]" />
                    )}
                </div>
            </div>

            {/* Connect Modal */}
            <div className={`${isConnectModalVisible ? "visible" : "invisible"} absolute bottom-0 left-0 right-0 h-fit bg-[#1e2340f7] z-[100] rounded-tl-[20px] rounded-tr-[20px] flex justify-center px-4 py-5`}>
                <div className="w-full flex flex-col justify-between py-8">
                    <button onClick={() => setIsConnectModalVisible(false)} className="flex items-center justify-center absolute right-8 top-8 text-center rounded-[12px] font-medium text-[16px]">
                        <IoClose size={24} className="text-[#9a96a6]" />
                    </button>
                    <div className="w-full flex justify-center flex-col items-center">
                        <div className="w-[120px] h-[120px] rounded-[25px] bg-[#252e57] flex items-center justify-center">
                            <img alt="claim" src={tonwallet} className="w-[80px]" />
                        </div>
                        <h3 className="font-semibold text-[32px] py-4">Connect your TON wallet</h3>
                        <p className="pb-6 text-[#9a96a6] text-[16px] text-center">
                            Don't forget to connect your TON wallet <br />
                            Distribution token soon.
                        </p>
                        <div className="w-full flex justify-center pb-6 pt-4">
                            {!userFriendlyAddress && (
                                <button className="w-full py-5 px-3 flex items-center justify-center text-center rounded-[12px] font-semibold text-[22px]">
                                    <TonConnectButton />
                                </button>
                            )}
                        </div>
                        {userFriendlyAddress && (
                            <div className="flex items-center mt-4 space-x-2">
                                <button
                                    onClick={handleCopyAddress}
                                    className="p-3 rounded-[12px] bg-gray-200 flex items-center justify-center"
                                >
                                    {isCopied ? "Copied" : "Copy"}
                                </button>
                                <input
                                    type="text"
                                    value={userFriendlyAddress}
                                    readOnly
                                    className="flex-grow p-3 text-center rounded-[12px] bg-gray-200"
                                />
                                <button
                                    onClick={handleDisconnect}
                                    className="p-3 rounded-[12px] bg-gray-200 flex items-center justify-center"
                                >
                                    <IoClose size={24} className="text-[#9a96a6]" />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <Outlet />
        </>
    );
};

export default Connect;
