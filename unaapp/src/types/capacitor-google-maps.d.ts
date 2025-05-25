declare namespace JSX {
    interface IntrinsicElements {
      'capacitor-google-map': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        style?: React.CSSProperties;
        ref?: React.RefObject<HTMLElement>;
      };
    }
  }