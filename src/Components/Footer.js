import React from "react";
import { NavLink } from "react-router-dom";
import frams from "../images/ref4.webp";
import tasks from "../images/tasks2.webp";
import tap from "../images/main-logo.png";
import boost from "../images/booster2.webp";
import donate from "../images/stats.webp";

const Footer = () => {
  const navItems = [
    { name: "Frens", icon: frams, path: "/ref" },
    { name: "Tasks", icon: tasks, path: "/tasks" },
    { name: "Tap", icon: tap, path: "/" },
    { name: "Boost", icon: boost, path: "/boost" },
    { name: "Donate", icon: donate, path: "/donate" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-[#E6E6FA] p-2 rounded-t-2xl">
      <div className="flex items-center justify-between max-w-md mx-auto">
        {navItems.map((item, index) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) => `
              ${index === 2 ? 'w-1/4' : 'w-1/5'}
              flex flex-col items-center justify-center
              ${index === 2 ? '-mt-6' : ''}
              ${isActive ? 'text-[#4169E1] poppins-bold' : 'text-[#6A5ACD] poppins-bold'}
            `}
          >
            {({ isActive }) => (
              <>
                <div
                  className={`
                    ${index === 2 ? 'w-16 h-16' : 'w-12 h-12'}
                    flex items-center justify-center
                    rounded-full
                    ${isActive ? 'bg-[#B0E0E6]' : 'bg-[#F0F8FF]'}
                    ${index === 2 ? 'border-4' : 'border-2'}
                    ${isActive ? 'border-[#4169E1]' : 'border-[#B0C4DE]'}
                  `}
                >
                  <img
                    src={item.icon}
                    alt={item.name}
                    className={`${index === 2 ? 'w-8 h-8' : 'w-6 h-6'}`}
                  />
                </div>
                <span className={`mt-1 text-xs ${index === 2 ? 'font-bold poppins-bold' : 'font-medium poppins-bold'}`}>
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