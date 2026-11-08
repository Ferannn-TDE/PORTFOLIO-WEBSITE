// useId() values contain characters that aren't safe in SVG url(#…) references.
export const svgId = (raw) => raw.replace(/[^a-zA-Z0-9_-]/g, "");
