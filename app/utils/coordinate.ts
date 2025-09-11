
type location = {
    latitude : number,
    longitude : number
}

const getUserLocation = () : Promise<{location : location , err : null} | {location : null , err : string}> => {
    return new Promise((resolve) => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
            (position) => {
                const latitude = position.coords.latitude;
                const longitude = position.coords.longitude;
                const location = { latitude, longitude };
                resolve({location : location , err : null});
            },(error) => {
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        // return error to the user if permission is denied
                        resolve({location : null, err : "User denied the request for Geolocation."});
                        break;
                    case error.POSITION_UNAVAILABLE:
                        resolve({location : null, err : "Location information is unavailable."});
                        break;
                    case error.TIMEOUT:
                        resolve({location : null, err : "The request to get user location timed out."});
                        break;
                }
            });
        }else{
            resolve({location : null, err : "Geolocation is not supported by this browser."});
        }
    })
}

function fromPostgresPolygon(polygonString: string): number[][] {
    const cleanString = polygonString.replace(/^\(\(|\)\)$/g, '');
    
    const coordPairs = cleanString.split('),(');
    
    return coordPairs.map(pair => {
        const [x, y] = pair.split(',').map(Number);
        return [y, x];
    });
}

export {getUserLocation , fromPostgresPolygon};