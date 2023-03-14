import '@polymer/paper-icon-button/paper-icon-button';
import {buttonsStyles} from '@unicef-polymer/etools-modules-common/dist/styles/button-styles';
import {gridLayoutStylesLit} from '@unicef-polymer/etools-modules-common/dist/styles/grid-layout-styles-lit';
import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';
import {openDialog} from '@unicef-polymer/etools-modules-common/dist/utils/dialog';
import {AnyObject, PlannedVisit} from '@unicef-polymer/etools-types';
import {customElement, html, LitElement, property} from 'lit-element';
import {translate} from 'lit-translate';

@customElement('pv-quarter')
export class PvQuarter extends LitElement {
  static get styles() {
    return [buttonsStyles, gridLayoutStylesLit];
  }

  render() {
    return html`
      ${sharedStyles}
      <style>
        :host {
          display: block;
          flex: 0 0 16.6667%;
          max-width: 16.6667%;
          min-width: 170px;
          max-width: 200px;
        }
        .sites-display {
          padding-bottom: 10px;
        }

        .q-label {
          font-size: 14px;
          font-weight: bold;
          padding-inline-start: 8px;
        }
        .q-interval {
          font-size: 12px;
          padding-bottom: 8px;
          padding-inline-start: 8px;
        }
        .visit-no {
          padding: 0 8px;
        }
        .visits {
          padding-bottom: 16px;
        }
        .secondary-btn {
          font-size: 12px !important;
          padding-bottom: 24px !important;
        }

        paper-icon-button.light {
          color: #979797;
        }
        paper-icon-button {
          --paper-icon-button_-_width: 38px;
        }
      </style>
      <div>
        <div>
          <div class="q-label">Quarter ${this.qIndex}</div>
          <div class="q-interval">01 Jan 2022 - 01 Mar 2022</div>
        </div>

        <div class="layout-horizontal align-items-center visits">
          <paper-icon-button
            id="subtractBtn"
            class="light"
            icon="remove-circle"
            @tap="${this.subtractClicked}"
          ></paper-icon-button>
          <div class="visit-no">${this.item[`programmatic_q${this.qIndex}`]}</div>
          <paper-icon-button id="addBtn" class="light" icon="add-circle" @tap="${this.addClicked}"></paper-icon-button>
        </div>

        <div class="sites-display">
          <label class="paper-label">${translate('SITES')}</label>
          ${[{name: 'Lambada'}, {name: 'Nyangada'}].map((s: any) => {
            return html`<div>${s.name}</div>`;
          })}
        </div>
        <paper-button
          class="secondary-btn"
          @click="${() => this.openSitesDialog(this.item)}"
          ?hidden="${this.readonly}"
          title=${translate('SELECT_SITE_FROM_MAP')}
        >
          <iron-icon icon="add"></iron-icon>
          ${translate('SELECT_SITE_FROM_MAP')}
        </paper-button>
      </div>
    `;
  }

  @property({type: Object})
  item!: PlannedVisit;

  @property({type: Number})
  qIndex!: number;

  @property({type: Boolean})
  readonly!: false;

  @property({type: Boolean})
  required!: false;

  @property({type: Object})
  currentCountry!: AnyObject;

  @property({type: Array})
  allSites!: Site[];

  private openSitesDialog(item: PlannedVisit) {
    openDialog({
      dialog: 'sites-dialog',
      dialogData: {
        workspaceCoordinates: [this.currentCountry.longitude, this.currentCountry.latitude],
        sites: this.allSites,
        selectedSites: item.sites
      }
    }).then(({confirmed, response}) => {
      if (!confirmed) {
        return;
      }
      item.sites = response;
    });
  }

  inputChanged(e: CustomEvent, qIndex: number) {
    if (!e.detail) {
      return;
    }

    this.item['programmatic_' + qIndex] = e.detail.value;
  }

  subtractClicked() {}

  addClicked() {}
}
