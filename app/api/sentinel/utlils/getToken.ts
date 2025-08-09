
async function getToken(){

    const client_id = process.env.SENTINEL_CLIENT_ID;
    const client_secret = process.env.SENTINEL_CLIENT_SECRET;

    if (!client_id || !client_secret) {
        return {token : null , err : "Missing client id or client secret."};
    }

    try {
        const tokenRes = await fetch('https://services.sentinel-hub.com/oauth/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `client_id=${client_id}&client_secret=${client_secret}&grant_type=client_credentials`,
        });
        const tokenData = await tokenRes.json();
        const token = tokenData.access_token;
        return {token : token , err : null};
    } catch (error ) {
        return {token : null , err : error};
    }
}

export default getToken;
