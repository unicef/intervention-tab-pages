import {buttonsStyles} from '@unicef-polymer/etools-modules-common/dist/styles/button-styles';
import {gridLayoutStylesLit} from '@unicef-polymer/etools-modules-common/dist/styles/grid-layout-styles-lit';
import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';
import {openDialog} from '@unicef-polymer/etools-utils/dist/dialog.util';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import {AnyObject, PlannedVisit, Site} from '@unicef-polymer/etools-types';
import {css, html, LitElement} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {langChanged, translate} from 'lit-translate';
import '@shoelace-style/shoelace/dist/components/button/button.js';
import '@shoelace-style/shoelace/dist/components/icon-button/icon-button.js';
declare const dayjs: any;

@customElement('pv-quarter')
export class PvQuarter extends LitElement {
  static get styles() {
    return [
      buttonsStyles,
      gridLayoutStylesLit,
      css`
        sl-icon-button#x {
          width: 16px;
          color: var(--icon-delete-color);
          cursor: pointer;
        }
        sl-icon-button#x:hover {
          color: #b70202;
        }
        iron-icon[icon='add'] {
          width: 15px;
        }
      `
    ];
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
          max-width: 250px;
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
          padding-inline: 8px;
          font-size: 18px;
          font-weight: bold;
        }
        .visits {
          padding-bottom: 12px;
        }
        .sel-site-btn {
          --sl-button-font-size-medium: 12px !important;
          margin-bottom: 32px !important;
        }

        sl-icon-button.light {
          color: #979797;
        }
        sl-icon-button[readonly] {
          color: #d3d1d1;
          pointer-events: none;
        }

        .sites-display {
          padding-inline-start: 8px;
        }
      </style>
      <div>
        <div>
          <div class="q-label">${translate(`QUARTER_${this.qIndex}`)}</div>
          <div class="q-interval">${this.getQuarterInterval()}</div>
        </div>

        <div class="layout-horizontal align-items-center visits">
          <sl-icon-button
            id="subtractBtn"
            class="light"
            name="remove-circle"
            ?hidden="${this.readonly}"
            @tap="${this.subtractClicked}"
          ></sl-icon-button>
          <div class="visit-no">${this.item[`programmatic_q${this.qIndex}`]}</div>
          <sl-icon-button
            id="addBtn"
            class="light"
            name="add-circle"
            ?hidden="${this.readonly}"
            @tap="${this.addClicked}"
          ></sl-icon-button>
        </div>

        <div class="sites-display" ?hidden="${!this.item[`programmatic_q${this.qIndex}_sites`].length}">
          <label class="paper-label">${translate('SITES')}</label>
          ${this.item[`programmatic_q${this.qIndex}_sites`].map((s: any) => {
            return html`<div style="padding-bottom: 7px;">
              <iron-icon
                id="x"
                icon="close"
                ?hidden="${this.readonly}"
                @click="${() => this.onRemoveSite(s.id)}"
              ></iron-icon>
              ${s.name}
            </div>`;
          })}
        </div>
        <sl-button
          variant="text"
          class="primary-btn no-marg no-pad sel-site-btn"
          @click="${() => this.openSitesDialog()}"
          ?hidden="${this.readonly || !this.item[`programmatic_q${this.qIndex}`]}"
          title=${translate('SELECT_SITE_FROM_MAP')}
        >
          <iron-icon icon="add"></iron-icon>
          ${translate('SELECT_SITE_FROM_MAP')}
        </sl-button>
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

  private openSitesDialog() {
    openDialog({
      dialog: 'sites-dialog',
      dialogData: {
        workspaceCoordinates: [this.currentCountry.longitude, this.currentCountry.latitude],
        sites: this.allSites,
        selectedSites: this.item['programmatic_q' + this.qIndex + '_sites']
      }
    }).then(({confirmed, response}) => {
      if (!confirmed) {
        return;
      }
      this.item['programmatic_q' + this.qIndex + '_sites'] = response;
      this.requestUpdate();
    });
  }

  getQuarterInterval() {
    return langChanged(() => {
      if (!this.item.quarterIntervals || this.item.quarterIntervals.length < Number(this.qIndex) - 1) {
        return '-';
      }
      const qInterv = this.item.quarterIntervals;

      let date1 = '';
      let date2 = '';
      [date1, date2] = qInterv[Number(this.qIndex) - 1].split(' - ');

      return dayjs(date1).format('DD MMM YYYY') + ' - ' + dayjs(date2).format('DD MMM YYYY');
    });
    return this.item.quarterIntervals[Number(this.qIndex) - 1];
  }

  subtractClicked() {
    if (Number(this.item['programmatic_q' + this.qIndex]) == 0) {
      return;
    }
    this.item['programmatic_q' + this.qIndex] = Number(this.item['programmatic_q' + this.qIndex]) - 1;
    this.requestUpdate();
    fireEvent(this, 'visits-number-change');
  }

  addClicked() {
    this.item['programmatic_q' + this.qIndex] = Number(this.item['programmatic_q' + this.qIndex]) + 1;
    this.requestUpdate();
    fireEvent(this, 'visits-number-change');
  }

  onRemoveSite(siteId: number) {
    this.item[`programmatic_q${this.qIndex}_sites`] = this.item[`programmatic_q${this.qIndex}_sites`].filter(
      (s: Site) => s.id != siteId
    );
    this.requestUpdate();
  }
}
