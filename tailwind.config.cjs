const config = {
  presets: [require("@healthlab/config/tailwindConfig")],
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "../../packages/ui/src/**/*.{js,jsx,ts,tsx}",
    "../../packages/journeys/src/**/*.{js,jsx,ts,tsx}",
    "../../packages/firebase/src/**/*.{js,jsx,ts,tsx}",
  ],
};

module.exports = config;
