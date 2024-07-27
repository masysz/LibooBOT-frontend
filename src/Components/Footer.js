import React from "react";
import { NavLink } from "react-router-dom";
import frams from "../images/ref4.webp";
import tasks from "../images/tasks2.webp";
import tap from "../images/main-logo.png";
import boost from "../images/booster2.webp";
import donate from "../images/donate.png";
import leaderboard from "../images/leaderboard.png";

const Footer = () => {
  const navItems = [
    { name: "Frens", icon: frams, path: "/ref" },
    { name: "Tasks", icon: tasks, path: "/tasks" },
    { name: "Tap", icon: tap, path: "/" },
    { name: "Boost", icon: boost, path: "/boost" },
    { name: "Donate", icon: donate, path: "/donate" },
    { name: "Leaderboard", icon: leaderboard, path: "/tapsleaderboard" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-[#E6E6FA] to-[#F0F8FF] p-2 rounded-t-3xl shadow-lg">
      <div className="flex items-center justify-between max-w-md mx-auto">
        {navItems.map((item, index) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) => `
              flex flex-col items-center justify-center
              w-1/6 py-1 px-2
              transition-all duration-300 ease-in-out
              ${isActive ? 'text-[#4169E1] scale-110' : 'text-[#6A5ACD] hover:text-[#4169E1] hover:scale-105'}
            `}
          >
            {({ isActive }) => (
              <>
                <div
                  className={`
                    ${index === 2 ? 'w-12 h-12' : 'w-9 h-9'}
                    flex items-center justify-center
                    rounded-full
                    ${isActive ? 'bg-[#B0E0E6]' : 'bg-[#F0F8FF]'}
                    ${index === 2 ? 'border-3' : 'border-2'}
                    ${isActive ? 'border-[#4169E1]' : 'border-[#B0C4DE]'}
                    transition-all duration-300 ease-in-out
                    hover:shadow-md
                  `}
                >
                  <img
                    src={item.icon}
                    alt={item.name}
                    className={`${index === 2 ? 'w-6 h-6' : 'w-5 h-5'} transition-all duration-300 ease-in-out`}
                  />
                </div>
                <span className={`mt-1 text-[9px] ${index === 2 ? 'font-bold' : 'font-medium'} poppins-bold`}>
                  {item.name}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </div>
  );
};

export default Footer;