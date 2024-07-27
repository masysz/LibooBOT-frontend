import React from "react";
import { NavLink } from "react-router-dom";
import frams from "../images/ref4.webp";
import tasks from "../images/tasks2.webp";
import tap from "../images/main-logo.png";
import boost from "../images/booster2.webp";
import donate from "../images/donate.png";

const Footer = () => {
  const navItems = [
    { name: "Frens", icon: frams, path: "/ref" },
    { name: "Tasks", icon: tasks, path: "/tasks" },
    { name: "Tap", icon: tap, path: "/" },
    { name: "Boost", icon: boost, path: "/boost" },
    { name: "Donate", icon: donate, path: "/donate" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-[#4169E1] to-[#6A5ACD] p-2 rounded-t-3xl shadow-lg">
      <div className="flex items-center justify-between max-w-md mx-auto">
        {navItems.map((item, index) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) => `
              flex flex-col items-center justify-center
              w-1/5 py-1
              transition-all duration-300 ease-in-out
              ${isActive ? 'text-white scale-110' : 'text-[#B0E0E6] hover:text-white hover:scale-105'}
            `}
          >
            {({ isActive }) => (
              <>
                <div
                  className={`
                    ${index === 2 ? 'w-14 h-14 -mt-5' : 'w-10 h-10'}
                    flex items-center justify-center
                    rounded-full
                    ${isActive ? 'bg-white' : 'bg-[#F0F8FF]'}
                    transition-all duration-300 ease-in-out
                    hover:shadow-md
                  `}
                >
                  <img
                    src={item.icon}
                    alt={item.name}
                    className={`${index === 2 ? 'w-8 h-8' : 'w-6 h-6'} transition-all duration-300 ease-in-out`}
                  />
                </div>
                <span className={`mt-1 text-[10px] ${index === 2 ? 'font-bold' : 'font-medium'} poppins-bold`}>
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