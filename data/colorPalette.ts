import { ImageType } from "@/app/types";

export const NDMI_COLORS = [
  "#800000", "#990000", "#B20000", "#CC0000",
  "#E50000", "#FF0000", "#FF4000", "#FF6A00",
  "#FF9500", "#FFBF00", "#FFFF00", "#CCFF03",
  "#99FF06", "#66FF08", "#33FF0B", "#0052FB",
  "#007FFF", "#0099FF", "#0080FF"
];

export const NITROGEN_COLORS = NDMI_COLORS;
export const PHOSPHORUS_COLORS = NDMI_COLORS;

export const STRESS_COLORS = [
  "#FF0000", "#FF8000", "#FFFF00", "#80FF00", "#00FF00"
];

export function getColorPalette(imageType : ImageType) {
  switch (imageType) {
    case "waterRequirement":
      return NDMI_COLORS;
    case "nitrogenRequirement":
      return NITROGEN_COLORS;
    case "phosphorusRequirement":
      return PHOSPHORUS_COLORS;
    case "cropStress":
      return STRESS_COLORS;
    default:
      return NDMI_COLORS;
  }
}