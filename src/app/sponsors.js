"use client";
import { useState, useEffect } from 'react';
import { useDoses } from './DoseContext';
import QuantityButton from './QuantityButton';
import SoldOutModal from './SoldOutModal'; 
const limitAmountClass = parseInt(process.env.NEXT_PUBLIC_APP_LIMIT_AMOUNT_CLASS, 10);
export default function Sponsors({ quantities, setQuantities, setIsOffCanvasVisible, cart, setCart, isInitialAddition, setIsInitialAddition ,setPayVisible}) {
    const { sponsors: initialSponsors, getTotalLeftDoses } = useDoses();
    const [sponsors, setSponsors] = useState([]);
    const [popupMessage, setPopupMessage] = useState('');
    const [isPopupVisible, setIsPopupVisible] = useState(false);
    const [activeSponsorId, setActiveSponsorId] = useState(null);


    // Shuffle function
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
	
	  useEffect(() => {
        //console.log('Initial sponsors:', initialSponsors);
        if (initialSponsors.length > 0) {
            setSponsors(shuffleArray([...initialSponsors])); // Shuffle only on mount
        }
    }, [initialSponsors]);

    const handleSponsorClick = (sponsorId, sponsor) => {
		const totalLeftDoses = getTotalLeftDoses();
        const totalCartQuantity = cart.reduce((accumulator, item) => accumulator + item.quantity, 0);
        const AvailableDocs = Math.max(totalLeftDoses - (totalCartQuantity +1), 0);
       // console.log('get the value of env',limitAmountClass);
        setPayVisible(false);
        if (AvailableDocs <= limitAmountClass) {
            //console.log(totalLeftDoses);
            setPopupMessage('All doses are sold out');
            setIsPopupVisible(true);
             return;
        }

        setActiveSponsorId(sponsorId);
        setIsInitialAddition(true);
        if (!quantities[sponsorId]) {
            setQuantities(prevQuantities => ({
                ...prevQuantities,
                [sponsorId]: 1 // Set initial quantity to 1 if not already set
            }));
            const valuesquant = Object.values(quantities);
            const sum = valuesquant.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
            //console.log(sum); 

            setCart(prevCart => {
                const existingSponsor = prevCart.find(item => item.id === sponsorId);
				
                const newQuantity = 1;

                if (existingSponsor) {
                    return prevCart.map(item =>
                        item.id === sponsorId
                            ? { ...item, quantity: existingSponsor.quantity + newQuantity, amount: (existingSponsor.quantity + newQuantity) * 500 }
                            : item
                    );
                }

                setIsOffCanvasVisible(true); 
				
                return [...prevCart, {
                    id: sponsorId,
                    name: sponsor.name,
					doses: sponsor.availableDoses,
                    avatarUrl: sponsor.avatarUrl,
                    quantity: newQuantity,
                    amount: newQuantity * 500
                }];
            });
        }
    };
          
    const handleQuantityChange = (sponsorId, newQuantity, sponsor) => {
        const maxQuantity = sponsor.availableDoses;
        // const totalLeftDoses = getTotalLeftDoses();
        // const AvailableDocs = Math.max(totalLeftDoses - (cart.length + 1), 0);
    
        // setPayVisible(false);
    
        // // Show popup if available doses are 199 or less
        // if (AvailableDocs <= 199) {
        //     setPopupMessage('All doses are sold out');
        //     setIsPopupVisible(true);
        //     return;
        // }
    
        // Prevent exceeding max available doses
        if (newQuantity > maxQuantity) return;
    
        // Update the quantity state
        setQuantities(prevQuantities => ({
            ...prevQuantities,
            [sponsorId]: newQuantity
        }));
    
        // Update the cart
        setCart(prevCart => {
            const existingSponsor = prevCart.find(item => item.id === sponsorId);
    
            // If the sponsor already exists in the cart, update its quantity and amount
            if (existingSponsor) {
                return prevCart.map(item =>
                    item.id === sponsorId
                        ? { ...item, quantity: newQuantity, amount: newQuantity * 500 }
                        : item
                );
            }
    
            // If the sponsor is not already in the cart, add it
            return [...prevCart, {
                id: sponsorId,
                name: sponsor.name,
                doses: sponsor.availableDoses,
                avatarUrl: sponsor.avatarUrl,
                quantity: newQuantity,
                amount: newQuantity * 500
            }];
        });
    
        // Show or hide the off-canvas based on the quantity
        setIsOffCanvasVisible(newQuantity > 0);
    };
    
    const closePopup = () => {
        setIsPopupVisible(false);
        setPopupMessage('');
    };

    return (
        <div className='py-4 py-md-2'>
            <div className="spekers_content">
                <ul className="spekers_list list-unstyled px-sm-4 bg-white mb-0 align-items-center">
                    {sponsors.map(sponsor => {
                        const remainingDoses = Math.max(0, sponsor.availableDoses - (quantities[sponsor.id] || 0));
                        return (
                            <li key={sponsor.id} className={`speakerBox position-relative d-xl-flex w-100 justify-content-between align-items-center ${remainingDoses === 0 ? 'allTaken' : ''}`}>
                                <div className="info_s text-center text-xl-start mb-3 mb-xl-0 d-xl-flex gap-2 align-items-center">
                                    <img src={sponsor.avatarUrl} alt="" />
                                    <span className='spoName'>
                                        <p className="mt-2 mt-xl-0 s_name">{sponsor.name}</p>
                                    </span>
                                </div>
                                <div className="btm_part gap-2">
                                    <span className="A_dose">
                                        Available chapters: {remainingDoses}
                                    </span>

                                    {activeSponsorId === sponsor.id ? (
                                        <QuantityButton
                                            initialQuantity={quantities[sponsor.id] || 0}
                                            maxQuantity={sponsor.availableDoses}
											sponsorId={sponsor.id}
                                            onQuantityChange={(newQuantity) => handleQuantityChange(sponsor.id, newQuantity, sponsor)}
                                            isInitialAddition={isInitialAddition}
                                            setIsInitialAddition={setIsInitialAddition}
                                            cart={cart}
                                        />
                                        
                                      ) : (

                                        <span className={`A_dose spo ${remainingDoses === 0 ? 'sponsore_disabled' : ''}`}>
                                            <button
                                                className="sponsor_btn"
                                                onClick={() => handleSponsorClick(sponsor.id, sponsor)}
                                                disabled={remainingDoses === 0}
                                            >
                                               {remainingDoses === 0 ? <span className='taken_'>All Taken</span> : 'Sponsor Now'}
                                               
                                            </button>
                                        </span>
                                    )}
                                </div>
                            </li>
                        );
                    })}
                </ul>
            </div>
            {isPopupVisible && (
          <SoldOutModal message={popupMessage} onClose={closePopup} />
      )}
        </div>
    );
}
