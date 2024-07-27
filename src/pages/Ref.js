import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Outlet } from "react-router-dom";
import styled from "styled-components";
import ClaimLeveler from "../Components/ClaimLeveler";
import Spinner from "../Components/Spinner";
import coinsmall from "../images/main-logo.png";
import { useUser } from "../context/userContext";

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const ContentWrapper = styled.div`
  width: 100%;
  max-width: 64rem;
  margin: 0 auto;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
`;

const Header = styled.header`
  text-align: center;
  margin-bottom: 1.5rem;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: bold;
  color: #262626;
  margin-bottom: 0.25rem;
`;

const Subtitle = styled.p`
  font-size: 1.125rem;
  color: #4b5563;
`;

const TotalEarnings = styled.p`
  font-size: 1.25rem;
  color: #10b981;
  font-weight: 600;
  margin-top: 0.5rem;
`;

const Section = styled.section`
  background-color: white;
  height: 30%;
  border-radius: 1rem;
  padding: 1.5rem;
  margin-bottom: 2.0rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const ReferralsSection = styled(Section)`
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: #4a5568 #CBD5E0;
  
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: #CBD5E0;
  }
  
  &::-webkit-scrollbar-thumb {
    background-color: #4a5568;
    border-radius: 4px;
  }

`;

const InviteLinkWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #d9dce4;
  border-radius: 0.5rem;
  padding: 0.75rem;
`;

const InviteLink = styled.p`
  color: #4b5563;
  font-size: 0.875rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-right: 0.5rem;
`;

const CopyButton = styled.button`
  background: linear-gradient(to right, #094e9d, #0b62c4);
  color: white;
  font-weight: 500;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  transition: all 0.3s;

  &:hover {
    background: linear-gradient(to right, #0b62c4, #094e9d);
  }
`;

const ReferralsContainer = styled.div`
  overflow-y: auto;
`;

const ReferralsList = styled.div`
  padding-right: 8px;
  overflow-y: auto;
`;

const ReferralItemWrapper = styled(motion.div)`
  background-color: #f9fafb;
  border-radius: 0.5rem;
  padding: 1rem;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
`;

const Ref = () => {
  const { id, referrals = [], loading } = useUser();
  const [claimLevel, setClaimLevel] = useState(false);
  const [copied, setCopied] = useState(false);
  const scrollContainerRef = useRef(null);

  const totalEarnings = useMemo(() => {
    return referrals.reduce((total, user) => total + (user.balance || 0) * 0.05, 0);
  }, [referrals]);

  const updateScrollHeight = useCallback(() => {
    if (scrollContainerRef.current) {
      const viewportHeight = window.innerHeight;
      const containerTop = scrollContainerRef.current.getBoundingClientRect().top;
      const maxHeight = viewportHeight - containerTop - 40; // 40px for bottom margin and padding
      scrollContainerRef.current.style.height = `${maxHeight}px`;
    }
  }, []);

  useEffect(() => {
    updateScrollHeight();
    window.addEventListener('resize', updateScrollHeight);
    return () => window.removeEventListener('resize', updateScrollHeight);
  }, [updateScrollHeight]);

  const copyToClipboard = useCallback(() => {
    const reflink = `https://t.me/Liboo_tonbot?start=r${id}`;
    navigator.clipboard.writeText(reflink)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
      })
      .catch(err => console.error('Failed to copy text: ', err));
  }, [id]);

  const formatNumber = (num) => {
    return new Intl.NumberFormat().format(num).replace(/,/g, " ");
  };

  const ReferralItem = React.memo(({ user, index }) => (
    <ReferralItemWrapper
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <div className="flex items-center space-x-3 mb-2 sm:mb-0">
        <img src={user.level?.imgUrl} alt={user.level?.name} className="w-10 h-10" />
        <div>
          <h3 className="text-[#262626] font-semibold">{user.username}</h3>
          <p className="text-gray-500 text-sm">{user.level?.name}</p>
        </div>
      </div>
      <div className="flex flex-col items-end">
        <div className="flex items-center space-x-2">
          <img src={coinsmall} alt="coin" className="w-5 h-5" />
          <span className="text-[#507cff] font-medium">{formatNumber(user.balance || 0)}</span>
        </div>
        <div className="text-green-500 text-sm">
          +{formatNumber((user.balance || 0) * 0.05)} (5%)
        </div>
      </div>
      <div className="w-full mt-3 sm:w-32">
        <div className="bg-gray-200 rounded-full h-2 w-full">
          <div
            className="bg-gradient-to-r from-[#094e9d] to-[#0b62c4] h-2 rounded-full"
            style={{ width: `${((user.balance || 0) / 10000) * 100}%` }}
          ></div>
        </div>
      </div>
    </ReferralItemWrapper>
  ));

  return (
    <PageContainer>
      <ContentWrapper>
        {loading ? (
          <Spinner />
        ) : (
          <>
            <Header>
              <Title>
                {referrals.length} <span style={{ color: "#507cff" }}>Users</span>
              </Title>
              <Subtitle>Your Referral Network</Subtitle>
              <TotalEarnings>
                Total Earnings: +{formatNumber(totalEarnings)}
              </TotalEarnings>
            </Header>

            <Section>
              <h2 className="text-xl font-semibold text-[#262626] mb-4">My Invite Link</h2>
              <InviteLinkWrapper>
                <InviteLink>
                  https://t.me/liboo_tonbot?start=r{id}
                </InviteLink>
                <CopyButton onClick={copyToClipboard}>
                  {copied ? "Copied!" : "Copy"}
                </CopyButton>
              </InviteLinkWrapper>
            </Section>

            <ReferralsSection>
              <h2 className="text-xl font-semibold text-[#262626] mb-6">My Referrals</h2>
              <ReferralsContainer ref={scrollContainerRef}>
                {referrals.length === 0 ? (
                  <p className="text-center text-gray-600 py-8">
                    You don't have any referrals yet. Start sharing your link!
                  </p>
                ) : (
                  <ReferralsList>
                    <AnimatePresence>
                      {referrals.map((user, index) => (
                        <ReferralItem key={user.id || index} user={user} index={index} />
                      ))}
                    </AnimatePresence>
                  </ReferralsList>
                )}
              </ReferralsContainer>
            </ReferralsSection>

            <ClaimLeveler claimLevel={claimLevel} setClaimLevel={setClaimLevel} />
          </>
        )}
        <Outlet />
      </ContentWrapper>
    </PageContainer>
  );
};

export default React.memo(Ref);
