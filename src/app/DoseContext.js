import React, { createContext, useContext, useState, useEffect } from 'react';

const DoseContext = createContext();

export const DoseProvider = ({ children }) => {
	
     const [sponsors, setSponsors] = useState([]);
      const [leftDoses, setLeftDoses] = useState(0);
	
	 const fetchSponsors = async () => {
        const response = await fetch('/data/sponsors.json');
        const data = await response.json();
        setSponsors(data);
        setLeftDoses(data.reduce((total, sponsor) => total + sponsor.availableDoses, 0));
    };
	
	 useEffect(() => {
        fetchSponsors();
    }, []);
	
	 const getSponsors = async () => {
        const response = await fetch('/data/sponsors.json');
        const data = await response.json();
        return data;
    };

     const updateDoses = async (sponsorId, quantity) => {
		setSponsors((prevSponsors) => {
			return prevSponsors.map((sponsor) => {
				if (sponsor.id === sponsorId) {
					const newAvailableDoses = Math.max(sponsor.availableDoses - quantity, 0);
					return { ...sponsor, availableDoses: newAvailableDoses };
				}
				return sponsor;
			});
		});

    setLeftDoses((prev) => Math.max(prev - quantity, 0));

    // Make a POST request to update the JSON file
    try {
		
		    const response = await fetch('/api/updateDoses', {
				  method: 'POST',
				  headers: { 'Content-Type': 'application/json' },
				  body: JSON.stringify({ sponsorId, quantity }),
				});
		 const result = await response.json();
			console.log('Response:', result);
    } catch (error) {
        console.error('Error updating doses:', error);
    }
};
	
	 const resetDoses = async () => {
        await fetchSponsors(); // Fetch the data again
    };
	
	 const handlePaymentFailure = () => {
        resetDoses();
    };
	
	const emptyCart = () => {
        //resetDoses();
		return true;
    };
	
	

    const getTotalLeftDoses = () => leftDoses;

    return (
        <DoseContext.Provider value={{ sponsors, updateDoses, getTotalLeftDoses,handlePaymentFailure,emptyCart ,fetchSponsors, resetDoses,getSponsors }}>
            {children}
        </DoseContext.Provider>
    );
};

export const useDoses = () => {
    const context = useContext(DoseContext);
    if (!context) {
        throw new Error('useDoses must be used within a DoseProvider');
    }
    return context;
};