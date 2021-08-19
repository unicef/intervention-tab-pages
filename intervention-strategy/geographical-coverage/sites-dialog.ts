import {LitElement, html, property, customElement} from 'lit-element';
// import EtoolsDialog from '@unicef-polymer/etools-dialog/etools-dialog.js';
import '@polymer/paper-input/paper-textarea';
import {gridLayoutStylesLit} from '../../../../etools-pages-common/styles/grid-layout-styles-lit';
import {buttonsStyles} from '../../../../etools-pages-common/styles/button-styles';
import {fireEvent} from '../../../../etools-pages-common/utils/fire-custom-event';
import {translate} from 'lit-translate';
import {sharedStyles} from '../../../../etools-pages-common/styles/shared-styles-lit';
import './sites-widget/sites-widget';

/**
 * @customElement
 */
@customElement('sites-dialog')
export class GroupedLocationsDialog extends LitElement {
  static get styles() {
    return [gridLayoutStylesLit, buttonsStyles];
  }

  render() {
    if (!this.allSites) {
      return html``;
    }
    // language=HTML
    return html`
      ${sharedStyles}
      <style>
        [hidden] {
          display: none !important;
        }

        etools-dialog::part(ed-scrollable) {
          min-height: 300px;
          font-size: 16px;
        }

        .adminLevelLoc {
          color: var(--primary-color);
          font-weight: bold;
        }

        .left-padding {
          padding-left: 16px;
        }

        .top-padding {
          padding-top: 16px;
        }

        .child-bottom-padding {
          padding-bottom: 8px;
        }

        .parent-padding {
          padding-bottom: 8px;
          padding-top: 8px;
        }

        .bordered-div {
          border: solid 1px var(--error-box-border-color);
          background-color: var(--error-box-bg-color);
          padding: 10px;
          margin: 16px 0;
        }

        div.child-bottom-padding:last-of-type {
          padding-bottom: 0;
        }
      </style>

      <etools-dialog
        id="sitesDialog"
        size="lg"
        keep-dialog-open
        opened
        dialog-title=${translate('SITES')}
        cancel-btn-text=${translate('GENERAL.CANCEL')}
        ok-btn-text=${translate('GENERAL.ADD_UPDATE')}
        @confirm-btn-clicked="${() => this.onConfirm()}"
        @close="${() => this.onClose()}"
      >
        <sites-widget
          .workspaceCoordinates="${this.workspaceCoordinates}"
          .allSites="${this.allSites}"
          .selectedSites="${this.selectedSites.map((x) => x.id)}"
          @sites-changed="${({detail}: CustomEvent) => {
            this.onSitesChanged(detail.sites || []);
          }}"
        ></sites-widget>

        <paper-textarea
          label="Selected sites"
          always-float-label
          class="w100"
          placeholder="&#8212;"
          readonly
          max-rows="4"
          .value="${this.getSelectedSitesText(this.selectedSites)}"
        >
        </paper-textarea>
      </etools-dialog>
    `;
  }

  @property({type: Array})
  selectedSites!: Site[];

  @property({type: Array})
  allSites!: Site[];

  @property({type: Array})
  workspaceCoordinates!: [number, number];

  set dialogData(data: any) {
    if (!data) {
      return;
    }
    const {workspaceCoordinates, sites, selectedSites} = data;
    this.workspaceCoordinates = workspaceCoordinates;
    this.allSites = sites || [];
    this.selectedSites = selectedSites || [];
  }

  onSitesChanged(siteIDs: number[]): void {
    this.selectedSites = this.allSites.filter((x) => siteIDs.includes(x.id));
  }

  getSelectedSitesText(sites: Site[]) {
    return (sites || []).map((x) => x.name).join('  |  ');
  }

  onConfirm() {
    fireEvent(this, 'dialog-closed', {confirmed: true, response: this.selectedSites});
  }

  onClose() {
    fireEvent(this, 'dialog-closed', {confirmed: false});
  }
}
