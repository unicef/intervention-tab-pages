import {html, LitElement} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import {interventionEndpoints} from '../../utils/intervention-endpoints';
import {getEndpoint} from '@unicef-polymer/etools-utils/dist/endpoint.util';
import {AnyObject, EtoolsEndpoint} from '@unicef-polymer/etools-types';
import {EtoolsRequestEndpoint} from '@unicef-polymer/etools-ajax';
import '@shoelace-style/shoelace/dist/components/dropdown/dropdown.js';
import '@shoelace-style/shoelace/dist/components/button/button.js';
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
      <sl-dropdown id="pdExportMenuBtn">
        <etools-icon-button name="more-vert" slot="trigger"> </etools-icon-button>
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
