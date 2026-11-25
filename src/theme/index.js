import { createTheme } from '@mui/material/styles';

// ─── Punto Cero — editorial manuscript palette (ver DESIGN-2.md) ─────────────
// Se conservan los nombres de las claves (DL.blue, DL.navy…) para no tocar
// cada pantalla; los valores ahora son el sistema monocromo con un solo acento sage.
export const DL = {
  blue:    '#547e69',   // Sage — acento funcional (activos, enlaces, indicadores)
  navy:    '#1a1a1a',   // Ink Black
  dark:    '#1a1a1a',   // Ink Black
  bg:      '#f6f6f6',   // Fog
  darkest: '#1a1a1a',

  green:      '#547e69',
  greenBg:    '#f1fcf6', // Mint Wash
  greenBd:    '#cfe3d8',
  yellow:     '#8a6d3b',
  yellowBg:   '#faf6ee',
  yellowBd:   '#e8dcc3',
  red:        '#a8483f',
  redBg:      '#fbf3f2',
  redBd:      '#ecd0cc',

  white:      '#ffffff',
  subtle:     '#f6f6f6',
  border:     '#e3e3e3',  // Hairline
  border2:    '#d4d4d4',

  tH:  '#1a1a1a',   // Ink Black
  tB:  '#1a1a1a',
  tM:  '#4d3f32',   // Warm Charcoal
  tS:  '#6a6a6a',   // Graphite

  e1: 'rgba(0,0,0,.03) 0px 1px 3px 0px',
  e2: 'rgba(0,0,0,.06) 0px 2px 6px 0px',
  e3: 'rgba(0,0,0,.06) 0px 2px 6px 0px, rgba(0,0,0,.03) 0px 10px 6px 0px',
};

export const FONT_SANS  = "'Inter', ui-sans-serif, system-ui, -apple-system, sans-serif";
export const FONT_SERIF = "'Crimson Pro', 'Cormorant Garamond', Georgia, serif";

const heading = { fontFamily: FONT_SERIF, fontWeight: 300, letterSpacing: 'normal', lineHeight: 1 };

const theme = createTheme({
  palette: {
    primary:   { main: '#1a1a1a', dark: '#000000', contrastText: '#fff' },
    secondary: { main: DL.blue,   dark: '#46695a', contrastText: '#fff' },
    error:     { main: DL.red,    light: DL.redBg },
    warning:   { main: DL.yellow, light: DL.yellowBg },
    success:   { main: DL.green,  light: DL.greenBg },
    background:{ default: '#ffffff', paper: '#ffffff' },
    divider: DL.border,
    text: {
      primary:   DL.tH,
      secondary: DL.tS,
      disabled:  '#8d8d8d',
    },
  },
  typography: {
    fontFamily: FONT_SANS,
    h1: heading,
    h2: heading,
    h3: heading,
    h4: heading,
    h5: heading,
    h6: heading,
    subtitle1: { fontWeight: 500, fontSize: '0.75rem' },
    subtitle2: { fontWeight: 500, fontSize: '0.688rem' },
    body1: { fontSize: '0.8125rem' },
    body2: { fontSize: '0.75rem' },
    caption: { fontSize: '0.6875rem', fontWeight: 400 },
    overline: {
      fontSize: '0.625rem',
      fontWeight: 500,
      letterSpacing: '0.09em',
      textTransform: 'uppercase',
    },
    button: { fontWeight: 500, letterSpacing: 0, textTransform: 'none' },
  },
  shape: { borderRadius: 8 },
  shadows: [
    'none',
    DL.e1, DL.e1, DL.e2, DL.e2, DL.e2,
    DL.e2, DL.e2, DL.e2, DL.e2, DL.e2,
    DL.e2, DL.e2, DL.e2, DL.e2, DL.e2,
    DL.e3, DL.e3, DL.e3, DL.e3, DL.e3,
    DL.e3, DL.e3, DL.e3, DL.e3,
  ],
  components: {
    MuiCssBaseline: {
      styleOverrides: `
        *, *::before, *::after { box-sizing: border-box; }
        html, body { height: 100%; margin: 0; padding: 0; }
        body {
          background: #ffffff;
          font-family: ${FONT_SANS};
          font-size: 13px;
          color: ${DL.tH};
          -webkit-font-smoothing: antialiased;
        }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-thumb { background: #d4d4d4; border-radius: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
      `,
    },
    // CTAs: ghost / outlined, nunca rellenos de color
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontFamily: FONT_SANS,
          fontWeight: 500,
          fontSize: '0.75rem',
          textTransform: 'none',
          letterSpacing: 0,
          boxShadow: 'none',
          '&:hover': { boxShadow: 'none' },
        },
        containedPrimary: {
          background: '#fff', color: DL.tH, border: `1px solid ${DL.tH}`,
          '&:hover': { background: DL.bg },
        },
        containedSecondary: {
          background: '#fff', color: DL.blue, border: `1px solid ${DL.blue}`,
          '&:hover': { background: DL.greenBg },
        },
        outlined: {
          borderColor: DL.tH,
          color: DL.tH,
          background: '#fff',
          '&:hover': { borderColor: DL.tH, color: DL.tH, background: DL.bg },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontFamily: FONT_SANS,
          fontWeight: 400,
          fontSize: '0.6875rem',
          height: 22,
          borderRadius: 4,
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: { fontFamily: FONT_SANS, fontSize: '0.6875rem', fontWeight: 400 },
      },
    },
    MuiInputBase: {
      styleOverrides: { root: { fontFamily: FONT_SANS } },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          fontFamily: FONT_SANS,
          fontSize: '0.6875rem',
          background: DL.darkest,
          borderRadius: 4,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          border: `1px solid ${DL.border}`,
        },
      },
    },
    MuiDataGrid: {
      styleOverrides: {
        root: {
          border: 'none',
          fontFamily: FONT_SANS,
          fontSize: '0.75rem',
          color: DL.tH,
          background: '#fff',
          borderRadius: 12,
          '& .MuiDataGrid-columnHeaders': {
            background: DL.bg,
            borderBottom: `1px solid ${DL.border}`,
          },
          '& .MuiDataGrid-columnHeaderTitle': {
            fontSize: '0.6875rem',
            fontWeight: 500,
            textTransform: 'none',
            letterSpacing: 0,
            color: DL.tS,
          },
          '& .MuiDataGrid-cell': {
            borderBottom: `1px solid ${DL.border}`,
            padding: '6px 8px',
          },
          '& .MuiDataGrid-row:hover': {
            background: DL.bg,
            cursor: 'pointer',
          },
          '& .MuiDataGrid-footerContainer': {
            borderTop: `1px solid ${DL.border}`,
            minHeight: 40,
          },
        },
      },
    },
  },
});

export default theme;
