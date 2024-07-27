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
    <div className="fixed bottom-0 left-0 right-0 bg-white p-2 shadow-md border-t border-gray-200">
      <div className="flex items-center justify-between max-w-lg mx-auto space-x-1">
        {navItems.map((item, index) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) => `
              flex flex-col items-center justify-center w-full
              text-sm font-medium transition-all duration-300
              ${isActive ? 'text-blue-600' : 'text-gray-600'}
            `}
          >
            {({ isActive }) => (
              <>
                <div
                  className={`
                    w-10 h-10 flex items-center justify-center
                    rounded-full
                    ${isActive ? 'bg-blue-100' : 'bg-gray-100'}
                    border-2 ${isActive ? 'border-blue-600' : 'border-gray-300'}
                    transition-all duration-300
                  `}
                >
                  <img
                    src={item.icon}
                    alt={item.name}
                    className="w-6 h-6"
                  />
                </div>
                <span className="mt-1">{item.name}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </div>
  );
};

export default Footer;