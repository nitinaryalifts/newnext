import React, { useState, useEffect } from "react";
import PropTypes from "prop-types"; // Import PropTypes
import styles from "./QuantityButton.module.css"; // Optional: for styling
import { useDoses } from "./DoseContext";
import SoldOutModal from './SoldOutModal'; 
const limitAmountClass = parseInt(process.env.NEXT_PUBLIC_APP_LIMIT_AMOUNT_CLASS, 10);
const QuantityButton = ({
  initialQuantity,
  maxQuantity,
  onQuantityChange,
  sponsorId,
  isInitialAddition,
  setIsInitialAddition,
  cart
}) => {
  const {getTotalLeftDoses } = useDoses();
  const [quantity, setQuantity] = useState(initialQuantity);
  const [initialAddition, setInitialAddition] = useState(isInitialAddition);
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  //const [cart, setCart] = useState([]);
  const [popupMessage, setPopupMessage] = useState('');      

  useEffect(() => {
    setQuantity(initialQuantity); // Reset quantity when initialQuantity changes
  }, [initialQuantity]);

  useEffect(() => {
    setInitialAddition(isInitialAddition); // Update initialAddition state when prop changes
  }, [isInitialAddition]);

  const increment = (event) => {
    event.preventDefault();
    const totalLeftDoses = getTotalLeftDoses();
   //console.log(limitAmountClass);
  const totalCartQuantity = cart.reduce((accumulator, item) => accumulator + item.quantity, 0);
  const AvailableDocs = Math.max(totalLeftDoses - (totalCartQuantity +1), 0);
    //setPayVisible(false);
    if (AvailableDocs <= limitAmountClass) {
        setPopupMessage('All doses are sold out');
        setIsPopupVisible(true);
       //console.log('test',isPopupVisible);
        return;
    }
    if (quantity < maxQuantity) {
      setQuantity((prevQuantity) => {
        const newQuantity = prevQuantity + 1;
        onQuantityChange(newQuantity);
        return newQuantity;
      });
    }
  };

  const decrement = (event) => {
    event.preventDefault();
    //console.log('test decrement');
    setQuantity((prevQuantity) => {
      const newQuantity = Math.max(prevQuantity - 1, 0); // Prevent going below 0
      onQuantityChange(newQuantity);
      return newQuantity;
    });
  };

   const closePopup = () => {
        setIsPopupVisible(false);
        setPopupMessage('');
    };


  return (
    <div className="quanityBtn">
      <div className={styles.quantityContainer}>
        <button className={styles.quantityButton} onClick={decrement}>
          -
        </button>
        <span className={styles.quantityDisplay}>{quantity}</span>
        <button
          className={styles.quantityButton}
          onClick={increment}
          disabled={quantity >= maxQuantity && maxQuantity > 1}
        >
          +

        </button>
      </div>
      {isPopupVisible && (
        <SoldOutModal message={popupMessage} onClose={closePopup} />
      )}
    </div>
    
  );
};
  QuantityButton.propTypes = {
    initialQuantity: PropTypes.number.isRequired,
    maxQuantity: PropTypes.number.isRequired,
    onQuantityChange: PropTypes.func.isRequired,
    isInitialAddition: PropTypes.bool,
    setIsInitialAddition: PropTypes.func,
  // cart
  };

export default QuantityButton;
