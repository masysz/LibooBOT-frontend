import React from "react";
import { NavLink } from "react-router-dom";
import frams from "../images/ref4.webp";
import tasks from "../images/tasks2.webp";
import tap from "../images/main-logo.png";
import boost from "../images/booster2.webp";
import donate from "../images/donate.png";

const Footer = () => {
  const navItems = [
    { name: "Tap", icon: tap, path: "/" },
    { name: "Frens", icon: frams, path: "/ref" },
    { name: "Tasks", icon: tasks, path: "/tasks" },
    { name: "Boost", icon: boost, path: "/boost" },
    { name: "Donate", icon: donate, path: "/donate" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-[#E6E6FA] p-4 rounded-t-2xl shadow-lg">
      <div className="flex items-center justify-around max-w-lg mx-auto space-x-4">
        {navItems.map((item, index) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) => `
              flex flex-col items-center justify-center
              ${isActive ? 'text-[#4169E1] poppins-bold' : 'text-[#6A5ACD] poppins-extrabold'}
              transition-all duration-300 ease-in-out
            `}
          >
            {({ isActive }) => (
              <>
                <div
                  className={`
                    ${index === 0 ? 'w-16 h-16' : 'w-12 h-12'}
                    flex items-center justify-center
                    rounded-full
                    ${isActive ? 'bg-[#B0E0E6]' : 'bg-[#F0F8FF]'}
                    ${index === 0 ? 'border-4' : 'border-2'}
                    ${isActive ? 'border-[#4169E1]' : 'border-[#B0C4DE]'}
                    transition-all duration-300 ease-in-out
                  `}
                >
                  <img
                    src={item.icon}
                    alt={item.name}
                    className={`${index === 0 ? 'w-8 h-8' : 'w-6 h-6'}`}
                  />
                </div>
                <span className={`mt-1 text-xs ${index === 0 ? 'font-bold poppins-bold' : 'font-medium poppins-bold'}`}>
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