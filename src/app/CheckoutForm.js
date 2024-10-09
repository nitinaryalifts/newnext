"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import CurrencyInput from "react-currency-input-field";
import { FaCartPlus } from "react-icons/fa";
import { BsCartXFill } from "react-icons/bs";
// import { MdOutlineMail, MdOutlinePhoneAndroid } from "react-icons/md";
// import { IoLogoWhatsapp } from "react-icons/io5";
import { FaCcStripe, FaCcVisa, FaCcDiscover } from "react-icons/fa";
import { FaCcPaypal, FaCcMastercard } from "react-icons/fa6";
import styles from "./OffCanvas.module.css";
import "./Custom.css";
import { useDoses } from "./DoseContext";
import CurrencyDropdown from "./CurrencyDropdown";
import ChariotButton from './react-chariot-connect'; 

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_SANDBOX_KEY);

function CheckoutForm({
  amount = 0,
  quantity,
  onQuantityChange,
  onSuccessPayment,
  handlePaymentFailure,
  cart,
  productName,
}) { 
  const { getSponsors,updateDoses } = useDoses();
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [paymentType, setPaymentType] = useState("one-time");
  const [frequency, setFrequency] = useState("");
  const [remainingAmount, setRemainingAmount] = useState(amount);
  const [paymentSuccessful, setPaymentSuccessful] = useState(false);
  const [updatedsponsors, setupdatedsponsors] = useState([]);
  const [currency, setCurrency] = useState("USD");

  console.log({cart})

  const handleChangeQuantity = () => {
    onQuantityChange(); // Invoke the function passed as a props
  };

  const handleCurrencyChange = (selectedOption) => {
    setCurrency(selectedOption.value);
  };

  const convertAmount = (amount, currency) => {
    const currencyRates = {
      USD: 1,
      EUR: 0.85,
      GBP: 0.75,
      ILS: 3.3,
      CAD: 1.25,
      ZAR: 15.0,
    }; 
    return Math.round(amount * currencyRates[currency]);
  };

  const checkAvailableDoses = async () => {
    const allSponsors = await getSponsors();
    if (!Array.isArray(allSponsors)) {
      setError("Failed to fetch sponsors. Please try again later.");
      return false;
    }
    for (const item of cart) {
      const sponsor = allSponsors.find((s) => s.id === item.id);
      if (sponsor && item.quantity > sponsor.availableDoses) {
        setError(
          `Insufficient doses for ${item.name}. Available: ${sponsor.availableDoses}`
        );
        return false;
      }
    }
    return true;
  };

  const calculateInstallmentAmount = (months) => {
    const convertedAmount = convertAmount(amount, currency);
    return Math.round(convertedAmount / months);
  };

  const frequencyOptions = [
    { months: 3, amount: calculateInstallmentAmount(3) },
    { months: 6, amount: calculateInstallmentAmount(6) },
    { months: 9, amount: calculateInstallmentAmount(9) },
    { months: 12, amount: calculateInstallmentAmount(12) },
    
  ];
  const handleFrequencyChange = (selectedFrequency) => {
    setFrequency(selectedFrequency);
    const selectedOption = frequencyOptions.find(
      (option) => option.months === parseInt(selectedFrequency)
    );
    if (selectedOption) {
      const totalPaid = selectedOption.amount;
      setRemainingAmount(amount - totalPaid);
    }
  };
  const handleSubmit = async (event) => {
    event.preventDefault();
    const dosesAvailable = await checkAvailableDoses();
    const sponsorId = cart[0]?.id
    if (!dosesAvailable) {
      return; // Early return if doses are insufficient
    }
    if (!stripe || !elements) {
      return;
    }

    // Validate amount
    if (isNaN(amount) || amount <= 0) {
      setError("Amount must be greater than $0");
      return;
    }

    if (!name) {
      setError("Name is required");
      return;
    }
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setError("A valid email is required");
      return;
    }

    if (paymentType === "monthly" && !frequency) {
      setError("Please select a subscription frequency");
      return;
    }
    setLoading(true);
    setError(""); // Clear any previous errors
    setSuccessMessage(""); // Clear previous messages

    // Create a payment method
    const cardElement = elements.getElement(CardElement);
    const { error: paymentMethodError, paymentMethod } =
      await stripe.createPaymentMethod({
        type: "card",
        card: cardElement,
      });

    if (paymentMethodError) {
      setError(paymentMethodError.message);
      setLoading(false);
      return;
    }

    const response = await fetch("/api/create-payment-intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: formattedAmount,
        quantity,
        name,
        email,
        productName,
        paymentType,
        frequency,
        paymentMethodId: paymentMethod.id,
        currency,
      }),
    });
    // Handle response status
    if (response.status === 400) {
      const errorResponse = await response.json(); // Get the error message from the response
      setError(
        errorResponse.error || "There was an error processing your request."
      );
      setLoading(false);
      return;
    }

    const { clientSecret, subscriptionId } = await response.json();
    // Confirm the payment
    if (paymentType === "monthly") {
     // console.log(subscriptionId);
      onSuccessPayment();
      setSuccessMessage(
        "Subscription created successfully! You will recieve an email Where you will be able to add text and give the dedication for each dose."
      );
      setLoading(false);
      const updateDose = await updateDoses(sponsorId, quantity);
      console.log(updateDose);
      return;
    }

    // Confirm the payment
    const { error: stripeError, paymentIntent } =
      await stripe.confirmCardPayment(clientSecret, {
        payment_method: paymentMethod.id, // Use payment method ID here
      });

    if (stripeError) {
     // console.log(stripeError);
      // Handle card decline error
      switch (stripeError.code) {
        case "card_declined":
          setError(
            "Your card was declined. Please check your card details or try a different card."
          );
          break;
        case "expired_card":
          setError("Your card has expired. Please use a different card.");
          break;
        case "incorrect_cvc":
          setError("The CVC code is incorrect. Please check and try again.");
          break;
        default:
          setError(stripeError.message); // Fallback for any other errors
          break;
      }
      handlePaymentFailure();
      setLoading(false);
      return;
    } else if (paymentIntent.status === "succeeded") {
      // Handle successful payment here

      setSuccessMessage(
        "Payment successful! Thank you for your donation.You will recieve an email Where you will be able to add text and give the dedication for each dose."
      );
      const updateDose = await updateDoses(sponsorId , quantity);
      console.log(updateDose);

      setLoading(false);
      onSuccessPayment();
    }
  };

  const formattedAmount = convertAmount(amount, currency);

  return (
    <>
      <div className="d-flex align-items-center gap-3">
        <FaCartPlus className="cartIcon" />
        <h2 className="fs-4 mb-0 fw-bolder">Cart</h2> 
      </div>
      <form className="checkoutForm mt-4" onSubmit={handleSubmit}>
        <label>
          <span className="customLabel">Total To Donate:</span>
          <div className="currenyBox d-flex gap-2 position-relative">
            <CurrencyInput
              className="tatal_pay"
              name="amount"
              value={formattedAmount}
              prefix={
                currency === "USD"
                  ? "$"
                  : currency === "EUR"
                  ? "€"
                  : currency === "GBP"
                  ? "£"
                  : currency === "ILS"
                  ? "₪"
                  : currency === "CAD"
                  ? "$"
                  : currency === "ZAR"
                  ? "R"
                  : ""
              }
              
              decimalsLimit={2}
              disabled // Make the input read-only
            />
            <CurrencyDropdown
              selectedCurrency={currency}
              onCurrencyChange={handleCurrencyChange}
            />
          </div>
        </label>
        <label>
          <span className="customLabel d-block">Select Payment Type:</span>
          <label>
            <input
              type="radio"
              value="one-time"
              checked={paymentType === "one-time"}
              onChange={() => setPaymentType("one-time")}
            />
            One-Time Payment
          </label>
          <label>
            <input
              type="radio"
              value="monthly"
              checked={paymentType === "monthly"}
              onChange={() => setPaymentType("monthly")}
            />
            Monthly Installments
          </label>
        </label>
        {paymentType === "monthly" && (
          <>
            <label>
              <span className="customLabel">Frequency:</span>
            </label>
            <select
              className="form-select monthlyScr"
              value={frequency}
              onChange={(e) => handleFrequencyChange(e.target.value)}
              required={paymentType === "monthly"}
            >
              <option value="">Select Frequency</option>
              {frequencyOptions.map((option) => (
                <option key={option.months} value={option.months}>
                  {currency === "USD"
                    ? "$"
                    : currency === "EUR"
                    ? "€"
                    : currency === "GBP"
                    ? "£"
                    : currency === "ILS"
                    ? "₪"
                    : currency === "CAD"
                    ? "$"
                    : currency === "ZAR"
                    ? "R"
                    : ""}
                  {option.amount} a month for {option.months} Month
                  {option.months > 1 ? "s" : ""}
                </option>
              ))}
            </select>
            {frequency && (
              <small className="remaining-amount">
                Remaining amount after selected frequency:{" "}
                <b>
                  {currency === "USD"
                    ? "$"
                    : currency === "EUR"
                    ? "€"
                    : currency === "GBP"
                    ? "£"
                    : currency === "ILS"
                    ? "₪"
                    : currency === "CAD"
                    ? "$"
                    : currency === "ZAR"
                    ? "R"
                    : ""}{Math.floor(remainingAmount)}</b>
              </small>
            )}
          </>
        )}
        <label>
          <span className="customLabel">Name:</span>
          <input
            required
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name"
          />
        </label>
        <label>
          <span className="customLabel">Email:</span>
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
          />
        </label>

        {/* <label>
        <span className='customLabel'>Dedication:</span>
        <textarea required
          value={dedication}
          onChange={(e) => setDedication(e.target.value)}
          placeholder="Enter your dedication text here"
        />
      </label> */}

        <label>
          <span className="customLabel">Enter Card Details:</span>
        </label>
        <CardElement options={{ hidePostalCode: true }} />
        {error && (
          <p className="text-center pt-2" style={{ color: "red" }}>
            {error}
          </p>
        )}
        {successMessage && (
          <p className="text-center pt-2" style={{ color: "green" }}>
            {successMessage}
          </p>
        )}
        <p className="fixText text-center pt-2">
          You will receive an email with more information regarding your
          dedications for your sponsors chapters
        </p>
        <div className="bthgroup d-flex justify-content-center flex-column gap-5 mt-4">
          <button
            className="custombtn text-uppercase"
            type="submit"    
            disabled={!stripe || loading}
          >
            {loading ? "Processing…" : "donate now"}
          </button>
          <ChariotButton email={email}  formattedAmount ={formattedAmount} name ={name}/> 
          <button
            className="backbth"
            type="button"
            onClick={handleChangeQuantity}
          >
            Back to Cart
          </button>
        </div>
      </form>
    
      <div className="contact_info pt-5">
        {/* <h4>Contact Information </h4>
      <ul className="footerContact list-unstyled d-flex gap-2 flex-wrap justify-content-center pb-3">
        <li><Link href="tel:9176810003"><MdOutlinePhoneAndroid className="footerIcons" /><span>91 7681 0003</span></Link></li>
        <li><Link href="https://api.whatsapp.com/send/?phone=19176810003&text=add+me&type=phone_number&app_absent=0" target="_blank"><IoLogoWhatsapp className="footerIcons" /><span>91 7681 0003</span></Link></li>
        <li><Link href="mailto:shimon@torahanytime"><MdOutlineMail className="footerIcons" /><span>shimon@torahanytime</span></Link></li>
      </ul> */}
        <h4>Payment Methods</h4>
        <ul className="list-unstyled d-flex gap-2 justify-content-center">
          <li>
            <FaCcStripe className="cartIcons" />
          </li>
          <li>
            <FaCcPaypal className="cartIcons" />
          </li>
          {/* <li><FaCcVisa className="cartIcons" /></li>
        <li><FaCcMastercard className="cartIcons" /></li>
        <li><FaCcDiscover className="cartIcons" /></li> */}
        </ul>
      </div>
    </>
  );
}
      
export default function Payment({
  amount = 0,
  quantity,
  onQuantityChange,
  onSuccess,
  itemName,
  cart,
  isModalVisible,
}) {
  const { handlePaymentFailure, emptyCart, fetchSponsors, getSponsors } =
    useDoses();
  return (
    <>
      <Elements stripe={stripePromise}>
        {cart.length > 0 ? (
          <CheckoutForm
            amount={amount}
            quantity={quantity}
            onQuantityChange={onQuantityChange}
            onSuccessPayment={onSuccess}
            handlePaymentFailure={handlePaymentFailure}
            cart={cart}
            productName={itemName}
          />
        ) : (
          <div>
            <div
              className={`${styles.cartHeader} d-flex align-items-center gap-3`}
            >
              <FaCartPlus className="cartIcon" />
              <h2 className="fs-4 mb-0 fw-bolder">Cart</h2>
            </div>
            <div className="emptyCart text-center d-flex justify-content-center vh-100 w-100 align-items-center">
              <div className="emptyCartContent">
                <BsCartXFill className="empCartIcon" />
                <p className="pt-2">Your cart is empty.</p>
              </div>
            </div>
          </div>
        )}
      </Elements>
    </>
  );
}
