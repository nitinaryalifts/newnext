import fs from 'fs/promises';
import path from 'path';

const dataPath = path.join(process.cwd(), 'public', 'data', 'sponsors.json');
export async function POST(request) {
    try {
        const { sponsorId, quantity } = await request.json();

        // Validate inputs
        if (!sponsorId || quantity == null) {
            console.error('Invalid input:', { sponsorId, quantity });
            return new Response(JSON.stringify({ message: 'Invalid input' }), { status: 400 });
        }

        console.log('Data path:', dataPath);
        console.log('Received data:', { sponsorId, quantity });

        // Read the current sponsors data
        const data = await fs.readFile(dataPath, 'utf8');
        const sponsors = JSON.parse(data);

        let updatedspons = null;
        const updatedSponsors = sponsors.map((sponsor) => {
            if (sponsor.id == sponsorId) {
                const newAvailableDoses = Math.max(sponsor.availableDoses - quantity, 0);
                updatedspons = { ...sponsor, availableDoses: newAvailableDoses };
                return updatedspons;
            }
            return sponsor;
        });

        // Write the updated sponsors back to the file
        await fs.writeFile(dataPath, JSON.stringify(updatedSponsors, null, 2));

        return new Response(JSON.stringify({ updatedspons, updatedSponsors, quantity, sponsorId }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (err) {
        console.error('Error occurred:', err);
        return new Response(JSON.stringify({ 
            message: 'Internal Server Error', 
            error: err.message || 'Unknown error'
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}