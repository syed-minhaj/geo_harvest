import { availableCrops } from "@/data/crop";
import { ImageType } from "../types";
import { getColorRamp } from "./colorRamp";

const CLOUD_MASK_FN = `
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
    
    ${CLOUD_MASK_FN}`;
} 

const N_SCRIPT = ({ colorRamp }: { colorRamp: number[][] }) => {
  return `//VERSION=3
    const viz = new ColorRampVisualizer(${JSON.stringify(colorRamp)});

    function setup() {
      return {
        input: ["B05", "B08", "SCL", "dataMask"],
        output: [
          { id: "default", bands: 4 },
          { id: "index", bands: 1, sampleType: "FLOAT32" },
          { id: "eobrowserStats", bands: 2, sampleType: "FLOAT32" },
          { id: "dataMask", bands: 1 },
        ],
      };
    }

    function evaluatePixel(samples) {
      // NDRE — good proxy for canopy chlorophyll / nitrogen content
      let val = (samples.B08 - samples.B05) / (samples.B08 + samples.B05);
      const indexVal = samples.dataMask === 1 ? val : NaN;
      return {
        default: [...viz.process(val), samples.dataMask],
        index: [indexVal],
        eobrowserStats: [val, isCloud(samples.SCL) ? 1 : 0],
        dataMask: [samples.dataMask],
      };
    }

    ${CLOUD_MASK_FN}`;
};




const P_SCRIPT = ({colorRamp} : {colorRamp : number[][]}) => {

   return `//VERSION=3
    const viz = new ColorRampVisualizer(${JSON.stringify(colorRamp)});

    function setup() {
        return {
            input: ["B05", "B07", "B8A", "SCL", "dataMask"],
            output: [
              { id: "default", bands: 4 },
              { id: "index", bands: 1, sampleType: "FLOAT32" },
              { id: "eobrowserStats", bands: 2, sampleType: "FLOAT32" },
              { id: "dataMask", bands: 1 },
            ],
        };
    }

    function evaluatePixel(samples) {
        // Red-Edge Chlorophyll Index (CIre) — indirect phosphorus proxy via
        // canopy health; phosphorus deficiency reduces chlorophyll production.
        // CIre = (B07 / B05) - 1
        let val = (samples.B07 / samples.B05) - 1;
        // Normalise to roughly [-1, 1] range for the shared colour ramp
        // CIre typically ranges 0–5; we clamp and rescale to [-1, 1]
        val = Math.max(-1, Math.min(1, (val - 2.5) / 2.5));
        const indexVal = samples.dataMask === 1 ? val : NaN;
        return {
            default: [...viz.process(val), samples.dataMask],
            index: [indexVal],
            eobrowserStats: [val, isCloud(samples.SCL) ? 1 : 0],
            dataMask: [samples.dataMask],
        };
    }

    ${CLOUD_MASK_FN}`;
}

const STRESS_SCRIPT = ({colorRamp} : {colorRamp : number[][]}) => {
  return `//VERSION=3
    const viz = new ColorRampVisualizer(${JSON.stringify(colorRamp)});

    function setup() {
    return {
        input: ["B08", "B04", "SCL", "dataMask"],
        output: [
          { id: "default", bands: 4 },
          { id: "index", bands: 1, sampleType: "FLOAT32" },
          { id: "eobrowserStats", bands: 2, sampleType: "FLOAT32" },
          { id: "dataMask", bands: 1 },
        ],
    };
    }

    function evaluatePixel(samples) {
    // NDVI as stress indicator; low NDVI = high stress
    let val = (samples.B08 - samples.B04) / (samples.B08 + samples.B04);
    const indexVal = samples.dataMask === 1 ? val : NaN;
    return {
        default: [...viz.process(val), samples.dataMask],
        index: [indexVal],
        eobrowserStats: [val, isCloud(samples.SCL) ? 1 : 0],
        dataMask: [samples.dataMask],
    };
    }

    ${CLOUD_MASK_FN}`;
};

  
export function SCRIPT(imageType : ImageType , crop : keyof typeof availableCrops , plantingDate : Date) {
    const colorRamp = getColorRamp(crop, imageType , plantingDate);
    switch(imageType) {
        case "waterRequirement":
            return NDMI_SCRIPT({colorRamp});
        case "nitrogenRequirement":
            return N_SCRIPT({colorRamp});
        case "phosphorusRequirement":
            return P_SCRIPT({colorRamp});
        case "cropStress":
            return STRESS_SCRIPT({colorRamp});
        default:
            return NDMI_SCRIPT({colorRamp});
    }
}
