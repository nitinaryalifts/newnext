export async function POST(request) {
    const client_id = process.env.CHARIT_API_CLIENT_ID; 
    const client_secret = process.env.CHARIT_API_CLIENT_SECRET;

    if (!client_id || !client_secret) {
        return new Response(JSON.stringify({ error: 'Client ID and Secret are required' }), { status: 400 });
    }

    const body = {
        client_id,
        client_secret,
        audience: "https://api.givechariot.com",
        grant_type: "client_credentials",
    };

    try {
        const response = await fetch('https://chariot-sandbox.us.auth0.com/oauth/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('Error response:', data); 
            return new Response(JSON.stringify(data), { status: response.status });
        }

        return new Response(JSON.stringify(data), { status: 200 });
    } catch (error) {
        console.error('Fetch error:', error); 
        return new Response(JSON.stringify({ error: 'Failed to fetch token' }), { status: 500 });
    }
}
