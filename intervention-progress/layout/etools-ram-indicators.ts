import {LitElement, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import '@unicef-polymer/etools-unicef/src/etools-loading/etools-loading';
import {EtoolsLogger} from '@unicef-polymer/etools-utils/dist/singleton/logger';
import {sendRequest} from '@unicef-polymer/etools-utils/dist/etools-ajax/ajax-request';
import {parseRequestErrorsAndShowAsToastMsgs} from '@unicef-polymer/etools-utils/dist/etools-ajax/ajax-error-parser';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import {getEndpoint} from '@unicef-polymer/etools-utils/dist/endpoint.util';
import {interventionEndpoints} from '../../utils/intervention-endpoints';
import {translate, get as getTranslation} from '@unicef-polymer/etools-unicef/src/etools-translate';
import CommonMixin from '@unicef-polymer/etools-modules-common/dist/mixins/common-mixin';

/**
 * LitElement
 * @customElement
 * @mixinFunction
 * @appliesMixin EndpointsMixin
 */
@customElement('etools-ram-indicators')
export class EtoolsRamIndicators extends CommonMixin(LitElement) {
  render() {
    return html`
      <style>
        :host {
          position: relative;
          background-color: var(--light-theme-background-color);
        }
        .container {
          padding: 16px 24px;
        }

        *[hidden] {
          display: none !important;
        }

        label {
          font-size: var(--etools-font-size-14, 14px);
        }

        #label,
        #no-ram-indicators {
          color: var(--secondary-text-color, #737373);
          display: block;
        }

        #ram-indicators-list {
          margin: 0;
          padding-inline-start: 24px;
          list-style: circle;
        }
      </style>

      <etools-loading ?active="${this.loading}"></etools-loading>
      <div class="container">
        <label for="ram-indicators" id="label">${translate('RAM_INDICATORS')}</label>
        <div id="ram-indicators">${this.getRamIndicatorsHTML(this.ramIndicators)}</div>
      </div>
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

  getRamIndicatorsHTML(ramIndicators: any[]) {
    if (!ramIndicators || !ramIndicators.length) {
      return html`<span id="no-ram-indicators">&#8212;</span>`;
    } else {
      return html`<ul id="ram-indicators-list">
        ${this.renderRamIndicators(ramIndicators)}
      </ul>`;
    }
  }

  renderRamIndicators(ramIndicators: any[]) {
    return html`${ramIndicators.map((ramIndName) => html`<li>${ramIndName}</li>`)}`;
  }

  _requestRamIndicatorsData(reqPayload: any) {
    this.loading = true;
    sendRequest({
      method: 'GET',
      endpoint: getEndpoint(interventionEndpoints.cpOutputRamIndicators, reqPayload)
    })
      .then((resp: any) => {
        this.loading = false;
        this.ramIndicators = resp.ram_indicators.map((ri: any) => ri.indicator_name);
      })
      .catch((error: any) => {
        if (error.status === 404) {
          fireEvent(this, 'toast', {
            text: getTranslation('PMP_IS_NOT_SYNCED_WITH_PRP')
          });
        } else {
          parseRequestErrorsAndShowAsToastMsgs(error, this);
        }
        EtoolsLogger.error(
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
}
