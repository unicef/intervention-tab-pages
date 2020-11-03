import {css, unsafeCSS} from 'lit-element';

// language=CSS
export const sectionContentStyles = `
  .content-section + .content-section,
  .content-section + * + .content-section,
  .content-section:not(:first-of-type) {
    margin-top: 24px;
  }
  etools-error-messages-box + .content-section {
    margin-top: 0;
  }

  @media print {
    .content-section {
      border: 1px solid var(--list-divider-color);
      --paper-material-elevation-1: {
        box-shadow: none;
      }
    }
  }
`;

// language=CSS
export const sectionContentStylesLit = css`
  ${unsafeCSS(sectionContentStyles)}
`;
