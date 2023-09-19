import {html, LitElement, css} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import {interventionEndpoints} from '../../utils/intervention-endpoints';
import {getEndpoint} from '@unicef-polymer/etools-utils/dist/endpoint.util';
import {AnyObject, EtoolsEndpoint} from '@unicef-polymer/etools-types';
import {EtoolsRequestEndpoint} from '@unicef-polymer/etools-ajax';
import '@shoelace-style/shoelace/dist/components/dropdown/dropdown.js';
import '@shoelace-style/shoelace/dist/components/button/button.js';
import '@shoelace-style/shoelace/dist/components/menu/menu.js';
import '@shoelace-style/shoelace/dist/components/icon/icon.js';
import '@shoelace-style/shoelace/dist/components/icon-button/icon-button.js';

/**
 * @customElement
 * @LitElement
 */
@customElement('export-intervention-data')
export class ExportInterventionData extends LitElement {
  static get styles() {
    return [
      css`
        sl-icon-button {
          font-size: 20px;
        }
      `
    ];
  }
  public render() {
    return html`
      <sl-dropdown id="pdExportMenuBtn">
        <sl-icon-button name="three-dots-vertical" slot="trigger"> </sl-icon-button>
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
      url = getEndpoint<EtoolsEndpoint, EtoolsRequestEndpoint>(interventionEndpoints.downloadComment, {
        interventionId: this.interventionId
      }).url;
      window.open(url, '_blank');
      return;
    }
    if (_type == 'export_results') {
      url = getEndpoint<EtoolsEndpoint, EtoolsRequestEndpoint>(interventionEndpoints.expectedResultsExport, {
        intervention_id: this.interventionId
      }).url;
      window.open(url, '_blank');
      return;
    }
    if (_type == 'export_pdf') {
      url = getEndpoint<EtoolsEndpoint, EtoolsRequestEndpoint>(interventionEndpoints.exportPdf, {
        interventionId: this.interventionId
      }).url;
      window.open(url, '_blank');
      return;
    }
    if (_type == 'export_xls') {
      url = getEndpoint<EtoolsEndpoint, EtoolsRequestEndpoint>(interventionEndpoints.exportXls, {
        interventionId: this.interventionId
      }).url;
      window.open(url, '_blank');
      return;
    }
    fireEvent(this, 'toast', {text: 'Export this not implemented...'});
  }
}
