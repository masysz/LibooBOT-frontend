import React, { useEffect, useState } from 'react';
import { IoClose } from 'react-icons/io5';

const Modal = ({ isVisible, onClose, children }) => {
  const [animationClass, setAnimationClass] = useState('translate-y-full');

  useEffect(() => {
    if (isVisible) {
      setTimeout(() => setAnimationClass('translate-y-0'), 10);
    } else {
      setAnimationClass('translate-y-full');
    }
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className={`w-full max-w-md bg-[#BCCFFFF2] rounded-t-[20px] transform transition-transform duration-300 ease-out ${animationClass}`}>
        <div className="relative p-6">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-[#9a96a6]"
          >
            <IoClose size={24} />
          </button>
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;