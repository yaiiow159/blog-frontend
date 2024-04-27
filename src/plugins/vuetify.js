/**
 * plugins/vuetify.js
 *
 * Framework documentation: https://vuetifyjs.com`
 */

// Styles
import '@mdi/font/css/materialdesignicons.css'
import colors from 'vuetify/util/colors'
import 'vuetify/styles'

// Composables
import { createVuetify } from 'vuetify'

// https://vuetifyjs.com/en/introduction/why-vuetify/#feature-guides
export default createVuetify({
  theme: {
    defaultTheme: 'dark',
    themes: {
      light: {
        colors: {
          primary: '#1867C0',
          secondary: '#5CBBF6',
          error: colors.red.darken3,
          info: colors.lightBlue.lighten1,
          success: colors.green.darken1,
          warning: colors.amber.darken2
        },
      },
      dark: {
        colors: {
          primary: '#2196F3',
          secondary: '#007BFF',
          success: '#4CAF50',
          warning: '#FFC107',
          error: '#F44336',
          darkgreen: '#006400',
          darkgrey: '#424242',
          background: '#121212',
          golden: '#FFD700',
          orange: '#FFA500',
          cancel: '#9E9E9E',
          add: '#4CAF50',
          info: '#2196F3',
          edit: '#FFC107',
          delete: '#F44336',
          search: '#E0E0E0',
          card: '#212121',
        },
      },
    },
  },
})
