"use client";
// import Image from "next/image";
import Link from 'next/link';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import 'owl.carousel/dist/assets/owl.carousel.css';
import 'owl.carousel/dist/assets/owl.theme.default.css';
import { MdOutlineMail, MdOutlinePhoneAndroid } from "react-icons/md";
import { IoLogoWhatsapp } from "react-icons/io5";
// import { FaCcStripe, FaCcVisa, FaCcDiscover } from "react-icons/fa";
// import { FaCcPaypal, FaCcMastercard } from "react-icons/fa6";
import { TbHexagonNumber1Filled, TbHexagonNumber2Filled, TbHexagonNumber3Filled, TbHexagonNumber4Filled } from "react-icons/tb";
import "./Custom.css";
import { DoseProvider } from './DoseContext';
import { FaCartPlus } from "react-icons/fa";
import OffCanvas from './OffCanvas';
import Sponsors from './sponsors';


// Dynamically load OwlCarousel with SSR disabled
const OwlCarousel = dynamic(() => import('react-owl-carousel'), {
  ssr: false,
});


export default function Home() {
  const [isClient, setIsClient] = useState(false);
  const [isOffCanvasVisible, setIsOffCanvasVisible] = useState(false);
  const [cart, setCart] = useState([]);
  const [quantities, setQuantities] = useState({}); // Ensure this is defined
  const [hasCartChanged, setHasCartChanged] = useState(false);
  const [isInitialAddition, setIsInitialAddition] = useState(true);
  const [isPaymentVisible, setIsPaymentVisible] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);


  const handleCartIconClick = () => {
    setIsOffCanvasVisible(prev => !prev);
	setIsPaymentVisible(false);
  };


  // Only render the carousel on the client side
  if (!isClient) {
    return null; // Prevents rendering on the server side
  }

  const handleQuantityChange = (sponsorId, newQuantity, sponsor) => {
    const maxQuantity = sponsor.availableDoses;
	const quantityChange = newQuantity - sponsor.quantity; 
    if (newQuantity > maxQuantity) return;

    setQuantities(prevQuantities => ({
      ...prevQuantities,
      [sponsorId]: newQuantity
    }));

    setCart(prevCart => {
      const existingSponsor = prevCart.find(item => item.id === sponsorId);

      if (newQuantity === 0) {
        return prevCart.filter(item => item.id !== sponsorId);
      }

      if (existingSponsor) {
        return prevCart.map(item =>
          item.id === sponsorId
            ? { ...item, quantity: newQuantity, amount: newQuantity * 500 }
            : item
        );
      }
	setIsPaymentVisible(true);
      return [...prevCart, {
        id: sponsorId,
        name: sponsor.name,
        doses: sponsor.availableDoses,
        avatarUrl: sponsor.avatarUrl,
        quantity: newQuantity,
        amount: newQuantity * 500
      }];
    });

  };
  const totalQuantity = cart.reduce((acc, item) => acc + item.quantity, 0);

  const handleCloseOffCanvas = () => {
	setIsOffCanvasVisible(false);
	setIsPaymentVisible(false);
    setHasCartChanged(true);
  };

  return (
   <DoseProvider>
    <div className="site_content">
      <header id="header" className="header d-flex align-items-center position-absolute w-100">
        <div className="pageWidth container-fluid container-xl position-relative d-flex align-items-center justify-content-center justify-content-lg-between">
          <Link href="/" className="logo d-flex align-items-center mt-2 mt-ms-3">
            <h1 className="sitename">
              <img src="/new_logo.jpeg" alt="Logo" />
            </h1>
          </Link>
        </div>
      </header>
      <main className="main">
        <section id="hero" className="hero dark-background">
          <img src="/hero-bg.jpg" alt="Hero Background" className="hero-bg" />
          <div className="container pageWidth">
            <div className="row gy-lg-4 justify-content-between pt-2 pt-lg-0">
              <div className="col-4 ps-md-5 text-center order-last hero-img mt-0">
               {/*<img src="/topSpekarsList.png" className="TopSpekarsList"  alt="SpekarsList" />*/}
                {/* previous book */}
                {/* <img src="/book.png" className="img-fluid ps-md-5" alt="Hero Image" />  */}
                <img src="/newbook.png" className="img-fluid ps-md-5" alt="Hero Image" />
              </div>
              <div className="col-7 d-flex flex-column justify-content-center mt-sm-5">
                    <h1 className="mb-0 mb-sm-3">The new long-awaited Daily Dose Book is going to print!</h1>

                    <p className="d-none d-sm-block">This is your chance to sponsor a powerful TorahAnytime dose chapter and dedicate it in honor or memory of someone special. Your dedication message will show up in the beginning of your sponsored chapter. Your sponsorship will help spread timeless wisdom and bring inspiration to thousands around the world.</p>
                    <div className="d-flex flex-wrap align-items-center gap-3">
                    {/* <Link href="#SpeakerList" className="btn-get-started">Sponsor Dose Chapters - 1 for <span className="fw-bold fs-4">$500</span>, 5 for <span className="fw-bold fs-4">$2,000</span></Link> */}
                    {/*<Link href="#SpeakerList" className="btn-get-started">Sponsor Dose Chapters</Link>*/}
                    {/* <Link href="#SpeakerList" className="btn2">- 1 for <span className="fw-bold fs-2">$500</span>, 5 for <span className="fw-bold fs-2">$2,000</span></Link> */}
                    </div>
              </div>
            </div>
              <div className="col-12 d-sm-none"> 
                  <p className='pt-3 pt-sm-0'>This is your chance to sponsor a powerful TorahAnytime dose chapter and dedicate it in honor or memory of someone special. Your dedication message will show up in the beginning of your sponsored chapter.</p>
              </div>
             </div>
          <svg className="hero-waves" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" viewBox="0 24 150 28" preserveAspectRatio="none">
            <defs>
              <path id="wave-path" d="M-160 44c30 0 58-18 88-18s 58 18 88 18 58-18 88-18 58 18 88 18 v44h-352z" />
            </defs>
            <g className="wave1">
              <use xlinkHref="#wave-path" x={50} y={3} />
            </g>
            <g className="wave2">
              <use xlinkHref="#wave-path" x={50} y={0} />
            </g>
            <g className="wave3">
              <use xlinkHref="#wave-path" x={50} y={9} />
            </g>
          </svg>
        </section>

        <section id="SpeakerList" className="section">
          <div className="pageWidth">
            <div className="icon-box text-center pt-sm-1 pb-sm-5">
              {/* <Link href="/" className="logo2 d-flex justify-content-center py-3">
                <h1 className="sitename">
                  <img src="/logo.png" alt="Logo" />
                </h1>
              </Link> */}
              <h2 className="fw-bold mb-3">Sponsor a Dose Chapter from Your Favorite Speaker</h2>
              {/*<p className="fs-4">Sponsor Dose Chapters</p>*/}
              <p className="mb-0">Dose chapters are<b> $500 </b>each</p>
              <p className="mb-0"><span className='customBadge pulsate ms-2'>Special</span> 5 Dose chapters for <b>$2,000</b></p>
              <p className="mb-0">Donations are Tax and Maaser deductable.</p>
              {/* <p>Browse through our list of beloved speakers, select one whose teachings have resonated with you, and sponsor a Dose Chapter in their honor. Each sponsorship contributes to making Torah wisdom accessible to thousands worldwide.</p> */}
            </div>
            <Sponsors
              quantities={quantities}
              setQuantities={setQuantities}
              setIsOffCanvasVisible={setIsOffCanvasVisible}
              cart={cart}
              setCart={setCart}
              isInitialAddition={isInitialAddition}
              setIsInitialAddition={setIsInitialAddition}
			        setPayVisible={setIsPaymentVisible}	
              hasCartChanged={hasCartChanged}
              setHasCartChanged={setHasCartChanged}
			  
            />

          </div>
        </section>

        <section id="about" className="about section light-background">
          <div className="container pageWidth pb-md-3">
            <Link href="/" className="logo2 d-flex justify-content-center py-3">
              <h1 className="sitename">
                <img src="/logo.png" alt="Logo"/>
              </h1>
            </Link>
            <div className="row align-items-xl-center gy-5 justify-content-between">
              <div className="col-lg-6 icon-boxes">
                <div className="icon-box about">
                  <h2 className="fw-bold mb-3">About the Daily Doses Book</h2>
                  <p>The New Daily Doses Book is a collection of the most powerful and inspiring Torah teachings shared by our esteemed speakers on the DailyDose App and TorahAnyTime platform. Each chapter in the book features a unique 'dose' of wisdom, designed to uplift and educate. Now, you have the chance to dedicate one of these chapters in honor or memory of someone special. Your dedication will be part of a meaningful effort to share Torah insights with thousands worldwide.</p>
                </div>
              </div>
              <div className="col-lg-5 order-lg-first position-relative text-lg-start text-center">
                <div className="uper_img d-none d-lg-block">
                  <img src="/uper_img.png" className="img-fluid" alt="Uper Image" />
                </div>
                <img src="/our_previous.png" className="img-fluid" alt="heroimg" />
              </div>
            </div>
          </div>
        </section>

        <section id="details" className="details section">
          <div className="container pageWidth section-title pt-lg-4">
              <h2>By Sponsoring</h2>
            <div><span>By Sponsoring A Dose Chapter,</span> <span className="description-title"> You Will...</span></div>
          </div>
          <div className="container pageWidth">
            <div className="row gy-4"> 
              <div className="col-md-6 col-lg-3">
                <div className="inner_boxs shadow-sm text-center text-lg-start">
                  <TbHexagonNumber1Filled className="icons_" />
                  <h3>Support Torah learning and outreach efforts worldwide.</h3>
                </div>
              </div>
              <div className="col-md-6 col-lg-3">
                <div className="inner_boxs shadow-sm text-center text-lg-start">
                  <TbHexagonNumber2Filled className="icons_" />
                  <h3>Dedicate a Dose Chapter in memory of a loved one or in honor of someone special.</h3>
                </div>
              </div>
              <div className="col-md-6 col-lg-3">
                <div className="inner_boxs shadow-sm text-center text-lg-start">
                  <TbHexagonNumber3Filled className="icons_" />
                  <h3>Have your name or dedication featured in the book's acknowledgments.</h3>
                </div>
              </div>
              <div className="col-md-6 col-lg-3">
                <div className="inner_boxs shadow-sm text-center text-lg-start">
                  <TbHexagonNumber4Filled className="icons_" />
                  <h3>Be a partner in sharing powerful Torah insights that impact thousands of lives daily.</h3>
                </div>
              </div>
            </div> 
          </div>

          { /* <div className="pageWidth cta_btn d-flex mt-3 justify-content-center py-5">
            <Link href="#SpeakerList" className="btn-get-started">See Available Dose Chapters to Sponsor</Link>
          </div> */ } 

        </section>
        <section className="infoSection">
           <div className="container pageWidth">
           <div className="m_info text-center">
               <hr className="border"/>
               <p className="pt-4 fs-5">For more information contact Shimon</p>
               <div className='contact_info'>
                <ul className="footerContact list-unstyled d-flex gap-2 gap-sm-4 flex-wrap justify-content-center">
                  <li><Link href="tel:9176810003"><MdOutlinePhoneAndroid className="footerIcons" /><span>917-681-0003</span></Link></li>
                  <li><Link href="https://api.whatsapp.com/send/?phone=19176810003&text=add+me&type=phone_number&app_absent=0" target="_blank"><IoLogoWhatsapp className="footerIcons" /><span>917-681-0003</span></Link></li>
                  <li><Link href="mailto:shimon@torahanytime.com"><MdOutlineMail className="footerIcons" /><span>shimon@torahanytime.com</span></Link></li>
                </ul>
              </div>
             </div>
           </div>
        </section>
      </main>  
      {/* /Footer Section */}
    
      <button onClick={handleCartIconClick} className="mainCart shadow">
        <FaCartPlus className="mainCartIcon" />
        {totalQuantity > 0 && (
          <span className="cartItemCount countNotificatin">{totalQuantity}</span>
        )}
      </button>
      
      <OffCanvas
        isVisible={isOffCanvasVisible}
        onClose={handleCloseOffCanvas}
        cart={cart}
        setCart={setCart}
        onQuantityChange={handleQuantityChange}	
        setPayVisible={setIsPaymentVisible}	
        isPayVisible={isPaymentVisible}	
      />
    </div>
	 </DoseProvider> 
  );
}
