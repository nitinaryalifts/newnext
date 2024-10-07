import React, { useEffect, useRef, useState } from 'react';
import Payment from './CheckoutForm'; // Make sure this path is correct
import { FaCartPlus } from "react-icons/fa";
import { BsCartXFill } from "react-icons/bs";
import QuantityButton from './QuantityButton';
import styles from './OffCanvas.module.css';
import "./Custom.css";
import { useDoses } from './DoseContext';
import SuccessModal from './SuccessModal'; 

const OffCanvas = ({ isVisible, onClose, cart, setCart, onQuantityChange }) => {
  const [isPaymentVisible, setIsPaymentVisible] = useState(false);
  const offCanvasRef = useRef(null);
  const { sponsors, emptyCart,updateDoses } = useDoses();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
 
  const calculateTotalAmount = () => {

    const totalQuantity = cart.reduce((acc, item) => acc + item.quantity, 0);
    const totalAmount = cart.reduce((acc, item) => acc + item.amount, 0);

    const freeItems = Math.floor(totalQuantity / 5);

    const chargeableAmount = cart.reduce((acc, item) => {
      const pricePerItem = item.amount / item.quantity;
      const chargeableQuantity = item.quantity - freeItems * (item.quantity / totalQuantity);
      return acc + (pricePerItem * chargeableQuantity);
    }, 0);

    const discount = totalAmount - chargeableAmount;
	  let discountMessage = '';
	  if (discount === 0) {
		const itemsNeededForDiscount = 5 - (totalQuantity % 5);
		discountMessage = `Add ${itemsNeededForDiscount} more chapter${itemsNeededForDiscount > 1 ? 's' : ''} to get a free chapter discount!`;
	  }
	const productName = cart.map(item => item.name).join(', ')
    return {
      chargeableAmount: totalAmount,
      discount,
      finalAmount: chargeableAmount,
	  discountMessage,
	  productName
    };
  };

  const { chargeableAmount, discount, finalAmount,discountMessage,productName  } = calculateTotalAmount();

  const totalQuantity = cart.reduce((acc, item) => acc + item.quantity, 0);

  const [isInitialAddition, setIsInitialAddition] = useState(false);
  
  
  const handlePayNowClick = () => {
     setIsPaymentVisible(true);
  };

  const handleQuantityChangeFromCheckout = () => {
    setIsPaymentVisible(false);
  };
  
    const handlePaymentSuccess = () => {
		cart.forEach(item => {
            updateDoses(item.id, item.quantity);
        });
		 //setIsPaymentVisible(false);
        const cartCleared = emptyCart(); // Get signal to clear cart
        if (cartCleared) {
            setCart([]); // Clear the cart state
            //onClose(); // Close the off-canvas
        }
		setModalMessage('You have successfully sponsored your chosen doses. You will receive an email shortly with more information regarding your custom dedications for your chapters.');
		setIsModalVisible(true); // Show the modal
		};
	
	const closeModal = () => {
    setIsModalVisible(false); // Close the modal
	onClose();
  };
	
  // Close the off-canvas when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (offCanvasRef.current && !offCanvasRef.current.contains(event.target)) {
        onClose();
		 setIsPaymentVisible(false);
      }
    };

    if (isVisible) {
      // Adding the event listener for mouse and touch events
      // window.addEventListener('mousedown', handleClickOutside);
      window.addEventListener('touchstart', handleClickOutside); // For mobile devices
    } else {
      // window.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('touchstart', handleClickOutside);
    }

    return () => {
      // window.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isVisible, onClose]);
  
  return (
    <div className={`shadow ${styles.offCanvas} ${isVisible ? styles.visible : ''}`} ref={offCanvasRef}>
      <button className={styles.closeButton} onClick={onClose}>
        &times;
      </button>
      <div className={`${styles.content} pb-sm-5 pb-3`}>
        {isPaymentVisible ? (
          <Payment 
            amount={finalAmount} 
            quantity={totalQuantity} 
            onQuantityChange={handleQuantityChangeFromCheckout} 
            onSuccess={handlePaymentSuccess} 
            itemName={productName}
            cart={cart}
            setModalMessage={setModalMessage}
            setIsModalVisible={setIsModalVisible} // Pass function to set modal visibility
          />
        ) : (
          <>
            <div className={`${styles.cartHeader} d-flex align-items-center gap-3`}>
              <FaCartPlus className="cartIcon" />
              <h2 className='fs-4 mb-0 fw-bolder'>Cart</h2>
            </div>
            {cart.length === 0 ? (
              <div className='emptyCart text-center ga d-flex justify-content-center vh-100 w-100 align-items-center'>
                <div className='emptyCartContent'>
                  <BsCartXFill className='empCartIcon' />
                  <p className='pt-2'>Your cart is empty.</p>
                </div>
              </div>    
            ) : (
              <>
                <ul className='cartItems list-unstyled mt-5 mt-sm-4'>
                 {cart.map((item, index) => {  
                    const sponsor = sponsors.find(s => s.id === item.id); 
					const availableDoses = sponsor ? sponsor.availableDoses : 0; // Get available doses
					const remainingDoses = availableDoses - item.quantity;
                    return (
                      <li key={item.id} className="d-flex flex-column align-items-center gap-2 pt-3">
                        <img src={item.avatarUrl} alt={item.name} />
                        <p className='s_name'>{item.name}</p>

                        <div className="btm_part gap-2">
                          <span className="A_dose">
                            Available chapter: {remainingDoses}
                          </span>
                          <QuantityButton
                            initialQuantity={item.quantity}
                            onQuantityChange={(newQuantity) => onQuantityChange(item.id, newQuantity, item)}
                            sponsorId={item.id}
                            maxQuantity={item.doses}
                            cart={cart}
                          />
                        </div>
                      </li>
                    );
                  })}
                </ul>
                <div className={styles.totalAmount}>
                  <p className='text-center fs-6 fw-lighter'>
                    {discount > 0 ? (
                      <>
                        <span>Original Amount: <span className='fw-bold'>${chargeableAmount.toFixed(2)}</span></span>
                        <br />
                        <span>Discount: <span className='fw-bold'>-${discount.toFixed(2)}</span></span>
                      </>
                    ) : (
                      discountMessage && (
                        <p className='text-danger'>{discountMessage}</p>
                      )
                    )}
                  </p>
                  <h3 className='subtotal text-center'>
                    Total: <span className='fw-bold'>${finalAmount.toFixed(2)}</span>
                  </h3>
                </div>
                <div className='d-flex justify-content-center flex-column mt-4'>
                  <button onClick={handlePayNowClick} className="custombtn text-uppercase">
                    donate now
                  </button>
                </div>
              </>
            )}
          </>
        )}
      </div>

      {isModalVisible && (
        <SuccessModal message={modalMessage} onClose={closeModal} />
      )}
    </div>
  );
};

export default OffCanvas; 