import '@mui/material/styles'

declare module '@mui/material/styles' {
  interface Palette {
    primary: Palette['primary'] & {
      lighter: string
    }
    error: Palette['error'] & {
      lighter: string
    }
  }

  interface PaletteOptions {
    primary?: PaletteOptions['primary'] & {
      lighter?: string
    }
    error?: PaletteOptions['error'] & {
      lighter?: string
    }
  }
}
