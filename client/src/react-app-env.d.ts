/// <reference types="react" />
/// <reference types="react-dom" />

declare module 'react' {
  export = React;
}

declare module 'react-dom' {
  export = ReactDOM;
}

// Tailwind CSS types are automatically included

declare module 'react-icons/fi' {
  // Icons are now imported directly from react-icons/md
}

declare namespace JSX {
  interface IntrinsicElements {
    [elemName: string]: any;
  }
}
