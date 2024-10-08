import fs from 'fs/promises';
import path from 'path';

const dataPath = path.join(process.cwd(), 'public', 'data', 'sponsors.json');

export async function POST(request) {
    try {
        const { sponsorId, quantity } = await request.json();
          //console.log('Data path:', dataPath); // Log the path
        // Log incoming request data
        //console.log('Received data:', { sponsorId, quantity });

        // Read the current sponsors data
          const data = await fs.readFile(dataPath, 'utf8');
			const sponsors = JSON.parse(data);

		let updatedspons = "";
       const updatedSponsors = sponsors.map((sponsor) => {
            if (sponsor.id == sponsorId) {
                const newAvailableDoses = Math.max(sponsor.availableDoses - quantity, 0);
				updatedspons = { ...sponsor, availableDoses: newAvailableDoses };
                return { ...sponsor, availableDoses: newAvailableDoses };
            }
            return sponsor;
        });

        // Write the updated sponsors back to the file
        await fs.writeFile(dataPath, JSON.stringify(updatedSponsors, null, 2))
			.catch(err => {
				//console.error('Error writing file:', err); // Log the error
				throw new Error('Error writing data');
			}); 

        return new Response(JSON.stringify({updatedspons:updatedspons,updatedSponsors:updatedSponsors,quantity:quantity,sponsorId:sponsorId}), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (err) {
        //console.error('Error occurred:', err); // Log the entire error object
        return new Response(JSON.stringify({ 
            message: 'Internal Server Error', 
            error: err.message || 'Unknown error'
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}