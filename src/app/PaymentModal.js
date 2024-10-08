"use client";
import React, { useEffect, useState } from 'react';
import { DoseProvider } from './DoseContext';
import Payment from './CheckoutForm';
import "./Custom.css";
import styles from './PaymentModal.module.css'; // You can use CSS modules or any other styling method

const PaymentModal = ({ isOpen, onClose, maxQuantityDose }) => {
  const [maxQuantityAvailDose, setMaxQuantityAvailDose] = useState(maxQuantityDose);

  useEffect(() => {
    setMaxQuantityAvailDose(maxQuantityDose);

    if (isOpen) {
      document.body.style.overflow = 'hidden'; // Prevent scroll when modal is open
    } else {
      document.body.style.overflow = 'unset'; // Restore scroll when modal is closed
    }

    return () => {
      document.body.style.overflow  = 'unset'; // Cleanup on unmount
    };
  }, [isOpen, maxQuantityDose]);

  if (!isOpen) return null;

  const handleOverlayClick = () => {
    onClose(); // Close the modal when clicking on the overlay
  };

  const handleContentClick = (e) => {
    e.stopPropagation(); // Prevent clicks inside the modal content from closing the modal
  };


  return (
    <div className='cart'>
      <div className={styles.modalOverlay} onClick={handleOverlayClick}>
        <div className={styles.modalContent} onClick={handleContentClick}>
          <h5>Cart</h5>
          <Payment maxQuantityDose={maxQuantityAvailDose} />
          <button onClick={onClose} >Close</button>
        </div>
      </div>
    </div>

  );
};

export default PaymentModal;