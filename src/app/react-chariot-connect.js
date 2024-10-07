import { Html } from 'next/document';
import React, { useState, useEffect } from 'react';
import ChariotConnect from 'react-chariot-connect';

const ChariotButton = ({ email, formattedAmount, frequency,userName }) => {
    const [accessToken, setAccessToken] = useState('');
    const [connectId, setConnectId] = useState(null);
    const [forAmount, setFormattedAmount] = useState(formattedAmount); // Initialize with prop value

    const generateRandomEIN = () => {
        return Math.floor(100000000 + Math.random() * 900000000).toString(); // Generates a number between 100000000 and 999999999
    };

    useEffect(() => {
        const fetchAccessToken = async () => {
            const response = await fetch('/api/chariot', { method: 'POST' });
            const data = await response.json();

            if (response.ok) { 
                setAccessToken(data.access_token);
            }
        };
        fetchAccessToken();
    }, []);

    useEffect(() => {
        const createNonprofitAndConnect = async () => {
            if (!accessToken) return;

            const ein = generateRandomEIN(); // Use the generated EIN
            const nonprofitBody = {
                user: {
                    email: "test1345353@yopmail.com"
                },
                ein: "261888879" // Use the generated EIN here 
            };

            const nonprofitResponse = await fetch('https://sandboxapi.givechariot.com/v1/nonprofits', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(nonprofitBody),
            });
       
            if (nonprofitResponse.ok) {
                const nonprofitData = await nonprofitResponse.json();
                const connectResponse = await fetch(`https://sandboxapi.givechariot.com/v1/connects?nonprofit=${nonprofitData.id}`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({}),
                });

                if (connectResponse.ok) {
                    const connectData = await connectResponse.json();
                    setConnectId(connectData.id);
                }
            } 
        };

        createNonprofitAndConnect();
    }, [accessToken]); // No need to include email, unless you are using it.

    useEffect(() => {
        // Update local state whenever formattedAmount prop changes
        setFormattedAmount(formattedAmount);
    }, [formattedAmount]);
    const onDonationRequest = () => {
        const amountInCents = forAmount *100;
        // const amountInCents = parseFloat(forAmount.replace(/[^0-9.-]+/g, '')) * 100; 
        return {
            amount:amountInCents, 
            firstName: userName,
            // lastName: "Scott",
            email: email, // Use the passed email prop
            // metadata: {
            //     fundraiserTag: "marathon" 
            // }
                  
        }
    };
     
    return (
        <div>
            {connectId && (
                <ChariotConnect     
                    cid={connectId}
                    onDonationRequest={onDonationRequest}
                    onError={() => {}}
                    theme="LightBlueTheme"
                    onClick={() => console.log('ChariotConnect clicked!')}   
                />
            )}
        </div>
    );
};


export default ChariotButton;

