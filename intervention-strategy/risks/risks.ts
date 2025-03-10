import {LitElement, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import '@unicef-polymer/etools-unicef/src/etools-input/etools-textarea';
import '@unicef-polymer/etools-unicef/src/etools-content-panel/etools-content-panel';
import '@unicef-polymer/etools-unicef/src/etools-table/etools-table';
import {EtoolsTableColumn, EtoolsTableColumnType} from '@unicef-polymer/etools-unicef/src/etools-table/etools-table';
import '@unicef-polymer/etools-unicef/src/etools-dropdown/etools-dropdown.js';
import {parseRequestErrorsAndShowAsToastMsgs} from '@unicef-polymer/etools-utils/dist/etools-ajax/ajax-error-parser';
import {RequestEndpoint, sendRequest} from '@unicef-polymer/etools-utils/dist/etools-ajax';
import {getStore} from '@unicef-polymer/etools-utils/dist/store.util';
import {openDialog} from '@unicef-polymer/etools-utils/dist/dialog.util';
import ComponentBaseMixin from '@unicef-polymer/etools-modules-common/dist/mixins/component-base-mixin';

import {layoutStyles} from '@unicef-polymer/etools-unicef/src/styles/layout-styles';
import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';
import {RootState} from '../../common/types/store.types';
import {EtoolsRouter} from '@unicef-polymer/etools-utils/dist/singleton/router';
import get from 'lodash-es/get';
import {selectRisks} from './risk.selectors';
import './risk-dialog';
import '@unicef-polymer/etools-modules-common/dist/layout/are-you-sure';
import {getEndpoint} from '@unicef-polymer/etools-utils/dist/endpoint.util';
import {interventionEndpoints} from '../../utils/intervention-endpoints';
import {getIntervention} from '../../common/actions/interventions';
import {currentInterventionPermissions} from '../../common/selectors';
import {CommentsMixin} from '../../common/components/comments/comments-mixin';
import {AnyObject, AsyncAction, EtoolsEndpoint, LabelAndValue, RiskData} from '@unicef-polymer/etools-types';
import {translate} from '@unicef-polymer/etools-unicef/src/etools-translate';
import {translatesMap} from '../../utils/intervention-labels-map';
import '@unicef-polymer/etools-unicef/src/etools-info-tooltip/info-icon-tooltip';
import cloneDeep from 'lodash-es/cloneDeep';
import {translateValue} from '@unicef-polymer/etools-modules-common/dist/utils/language';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import '@unicef-polymer/etools-unicef/src/etools-icon-button/etools-icon-button';

const customStyles = html`
  <style>
    .col_type {
      width: 20%;
    }
    .col_measures {
      width: 99%;
    }
    .row-actions {
      min-width: 90px;
    }
  </style>
`;

/**
 * @customElement
 */
@customElement('risks-element')
export class RisksElement extends CommentsMixin(ComponentBaseMixin(LitElement)) {
  static get styles() {
    return [layoutStyles];
  }

  render() {
    if (!this.data || this.data.constructor == Object) {
      return html` ${sharedStyles}

        <etools-loading source="risk" active></etools-loading>`;
    }
    // language=HTML
    return html`
      ${sharedStyles}
      <style>
        :host {
          display: block;
          margin-bottom: 24px;
          --etools-table-col-font-size: var(--etools-font-size-16, 16px);
        }

        #mitigationMeasures {
          width: 100%;
        }
        .m-20 {
          overflow: hidden;
          margin-inline-start: 20px !important;
        }
        info-icon-tooltip {
          --iit-margin: 0 0 0 4px;
          --iit-icon-size: 22px;
        }
        etools-table {
          padding-top: 0 !important;
        }
        @media only screen and (max-width: 760px), (min-device-width: 768px) and (max-device-width: 1024px) {
          etools-content-panel::part(ecp-content) {
            padding-inline-start: 18px;
          }
        }
      </style>
      <etools-content-panel show-expand-btn panel-title=${translate(translatesMap.risks)} comment-element="risks">
        <div slot="after-title">
          <info-icon-tooltip
            id="iit-risk"
            ?hidden="${!this.canEditAtLeastOneField}"
            .tooltipText="${translate('RISKS_INFO')}"
          ></info-icon-tooltip>
        </div>
        <div slot="panel-btns">
          <etools-icon-button
            ?hidden="${!this.canEditAtLeastOneField}"
            @click="${() => this.openRiskDialog()}"
            name="add-box"
          >
          </etools-icon-button>
        </div>
        <etools-table
          ?hidden="${!this.data?.length}"
          .columns="${this.columns}"
          .items="${this.data}"
          @edit-item="${(e: CustomEvent) => this.openRiskDialog(e)}"
          @delete-item="${this.confirmDeleteRiskItem}"
          .extraCSS="${this.getTableStyle()}"
          .customData="${{riskTypes: this.riskTypes}}"
          .showEdit=${this.canEditAtLeastOneField}
          .showDelete=${this.canEditAtLeastOneField}
        >
        </etools-table>
        <div class="row m-20" ?hidden="${this.data?.length}">
          <p>${translate('NO_RISK_ADDED')}</p>
        </div>
      </etools-content-panel>
    `;
  }

  @property({type: Object})
  data!: RiskData[];

  @property({type: Array})
  riskTypes!: LabelAndValue[];

  @property({type: Number})
  interventionId!: number;

  @property({type: Array})
  columns: EtoolsTableColumn[] = [
    {
      label: translate('TYPE') as unknown as string,
      name: 'risk_type',
      type: EtoolsTableColumnType.Custom,
      customMethod: (item: any, _key: string, customData: AnyObject) => {
        const riskType = customData.riskTypes.find((x: LabelAndValue) => x.value === item.risk_type);
        return riskType ? translateValue(riskType.label, 'RISK_TYPE') : '-';
      },
      cssClass: 'col_type'
    },
    {
      label: translate('PROPOSED_MITIGATION_MEASURES') as unknown as string,
      name: 'mitigation_measures',
      type: EtoolsTableColumnType.Text,
      cssClass: 'col_measures'
    }
  ];

  stateChanged(state: RootState) {
    if (!state.interventions.current) {
      return;
    }
    if (EtoolsRouter.pageIsNotCurrentlyActive(get(state, 'app.routeDetails'), 'interventions', 'strategy')) {
      return;
    }

    this.interventionId = state.interventions.current.id!;
    this.riskTypes = (state.commonData && state.commonData.riskTypes) || [];
    this.data = selectRisks(state);
    this.set_canEditAtLeastOneField({risks: currentInterventionPermissions(state)?.edit.risks});
    super.stateChanged(state);
  }

  getTableStyle() {
    return html` ${sharedStyles} ${customStyles}`;
  }

  openRiskDialog(e?: CustomEvent) {
    openDialog({
      dialog: 'risk-dialog',
      dialogData: {
        item: e ? cloneDeep(e.detail) : {},
        interventionId: this.interventionId,
        riskTypes: this.riskTypes
      }
    });
    this.openContentPanel();
  }

  async confirmDeleteRiskItem(e: CustomEvent) {
    const confirmed = await openDialog({
      dialog: 'are-you-sure',
      dialogData: {
        content: translate('DELETE_RISK_PROMPT') as unknown as string,
        confirmBtnText: translate('GENERAL.DELETE') as unknown as string
      }
    }).then(({confirmed}) => {
      return confirmed;
    });

    if (confirmed) {
      this.deleteRiskItem(e.detail.id);
    }
  }

  deleteRiskItem(riskId: string) {
    fireEvent(this, 'global-loading', {
      active: true,
      loadingSource: 'interv-risk-item-remove'
    });
    const endpoint = getEndpoint<EtoolsEndpoint, RequestEndpoint>(interventionEndpoints.riskDelete, {
      interventionId: this.interventionId,
      riskId: riskId
    });
    sendRequest({method: 'DELETE', endpoint: endpoint})
      .catch((error: any) => {
        parseRequestErrorsAndShowAsToastMsgs(error, this);
      })
      .then(() => {
        getStore().dispatch<AsyncAction>(getIntervention(String(this.interventionId)));
      })
      .finally(() =>
        fireEvent(this, 'global-loading', {
          active: false,
          loadingSource: 'interv-risk-item-remove'
        })
      );
  }
}
