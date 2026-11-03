module.exports = {
  content: ['./index.html', './assets/js/*.js'],
  theme: {
        extend: {
          colors: {
            forest: '#0D1D0F',
            moss: '#2C4E0D',
            cream: '#F4F1EA',
            sage: '#E6ECDF',
            slateText: '#54595F',
            gold: '#B8A57A',
          },
          fontFamily: {
            serif: ['"Cormorant Garamond"', 'Georgia', 'serif'],
            sans: ['"Manrope"', 'sans-serif'],
          },
          letterSpacing: {
            editorial: '0.24em',
          }
        }
      }
}
