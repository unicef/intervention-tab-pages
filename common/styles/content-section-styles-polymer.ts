import {html} from 'lit-element';
import {html as htmlPoly} from '@polymer/polymer';

// language=HTML
export const sectionContentStyles = html` <style>
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
</style>`;

//TODO -remove after migration to lit
export const sectionContentStylesPoly = htmlPoly` <style>
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
</style>`;

