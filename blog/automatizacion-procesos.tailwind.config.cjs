const baseConfig = {
    darkMode: "class",
    theme: {
      extend: {
        colors: {
          "primary": "#64FFDA", "on-primary": "#001a14",
          "surface": "#0a192f", "surface-container": "#112240",
          "surface-container-high": "#1d2d50", "surface-container-low": "#020c1b",
          "on-surface": "#ccd6f6", "on-surface-variant": "#8892b0", "outline": "#233554",
        },
        fontFamily: { "headline":["Space Grotesk","sans-serif"], "body":["Inter","sans-serif"], "label":["Space Grotesk","sans-serif"] },
        borderRadius: { "DEFAULT":"0.25rem","lg":"0.5rem","xl":"1rem","full":"9999px" },
      },
    },
  };

module.exports = {
  ...baseConfig,
  content: ["./blog/automatizacion-procesos.html"],
  plugins: [
    require("@tailwindcss/forms"),
    require("@tailwindcss/container-queries"),
    ...((baseConfig.plugins) || []),
  ],
};
