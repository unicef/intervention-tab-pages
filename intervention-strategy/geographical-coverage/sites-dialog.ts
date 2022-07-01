import {LitElement, html, property, customElement} from 'lit-element';
// import EtoolsDialog from '@unicef-polymer/etools-dialog/etools-dialog.js';
import '@polymer/paper-input/paper-textarea';
import {gridLayoutStylesLit} from '@unicef-polymer/etools-modules-common/dist/styles/grid-layout-styles-lit';
import {buttonsStyles} from '@unicef-polymer/etools-modules-common/dist/styles/button-styles';
import {fireEvent} from '@unicef-polymer/etools-modules-common/dist/utils/fire-custom-event';
import {translate} from 'lit-translate';
import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';
import './sites-widget/sites-widget';
import {Site} from '@unicef-polymer/etools-types';

/**
 * @customElement
 */
@customElement('sites-dialog')
export class GroupedLocationsDialog extends LitElement {
  static get styles() {
    return [gridLayoutStylesLit, buttonsStyles];
  }

  render() {
    if (!this.sites) {
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
        dialog-title=${translate('SELECT_SITE')}
        cancel-btn-text=${translate('GENERAL.CANCEL')}
        ok-btn-text=${translate('SELECT')}
        @confirm-btn-clicked="${() => this.onConfirm()}"
        @close="${() => this.onClose()}"
      >
        <sites-widget
          .workspaceCoordinates="${this.workspaceCoordinates}"
          .sites="${this.sites}"
          .selectedSites="${this.selectedSites}"
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
  sites!: Site[];

  @property({type: Array})
  workspaceCoordinates!: [number, number];

  set dialogData(data: any) {
    if (!data) {
      return;
    }
    const {workspaceCoordinates, sites, selectedSites} = data;
    this.workspaceCoordinates = workspaceCoordinates;
    this.sites = sites || [];
    this.selectedSites = selectedSites || [];
  }

  onSitesChanged(sites: Site[]): void {
    this.selectedSites = sites;
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
