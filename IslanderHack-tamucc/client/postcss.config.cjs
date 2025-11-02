module.exports = {
  // Use the new PostCSS plugin package for Tailwind v4+
  // Use the array form with require(...) so PostCSS loads the plugin functions.
  plugins: [
    require('@tailwindcss/postcss'),
    require('autoprefixer'),
  ],
}
