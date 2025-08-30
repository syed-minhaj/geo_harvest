export const NDMI_SCRIPT = `//VERSION=3
const moistureRamps = [[0.1, 8388608], 
[0.12, 10027008], [0.14, 11665408], [0.16, 13369344], 
[0.18, 15007744], [0.2, 16711680], [0.22, 16724480], 
[0.24, 16737536], [0.26, 16750848], [0.28, 16763904], 
[0.3, 16776960], [0.32, 13369139], [0.34, 10026854], 
[0.36, 6750104], [0.38, 3407819], [0.4, 65535], 
[0.42, 52479], [0.44, 39423], [0.46, 26111], 
[0.48, 13311], [0.5, 255], [0.52, 229], 
[0.54, 204], [0.56, 178], [0.58, 153], [0.6, 128]];

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