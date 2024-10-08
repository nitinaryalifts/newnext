// SuccessModal.js
import React from 'react';
import styles from './SuccessModal.module.css'; // Add your own styles
import "./Custom.css";
import Link from 'next/link';

const SuccessModal = ({ message, onClose }) => {
  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h5>Payment Successful!</h5>
        <h1 className='conText pb-2 fw-semibold'>Congratulations!!</h1>
        <p>{message}</p>
        <p className='small px-4 px-sm-5'>Click here to pre-order the book and receive it right when it comes out of print.</p>
         <Link href="https://newrwbook.myshopify.com/products/daily-dose-book" target="_blank" onClick={onClose} className={`paymenysuccesBtn ${styles.closeButton}`}>Pre-order now</Link>

          {/* <button onClick={onClose} className={styles.closeButton}>
            Link come here
          </button> */}
      </div>
    </div>
  );
};

export default SuccessModal;
