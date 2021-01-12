import {LitElement, html, property, customElement} from 'lit-element';
import '@polymer/iron-label/iron-label';
import '@unicef-polymer/etools-loading/etools-loading.js';
import {logError} from '@unicef-polymer/etools-behaviors/etools-logging.js';
import {sendRequest} from '@unicef-polymer/etools-ajax/etools-ajax-request';
import {parseRequestErrorsAndShowAsToastMsgs} from '@unicef-polymer/etools-ajax/ajax-error-parser.js';
import {fireEvent} from '../../utils/fire-custom-event';
import {getEndpoint} from '../../utils/endpoint-helper';
import {interventionEndpoints} from '../../utils/intervention-endpoints';
import CommonMixin from '../../common/mixins/common-mixin';
import {translate} from 'lit-translate';

/**
 * LitElement
 * @customElement
 * @mixinFunction
 * @appliesMixin EndpointsMixin
 */
@customElement('etools-ram-indicator')
export class EtoolsRamIndicators extends CommonMixin(LitElement) {
  // static get is() {
  //   return 'etools-ram-indicators';
  // }

  render() {
    return html`
      <style>
        :host {
          position: relative;
          background-color: var(--light-theme-background-color);
        }

        *[hidden] {
          display: none !important;
        }

        #label,
        #no-ram-indicators {
          color: var(--secondary-text-color, #737373);
        }

        #ram-indicators-list {
          margin: 0;
          padding-left: 24px;
          list-style: circle;
        }
      </style>

      <etools-loading ?active="${this.loading}">Loading...</etools-loading>

      <iron-label>
        <span id="label">${translate('INTERVENTION_REPORTS.RAM_INDICATORS')}</span>
        <div id="ram-indicators" iron-label-target>
          ${this._noRamIndicators(this.ramIndicators.length)
            ? html`<span id="no-ram-indicators">&#8212;</span>`
            : html``}
          ${!this._noRamIndicators(this.ramIndicators.length)
            ? html`<ul id="ram-indicators-list">
                ${this.ramIndicators.map((ramIndName) => {
                  html`<li>${ramIndName}</li>`;
                })}
              </ul>`
            : html``}
        </div>
      </iron-label>
    `;
  }
  _interventionId!: number;

  set interventionId(interventionId) {
    this._interventionId = interventionId;
    if (!this.loading) {
      this._getRamIndicatorsData(this._interventionId, this.cpId);
    }
  }

  @property({type: Number})
  get interventionId() {
    return this._interventionId;
  }

  _cpId!: number;

  set cpId(cpId) {
    this._cpId = cpId;
    if (!this.loading) {
      this._getRamIndicatorsData(this.interventionId, this._cpId);
    }
  }

  @property({type: Number})
  get cpId() {
    return this._cpId;
  }

  @property({type: Array})
  ramIndicators: any[] = [];

  @property({type: Boolean})
  loading = false;

  _getRamIndicatorsData(interventionId: number, cpId: number) {
    // Initially was inside a debouncer!
    const validIds = interventionId > 0 && cpId > 0;
    if (!validIds) {
      return;
    }

    this._requestRamIndicatorsData({
      intervention_id: interventionId,
      cp_output_id: cpId
    });
  }

  _requestRamIndicatorsData(reqPayload: any) {
    this.loading = true;
    sendRequest({
      method: 'GET',
      endpoint: getEndpoint(interventionEndpoints.cpOutputRamIndicators, reqPayload)
    })
      .then((resp: any) => {
        this.loading = false;;
        this.ramIndicators = resp.ram_indicators.map((ri: any) => ri.indicator_name);
      })
      .catch((error: any) => {
        if (error.status === 404) {
          fireEvent(this, 'toast', {
            text: this._translate('INTERVENTION_REPORTS.DUE_DATE'),
            showCloseBtn: true
          });
        } else {
          parseRequestErrorsAndShowAsToastMsgs(error, this);
        }
        logError(
          'Error occurred on RAM Indicators request for PD ID: ' +
            reqPayload.intervention_id +
            ' and CP Output ID: ' +
            reqPayload.cp_output_id,
          'etools-ram-indicators',
          error
        );
        this.loading = false;
      });
  }

  _noRamIndicators(l: number) {
    return typeof l !== 'number' || l === 0;
  }
}
