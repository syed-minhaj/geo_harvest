function calculateAreaInAcres(coordinates : number[][]) {
    if (!coordinates || coordinates.length < 3) {
        throw new Error('At least 3 coordinates are required to calculate area');
    }

    for (let i = 0; i < coordinates.length; i++) {
        const [lon, lat] = coordinates[i];
        if (typeof lon !== 'number' || typeof lat !== 'number') {
            throw new Error(`Invalid coordinate at index ${i}: [${lon}, ${lat}]`);
        }
        if (lat < -90 || lat > 90) {
            throw new Error(`Invalid latitude at index ${i}: ${lat}. Must be between -90 and 90`);
        }
        if (lon < -180 || lon > 180) {
            throw new Error(`Invalid longitude at index ${i}: ${lon}. Must be between -180 and 180`);
        }
    }

    const earthRadiusMeters = 6371000; 
    let area = 0;

    const coordsRad = coordinates.map(([lon, lat]) => [
        lon * Math.PI / 180,
        lat * Math.PI / 180
    ]);

    if (coordsRad[0][0] !== coordsRad[coordsRad.length - 1][0] || 
        coordsRad[0][1] !== coordsRad[coordsRad.length - 1][1]) {
        coordsRad.push(coordsRad[0]);
    }

    for (let i = 0; i < coordsRad.length - 1; i++) {
        const [lon1, lat1] = coordsRad[i];
        const [lon2, lat2] = coordsRad[i + 1];
        area += (lon2 - lon1) * (2 + Math.sin(lat1) + Math.sin(lat2));
    }

    area = Math.abs(area) * earthRadiusMeters * earthRadiusMeters / 2;

    // Convert square meters to acres (1 acre = 4046.8564224 square meters)
    const areaInAcres = area / 4046.8564224;
    
    return areaInAcres;
}

export  {calculateAreaInAcres};