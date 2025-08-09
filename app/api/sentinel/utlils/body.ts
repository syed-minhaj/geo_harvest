

const input = (geometry : any) => {

    const today = new Date().toISOString();
    const from15daysAgo = new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString();
    
    return {
        bounds: {
            geometry: geometry,
            properties: { crs: 'http://www.opengis.net/def/crs/EPSG/0/4326' },
        },
        data: [
            {
                type: 'sentinel-2-l2a',
                dataFilter: {
                    timeRange: {
                        from: from15daysAgo,
                        to: today,
                    },
                },
            },
        ],
    }
}

const output = {
    width: 512,
    height: 512,
    responses: [
        {
            identifier: 'default',
            format: { type: 'image/png' },
        },
    ],
}

export {input , output};