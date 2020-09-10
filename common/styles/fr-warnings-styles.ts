import {css, unsafeCSS} from 'lit-element';
export const frWarningsContent = `
etools-info-tooltip.fr-nr-warn iron-icon {
  color: var(--error-color);
}

etools-info-tooltip.currency-mismatch iron-icon {
  color: var(--primary-color);
}

etools-info-tooltip.frs-inline-list iron-icon {
  --iron-icon-fill-color: var(--error-color);
  color: var(--error-color);
  margin-left: 24px !important;
}

.fr-val-not-available {
  color: var(--secondary-text-color);
}

.amount-currency {
  margin-right: 4px;
}

`;
export const frWarningsStyles = css`
  ${unsafeCSS(frWarningsContent)}
`;
export const frWarningsStylesPolymer = () => {
  const template = document.createElement('template');
  template.innerHTML = `<style>
    ${frWarningsContent}
   </style>`;
  return template;
};
