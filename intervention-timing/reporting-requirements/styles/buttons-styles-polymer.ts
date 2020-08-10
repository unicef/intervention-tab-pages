import '@polymer/iron-flex-layout/iron-flex-layout.js';
import {
  _layoutVertical,
  _layoutHorizontal,
  _layoutFlex,
  _layoutCenterJustified
} from '../../../common/styles/flex-layout-styles';

// language=HTML
const buttonsStylesPolymerContent = `
  :host > * {
    --primary-button-default: {
      color: var(--primary-shade-of-green, #fff);
      font-weight: bold;
      padding: 5px 10px;
    }

    --primary-button-with-prefix: {
      padding: 5px 10px 5px 16px;
    }
  }

  .buttons-section {
    border-top: 1px solid var(--dark-divider-color);
    padding: 24px;
  }
  .buttons-section.horizontal {
    ${_layoutHorizontal}
  }
  .buttons-section.vertical {
    ${_layoutVertical}
  }

  .buttons-section.vertical .primary-btn:not(:first-of-type) {
    margin-top: 16px;
  }

  .primary-btn {
    background-color: var(--primary-color);
    --paper-button: {
      @apply --primary-button-default;
    }
  }

  .danger-btn {
    background-color: var(--error-color);
  }

  .warning-btn {
    background-color: var(--warning-color);
  }

  .success-btn {
    background-color: var(--success-color);
  }

  .primary-btn.with-prefix {
    --paper-button: {
      @apply --primary-button-default;
      @apply --primary-button-with-prefix;
    }
  }
  paper-button .btn-label {
    ${_layoutHorizontal}
    ${_layoutFlex}
    ${_layoutCenterJustified}
  }

  paper-button.w100 {
    width: 100%;
    margin-right: 0;
    margin-left: 0;
  }

  .secondary-btn-wrapper {
    width: 100%;
    --paper-input-container-input: {
      @apply --basic-btn-style;
    }
  }

  .secondary-btn {
    --paper-button: {
      @apply --basic-btn-style;
    }
  }

  .secondary-btn iron-icon {
    margin-right: 5px;
  }

  .white-btn {
    background-color: white;
    --paper-button: {
      color: var(--primary-color);
    }
    font-weight: bold;
  }
`;

export const buttonsStylesPolymer = () => {
  const template = document.createElement('template');
  template.innerHTML = `<style>
    ${buttonsStylesPolymerContent}
   </style>`;
  return template;
};
