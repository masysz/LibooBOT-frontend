import React, { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Outlet } from "react-router-dom";
import ClaimLeveler from "../Components/ClaimLeveler";
import Spinner from "../Components/Spinner";
import coinsmall from "../images/main-logo.png";
import { useUser } from "../context/userContext";

const Ref = () => {
  const { id, referrals, loading } = useUser();
  const [claimLevel, setClaimLevel] = useState(false);
  const [copied, setCopied] = useState(false);
  const scrollContainerRef = useRef(null);

  const totalEarnings = useMemo(() => {
    return referrals.reduce((total, user) => total + user.balance * 0.05, 0);
  }, [referrals]);

  useEffect(() => {
    const updateScrollHeight = () => {
      if (scrollContainerRef.current) {
        const viewportHeight = window.innerHeight;
        const offsetTop = scrollContainerRef.current.offsetTop;
        const maxHeight = viewportHeight - offsetTop - 20; // 20px for bottom margin
        scrollContainerRef.current.style.maxHeight = `${maxHeight}px`;
      }
    };

    updateScrollHeight();
    window.addEventListener('resize', updateScrollHeight);

    return () => window.removeEventListener('resize', updateScrollHeight);
  }, []);

  const copyToClipboard = () => {
    const reflink = `https://t.me/Liboo_tonbot?start=r${id}`;
    navigator.clipboard.writeText(reflink)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
      })
      .catch(err => console.error('Failed to copy text: ', err));
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat().format(num).replace(/,/g, " ");
  };

  const ReferralItem = ({ user, index }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="bg-gray-50 rounded-lg p-4 flex flex-wrap items-center justify-between mb-4"
    >
      <div className="flex items-center space-x-3 mb-2 sm:mb-0">
        <img src={user.level.imgUrl} alt={user.level.name} className="w-10 h-10" />
        <div>
          <h3 className="text-[#262626] font-semibold">{user.username}</h3>
          <p className="text-gray-500 text-sm">{user.level.name}</p>
        </div>
      </div>
      <div className="flex flex-col items-end">
        <div className="flex items-center space-x-2">
          <img src={coinsmall} alt="coin" className="w-5 h-5" />
          <span className="text-[#507cff] font-medium">{formatNumber(user.balance)}</span>
        </div>
        <div className="text-green-500 text-sm">
          +{formatNumber(user.balance * 0.05)} (5%)
        </div>
      </div>
      <div className="w-full mt-3 sm:w-32">
        <div className="bg-gray-200 rounded-full h-2 w-full">
          <div
            className="bg-gradient-to-r from-[#094e9d] to-[#0b62c4] h-2 rounded-full"
            style={{ width: `${(user.balance / 10000) * 100}%` }}
          ></div>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#d9dce4] to-[#5496ff] flex flex-col overflow-y-auto">
      <div className="w-full max-w-4xl mx-auto px-4 py-4 flex-grow flex flex-col">
        {loading ? (
          <Spinner />
        ) : (
          <>
            <header className="text-center mb-6">
              <h1 className="text-4xl font-bold text-[#262626] mb-1">
                {referrals.length} <span className="text-[#507cff]">Users</span>
              </h1>
              <p className="text-lg text-gray-600">Your Referral Network</p>
              <p className="text-xl text-green-600 font-semibold mt-2">
                Total Earnings: +{formatNumber(totalEarnings)}
              </p>
            </header>

            <section className="bg-white rounded-2xl p-6 mb-6 shadow-md">
              <h2 className="text-xl font-semibold text-[#262626] mb-4">My Invite Link</h2>
              <div className="flex items-center justify-between bg-[#d9dce4] rounded-lg p-3">
                <p className="text-gray-700 text-sm truncate mr-2">
                  https://t.me/liboo_tonbot?start=r{id}
                </p>
                <button
                  onClick={copyToClipboard}
                  className="bg-gradient-to-r from-[#094e9d] to-[#0b62c4] text-white font-medium py-2 px-4 rounded-lg transition-all duration-300 hover:from-[#0b62c4] hover:to-[#094e9d]"
                >
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>
            </section>

            <section className="bg-white rounded-2xl p-6 mb-6 shadow-md flex-grow flex flex-col">
              <h2 className="text-xl font-semibold text-[#262626] mb-6">My Referrals</h2>
              <div 
                ref={scrollContainerRef}
                className="overflow-y-auto flex-grow"
                style={{
                  WebkitOverflowScrolling: 'touch',
                  scrollbarWidth: 'thin',
                  scrollbarColor: '#4a5568 #CBD5E0'
                }}
              >
                {referrals.length === 0 ? (
                  <p className="text-center text-gray-600 py-8">
                    You don't have any referrals yet. Start sharing your link!
                  </p>
                ) : (
                  <AnimatePresence>
                    <div className="space-y-4 pr-2">
                      {referrals.map((user, index) => (
                        <ReferralItem key={user.id || index} user={user} index={index} />
                      ))}
                    </div>
                  </AnimatePresence>
                )}
              </div>
            </section>

            <ClaimLeveler claimLevel={claimLevel} setClaimLevel={setClaimLevel} />
          </>
        )}
        <Outlet />
      </div>
    </div>
  );
};

export default Ref;