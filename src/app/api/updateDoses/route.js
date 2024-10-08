import fs from 'fs/promises';
import path from 'path';

const dataPath = path.join(process.cwd(), 'public', 'data', 'sponsors.json');

export async function POST(request) {
    try {
        const { sponsorId, quantity } = await request.json();

        console.log('Received data:', { sponsorId, quantity });
        console.log('Attempting to read file:', dataPath);

        // Ensure file exists
        try {
            await fs.access(dataPath);
            console.log('File exists:', dataPath);
        } catch (err) {
            console.error('File not found:', dataPath);
            return new Response(JSON.stringify({
                message: 'File not found',
                error: err.message,
            }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // Read the current sponsors data
        const data = await fs.readFile(dataPath, 'utf8');
        const sponsors = JSON.parse(data);
        
        let updatedspons = '';
        const updatedSponsors = sponsors.map((sponsor) => {
            if (sponsor.id == sponsorId) {
                const newAvailableDoses = Math.max(sponsor.availableDoses - quantity, 0);
                updatedspons = { ...sponsor, availableDoses: newAvailableDoses };
                return { ...sponsor, availableDoses: newAvailableDoses };
            }
            return sponsor;
        });

        // Write the updated sponsors back to the file
        await fs.writeFile(dataPath, JSON.stringify(updatedSponsors, null, 2));
        console.log('File written successfully');

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
