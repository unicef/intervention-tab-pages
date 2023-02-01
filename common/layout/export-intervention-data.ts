import {customElement, html, LitElement, property, css} from 'lit-element';
import '@polymer/paper-button/paper-button';
import '@polymer/paper-menu-button/paper-menu-button';
import '@polymer/iron-icon/iron-icon';
import '@polymer/paper-listbox/paper-listbox';
import {fireEvent} from '@unicef-polymer/etools-modules-common/dist/utils/fire-custom-event';
import {elevation2} from '@unicef-polymer/etools-modules-common/dist/styles/elevation-styles';
import {interventionEndpoints} from '../../utils/intervention-endpoints';
import {getEndpoint} from '@unicef-polymer/etools-modules-common/dist/utils/endpoint-helper';
import {AnyObject} from '@unicef-polymer/etools-types';

/**
 * @customElement
 * @LitElement
 */
@customElement('export-intervention-data')
export class ExportInterventionData extends LitElement {
  static get styles() {
    return [
      css`
        paper-menu-button {
          padding: 0px;
        }
        paper-button {
          height: 34px;
          padding: 0px;
          min-width: 20px;
          font-weight: bold;
          color: var(--secondary-text-color);
        }

        paper-button iron-icon {
          color: var(--secondary-text-color);
        }

        paper-button:focus {
          ${elevation2}
        }

        paper-item:hover {
          cursor: pointer;
        }

        paper-item {
          white-space: nowrap;
        }
      `
    ];
  }
  public render() {
    return html`
      <paper-menu-button id="pdExportMenuBtn" close-on-activate horizontal-align="right">
        <paper-button slot="dropdown-trigger" class="dropdown-trigger">
          <iron-icon icon="more-vert"></iron-icon>
        </paper-button>
        <paper-listbox slot="dropdown-content">
          ${this.exportLinks.map(
            (item) => html` <paper-item @click="${() => this.export(item.type)}">${item.name}</paper-item>`
          )}
        </paper-listbox>
      </paper-menu-button>
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
      url = getEndpoint(interventionEndpoints.downloadComment, {interventionId: this.interventionId}).url;
      window.open(url, '_blank');
      return;
    }
    if (_type == 'export_results') {
      url = getEndpoint(interventionEndpoints.expectedResultsExport, {intervention_id: this.interventionId}).url;
      window.open(url, '_blank');
      return;
    }
    if (_type == 'export_pdf') {
      url = getEndpoint(interventionEndpoints.exportPdf, {interventionId: this.interventionId}).url;
      window.open(url, '_blank');
      return;
    }
    if (_type == 'export_xls') {
      url = getEndpoint(interventionEndpoints.exportXls, {interventionId: this.interventionId}).url;
      window.open(url, '_blank');
      return;
    }
    fireEvent(this, 'toast', {text: 'Export this not implemented...'});
  }
}
