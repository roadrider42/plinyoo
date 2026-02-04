module.exports = async () => ({
  plugins: {
    tailwindcss: await import('tailwindcss'),
    autoprefixer: await import('autoprefixer'),
  }
});
