import { availableCrops } from "@/data/crop";
import { ImageType } from "../types";

export const NDMI_SCRIPT = ({colorRamp} : {colorRamp : number[][]}) => {

   return `//VERSION=3
    const moistureRamps = ${JSON.stringify(colorRamp)};
    
    const viz = new ColorRampVisualizer(moistureRamps);
    
    function setup() {
      return {
        input: ["B8A", "B11", "SCL", "dataMask"],
        output: [
          { id: "default", bands: 4 },
          { id: "index", bands: 1, sampleType: "FLOAT32" },
          { id: "eobrowserStats", bands: 2, sampleType: "FLOAT32" },
          { id: "dataMask", bands: 1 },
        ],
      };
    }
    
    function evaluatePixel(samples) {
      let val = index(samples.B8A, samples.B11);
      // The library for tiffs works well only if there is only one channel returned.
      // So we encode the "no data" as NaN here and ignore NaNs on frontend.
      const indexVal = samples.dataMask === 1 ? val : NaN;
      return {
        default: [...viz.process(val), samples.dataMask],
        index: [indexVal],
        eobrowserStats: [val, isCloud(samples.SCL) ? 1 : 0],
        dataMask: [samples.dataMask],
      };
    }
    
    function isCloud(scl) {
      if (scl == 3) {
        // SC_CLOUD_SHADOW
        return false;
      } else if (scl == 9) {
        // SC_CLOUD_HIGH_PROBA
        return true;
      } else if (scl == 8) {
        // SC_CLOUD_MEDIUM_PROBA
        return true;
      } else if (scl == 7) {
        // SC_CLOUD_LOW_PROBA
        return false;
      } else if (scl == 10) {
        // SC_THIN_CIRRUS
        return true;
      } else if (scl == 11) {
        // SC_SNOW_ICE
        return false;
      } else if (scl == 1) {
        // SC_SATURATED_DEFECTIVE
        return false;
      } else if (scl == 2) {
        // SC_DARK_FEATURE_SHADOW
        return false;
      }
      return false;
    }`;
} 

const N_SCRIPT = ({ colorRamp }: { colorRamp: number[][] }) => {
  return `//VERSION=3
    let viz;

    function setup() {
      const ramps = ${JSON.stringify(colorRamp)};
      viz = new ColorRampVisualizer(ramps);
      return {
        input: ["B05", "B08", "SCL", "dataMask"],
        output: { bands: 4 }
      };
    }

    // 3 = cloud shadow, 7–10 = clouds, 11 = snow/ice
    function isClear(scl) {
      return scl !== 3 && scl !== 7 && scl !== 8 && scl !== 9 && scl !== 10 && scl !== 11;
    }

    function evaluatePixel(sample) {
      // NDRE
      let ndre = (sample.B08 - sample.B05) / (sample.B08 + sample.B05);

      let rgb;
      if (sample.dataMask === 1) {
        if (isClear(sample.SCL)) {
          // valid pixel
          rgb = viz.process(ndre);
        } else {
          // cloudy pixel inside AOI → lowest ramp
          rgb = viz.process(-1.0);
        }
        return [...rgb, 1]; // opaque inside AOI
      } else {
        // outside AOI → transparent
        return [0, 0, 0, 0];
      }
    }
  `;
};




const P_SCRIPT = ({colorRamp} : {colorRamp : number[][]}) => {

   return `// //VERSION=3
    let viz;

    function setup() {
        const ramps =  ${JSON.stringify(colorRamp)};
        viz = new ColorRampVisualizer(ramps);

        return {
            input: [{ bands: ["B09", "dataMask"] }],
            output: { bands: 4 }
        };
    }
    function isClear(scl) {
        // 3 = cloud shadow, 7-10 = clouds, 11 = snow/ice
        return (scl !== 3 && scl !== 7 && scl !== 8 && scl !== 9 && scl !== 10 && scl !== 11);
    }

    function evaluatePixel(sample) {
        if (!isClear(sample.SCL)) {
            // Mask out cloudy/snow pixels
            return [0, 0, 0];
        }

        let val = sample.B09; // Using B9 as a proxy value
        let rgb = viz.process(val);

        return [...rgb, sample.dataMask];
    }

    `
}

const STRESS_SCRIPT = () => {
  return `//VERSION=3
    function setup() {
    return {
        input: ["B08", "B04", "B03", "dataMask"],
        output: { bands: 4 }
    };
    }

    function evaluatePixel(s) {
    const gain = 2.5;

    // Use NDVI as stress indicator
    let ndvi = (s.B08 - s.B04) / (s.B08 + s.B04);

    // Map NDVI to red→yellow→green palette
    let rgb = colorBlend(ndvi,
        [-1.0, 0.0, 0.3, 0.6, 1.0],
        [
        [1, 0, 0],   // red (high stress)
        [1, 0.5, 0], // orange
        [1, 1, 0],   // yellow
        [0.5, 1, 0], // yellow-green
        [0, 1, 0]    // green (healthy / low stress)
        ]
    );

    // Alpha = dataMask for transparency outside AOI
    return [...rgb, s.dataMask];
    }
`;
};



const colorRamp = [[0.1, 8388608], 
    [0.12, 10027008], [0.14, 11665408], [0.16, 13369344], 
    [0.18, 15007744], [0.2, 16711680], [0.22, 16724480], 
    [0.24, 16737536], [0.26, 16750848], [0.28, 16763904], 
    [0.3, 16776960], [0.32, 13369139], [0.34, 10026854], 
    [0.36, 6750104], [0.38, 3407819], [0.4, 65535], 
    [0.42, 52479], [0.44, 39423], [0.46, 26111], 
    [0.48, 13311], [0.5, 255], [0.52, 229], 
    [0.54, 204], [0.56, 178], [0.58, 153], [0.6, 128]]
  
export function SCRIPT(imageType : ImageType , crop : keyof typeof availableCrops) {
    switch(imageType) {
        case "waterRequirement":
            return NDMI_SCRIPT({colorRamp});
        case "nitrogenRequirement":
            return N_SCRIPT({colorRamp});
        case "phosphorusRequirement":
            return P_SCRIPT({colorRamp});
        case "cropStress":
            return STRESS_SCRIPT();
        default:
            return NDMI_SCRIPT({colorRamp});
    }
}

export const getColorPalette = (imageType : ImageType) => {
    switch(imageType) {
        case "cropStress":
            return [
                [-1.0, 0xFF0000], // red
                [0.0,  0xFF8000], // orange
                [0.3,  0xFFFF00], // yellow
                [0.6,  0x80FF00], // yellow-green
                [1.0,  0x00FF00], // green
            ]
        default:
            return colorRamp;
    }
}