import '@polymer/paper-icon-button/paper-icon-button';
import {buttonsStyles} from '@unicef-polymer/etools-modules-common/dist/styles/button-styles';
import {gridLayoutStylesLit} from '@unicef-polymer/etools-modules-common/dist/styles/grid-layout-styles-lit';
import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';
import {openDialog} from '@unicef-polymer/etools-utils/dist/dialog.util';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import {AnyObject, PlannedVisit, Site} from '@unicef-polymer/etools-types';
import {css, customElement, html, LitElement, property} from 'lit-element';
import {langChanged, translate} from 'lit-translate';
declare const dayjs: any;

@customElement('pv-quarter')
export class PvQuarter extends LitElement {
  static get styles() {
    return [
      buttonsStyles,
      gridLayoutStylesLit,
      css`
        iron-icon#x {
          width: 16px;
          color: var(--icon-delete-color);
          cursor: pointer;
        }
        iron-icon#x:hover {
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
        .secondary-btn {
          font-size: 12px !important;
          margin-bottom: 32px !important;
        }

        paper-icon-button.light {
          color: #979797;
        }
        paper-icon-button[readonly] {
          color: #d3d1d1;
          pointer-events: none;
        }
        paper-icon-button {
          --paper-icon-button_-_width: 38px;
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
          <paper-icon-button
            id="subtractBtn"
            class="light"
            icon="remove-circle"
            ?hidden="${this.readonly}"
            @tap="${this.subtractClicked}"
          ></paper-icon-button>
          <div class="visit-no">${this.item[`programmatic_q${this.qIndex}`]}</div>
          <paper-icon-button
            id="addBtn"
            class="light"
            icon="add-circle"
            ?hidden="${this.readonly}"
            @tap="${this.addClicked}"
          ></paper-icon-button>
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
        <paper-button
          class="secondary-btn"
          @click="${() => this.openSitesDialog()}"
          ?hidden="${this.readonly || !this.item[`programmatic_q${this.qIndex}`]}"
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
