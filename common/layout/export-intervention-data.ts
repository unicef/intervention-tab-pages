import {html, LitElement} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import {interventionEndpoints} from '../../utils/intervention-endpoints';
import {getEndpoint} from '@unicef-polymer/etools-utils/dist/endpoint.util';
import {AnyObject, EtoolsEndpoint} from '@unicef-polymer/etools-types';
import {RequestEndpoint} from '@unicef-polymer/etools-utils/dist/etools-ajax/ajax-request';
import '@shoelace-style/shoelace/dist/components/dropdown/dropdown.js';
import '@unicef-polymer/etools-unicef/src/etools-button/etools-button';
import '@shoelace-style/shoelace/dist/components/menu/menu.js';
import '@unicef-polymer/etools-unicef/src/etools-icons/etools-icon';
import '@unicef-polymer/etools-unicef/src/etools-icon-button/etools-icon-button';

/**
 * @customElement
 * @LitElement
 */
@customElement('export-intervention-data')
export class ExportInterventionData extends LitElement {
  public render() {
    return html`
      <style>
        sl-menu-item::part(label) {
          text-align: left;
        }
        sl-dropdown sl-menu-item:focus-visible::part(base) {
          background-color: rgba(0, 0, 0, 0.1);
          color: var(--sl-color-neutral-1000);
        }
      </style>
      <sl-dropdown id="pdExportMenuBtn">
        <etools-icon-button label="export" name="more-vert" slot="trigger"> </etools-icon-button>
        <sl-menu>
          ${this.exportLinks.map(
            (item) => html` <sl-menu-item @click="${() => this.export(item.type)}">${item.name}</sl-menu-item>`
          )}
        </sl-menu>
      </sl-dropdown>
    `;
  }

  @property({type: Array})
  exportLinks!: AnyObject[];

  @property({type: String})
  params = '';

  @property({type: Number})
  interventionId = '';

  export(_type: string) {
    let url = '';
    if (_type == 'download_comments') {
      url = getEndpoint<EtoolsEndpoint, RequestEndpoint>(interventionEndpoints.downloadComment, {
        interventionId: this.interventionId
      }).url;
      window.open(url, '_blank');
      return;
    }
    if (_type == 'export_results') {
      url = getEndpoint<EtoolsEndpoint, RequestEndpoint>(interventionEndpoints.expectedResultsExport, {
        intervention_id: this.interventionId
      }).url;
      window.open(url, '_blank');
      return;
    }
    if (_type == 'export_pdf') {
      url = getEndpoint<EtoolsEndpoint, RequestEndpoint>(interventionEndpoints.exportPdf, {
        interventionId: this.interventionId
      }).url;
      window.open(url, '_blank');
      return;
    }
    if (_type == 'export_xls') {
      url = getEndpoint<EtoolsEndpoint, RequestEndpoint>(interventionEndpoints.exportXls, {
        interventionId: this.interventionId
      }).url;
      window.open(url, '_blank');
      return;
    }
    fireEvent(this, 'toast', {text: 'Export this not implemented...'});
  }
}
