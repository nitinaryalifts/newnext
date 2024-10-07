// SuccessModal.js
import React from 'react';
import styles from './SuccessModal.module.css'; // Add your own styles
import "./Custom.css";
import Link from 'next/link';

const SoldOutModal = ({ message, onClose }) => {
  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        {/* <h5>Payment Successful!</h5> */}
        {/* <h1 className='conText pb-2 fw-semibold'>Congratulations!!</h1> */}
        <p>{message}</p>
        {/* <p className='small'>Click here to pre-order the book and receive it right when it comes out of print.</p> */}
         {/* <Link href="/"  className={styles.closeButton} >Link here</Link> */}

          <button onClick={onClose} className={styles.closeButton}>
            Close
          </button> 
      </div>
    </div>
  );
};

export default SoldOutModal;
