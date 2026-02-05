declare module 'react-responsive-masonry' {
  import * as React from 'react';
  export interface ResponsiveMasonryProps extends React.HTMLAttributes<HTMLDivElement> {
    columnsCountBreakPoints?: { [key: number]: number } | undefined;
  }

  export const ResponsiveMasonry: React.FC<ResponsiveMasonryProps>;
  export const Masonry: React.FC<React.HTMLAttributes<HTMLDivElement>>;

  const _default: any;
  export default _default;
}
