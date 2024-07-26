import React, { useState } from "react";
import { motion } from "framer-motion";
import { Outlet } from "react-router-dom";
import ClaimLeveler from "../Components/ClaimLeveler";
import Spinner from "../Components/Spinner";
import coinsmall from "../images/main-logo.png";
import { useUser } from "../context/userContext";

const Ref = () => {
  const { id, referrals, loading } = useUser();
  const [claimLevel, setClaimLevel] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    const reflink = `https://t.me/Liboo_tonbot?start=r${id}`;
    navigator.clipboard.writeText(reflink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }).catch(err => console.error('Failed to copy text: ', err));
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat().format(num).replace(/,/g, " ");
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-4xl mx-auto px-4 py-4"
    >
      {loading ? (
        <Spinner />
      ) : (
        <>
          <header className="text-center mb-6">
            <h1 className="text-4xl font-bold text-[#262626] mb-1">
              {referrals.length} <span className="text-[#6ed86e]">Users</span>
            </h1>
            <p className="text-lg text-gray-600">Your Referral Network</p>
          </header>

          <section className="bg-white rounded-2xl p-6 mb-6 shadow-md">
            <h2 className="text-xl font-semibold text-[#262626] mb-4">My Invite Link</h2>
            <div className="flex items-center justify-between bg-gray-100 rounded-lg p-3">
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

          <section className="bg-white rounded-2xl p-6 mb-6 shadow-md">
            <h2 className="text-xl font-semibold text-[#262626] mb-6">My Referrals</h2>
            {referrals.length === 0 ? (
              <p className="text-center text-gray-600 py-8">
                You don't have any referrals yet. Start sharing your link!
              </p>
            ) : (
              <div className="space-y-4">
                {referrals.map((user, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="bg-gray-50 rounded-lg p-4 flex flex-wrap items-center justify-between"
                  >
                    <div className="flex items-center space-x-3 mb-2 sm:mb-0">
                      <img src={user.level.imgUrl} alt={user.level.name} className="w-10 h-10" />
                      <div>
                        <h3 className="text-[#262626] font-semibold">{user.username}</h3>
                        <p className="text-gray-500 text-sm">{user.level.name}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <img src={coinsmall} alt="coin" className="w-5 h-5" />
                      <span className="text-[#507cff] font-medium">{formatNumber(user.balance)}</span>
                    </div>
                    <div className="w-full mt-3 sm:w-auto sm:mt-0">
                      <div className="bg-gray-200 rounded-full h-2 w-full sm:w-32">
                        <div
                          className="bg-gradient-to-r from-[#094e9d] to-[#0b62c4] h-2 rounded-full"
                          style={{ width: `${(user.balance / 10000) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </section>

          <ClaimLeveler claimLevel={claimLevel} setClaimLevel={setClaimLevel} />
        </>
      )}
      <Outlet />
    </motion.div>
  );
};

export default Ref;