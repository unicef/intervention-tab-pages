import {LitElement, customElement, html} from 'lit-element';
import './intervention-progress';

/**
 * @customElement
 */
@customElement('intervention-progress-tab')
export class InterventionProgressTab extends LitElement {
  render() {
    // language=HTML
    return html`
      <style></style>
      <intervention-progress></intervention-progress>
    `;
  }
}
