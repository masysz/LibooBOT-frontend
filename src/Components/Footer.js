import React from "react";
import { NavLink } from "react-router-dom";
import "./Footer.css"; // We'll create this file for the styles

// Import your images here
import refIcon from "../images/ref4.webp";
import tasksIcon from "../images/tasks2.webp";
import tapIcon from "../images/coins-6.webp";
import boostIcon from "../images/booster2.webp";
import donateIcon from "../images/stats.webp";
import walletIcon from "../images/wallet2.webp";

const FooterItem = ({ to, icon, label }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `footer-item ${isActive ? "active" : ""}`
    }
  >
    <img src={icon} alt={label} className="footer-icon" />
    <span className="footer-label">{label}</span>
  </NavLink>
);

const Footer = () => {
  const menuItems = [
    { to: "/ref", icon: refIcon, label: "Ref" },
    { to: "/tasks", icon: tasksIcon, label: "Tasks" },
    { to: "/", icon: tapIcon, label: "Tap" },
    { to: "/boost", icon: boostIcon, label: "Boost" },
    { to: "/donate", icon: donateIcon, label: "Donate" },
    { to: "/connect", icon: walletIcon, label: "Wallet" },
  ];

  return (
    <footer className="footer">
      <div className="footer-container">
        {menuItems.map((item) => (
          <FooterItem key={item.to} {...item} />
        ))}
      </div>
    </footer>
  );
};

export default Footer;