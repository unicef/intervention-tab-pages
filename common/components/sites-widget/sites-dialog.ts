import {LitElement, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';
// import EtoolsDialog from '@unicef-polymer/etools-unicef/src/etools-dialog/etools-dialog.js';
import '@unicef-polymer/etools-unicef/src/etools-input/etools-textarea';
import {layoutStyles} from '@unicef-polymer/etools-unicef/src/styles/layout-styles';

import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import {translate} from '@unicef-polymer/etools-unicef/src/etools-translate';
import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';
import './sites-widget';
import {Site} from '@unicef-polymer/etools-types';

/**
 * @customElement
 */
@customElement('sites-dialog')
export class GroupedLocationsDialog extends LitElement {
  static get styles() {
    return [layoutStyles];
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

        .adminLevelLoc {
          color: var(--primary-color);
          font-weight: bold;
        }

        .left-padding {
          padding-inline-start: 16px;
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

        etools-dialog etools-textarea::part(textarea) {
          min-height: 48px;
          max-height: 96px;
          overflow-y: auto;
        }
      </style>

      <etools-dialog
        id="sitesDialog"
        size="lg"
        keep-dialog-open
        dialog-title=${translate('SELECT_SITE')}
        cancel-btn-text=${translate('GENERAL.CANCEL')}
        ok-btn-text=${translate('SELECT')}
        @confirm-btn-clicked="${() => this.onConfirm()}"
        @close="${() => this.onClose()}"
      >
        <div class="row">
          <div class="col-12">
            <sites-widget
              .workspaceCoordinates="${this.workspaceCoordinates}"
              .sites="${this.sites}"
              .selectedSites="${this.selectedSites}"
              @sites-changed="${({detail}: CustomEvent) => {
                this.onSitesChanged(detail.sites || []);
              }}"
            ></sites-widget>
          </div>
          <div class="col-12">
            <etools-textarea
              label="${translate('SELECTED_SITES')}"
              always-float-label
              class="w100"
              placeholder="&#8212;"
              readonly
              .value="${this.getSelectedSitesText(this.selectedSites)}"
            >
            </etools-textarea>
          </div>
        </div>
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
