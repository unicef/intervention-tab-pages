import {LitElement, html, property, customElement} from 'lit-element';
import '@polymer/paper-input/paper-textarea';
import '@unicef-polymer/etools-content-panel/etools-content-panel';
import '@unicef-polymer/etools-table/etools-table';
import {EtoolsTableColumn, EtoolsTableColumnType} from '@unicef-polymer/etools-table/etools-table';
import '@unicef-polymer/etools-dropdown/etools-dropdown.js';
import '@polymer/paper-icon-button/paper-icon-button';
import {parseRequestErrorsAndShowAsToastMsgs} from '@unicef-polymer/etools-ajax/ajax-error-parser';
import {sendRequest} from '@unicef-polymer/etools-ajax';
import {getStore} from '../../utils/redux-store-access';
import {openDialog} from '../../utils/dialog';
import ComponentBaseMixin from '../../common/mixins/component-base-mixin';
import {buttonsStyles} from '../../common/styles/button-styles';
import {gridLayoutStylesLit} from '../../common/styles/grid-layout-styles-lit';
import {sharedStyles} from '../../common/styles/shared-styles-lit';
import {RootState} from '../../common/types/store.types';
import {pageIsNotCurrentlyActive} from '../../utils/common-methods';
import get from 'lodash-es/get';
import {selectRisks} from './risk.selectors';
import './risk-dialog';
import '../../common/layout/are-you-sure';
import {getEndpoint} from '../../utils/endpoint-helper';
import {interventionEndpoints} from '../../utils/intervention-endpoints';
import {getIntervention} from '../../common/actions/interventions';
import {currentInterventionPermissions} from '../../common/selectors';
import {CommentsMixin} from '../../common/components/comments/comments-mixin';
import {AnyObject, AsyncAction, LabelAndValue, RiskData} from '@unicef-polymer/etools-types';
import {translate} from 'lit-translate';

const customStyles = html`
  <style>
    .col_type {
      width: 15%;
    }
    .col_measures {
      width: 99%;
    }
  </style>
`;

/**
 * @customElement
 */
@customElement('risks-element')
export class RisksElement extends CommentsMixin(ComponentBaseMixin(LitElement)) {
  static get styles() {
    return [buttonsStyles, gridLayoutStylesLit];
  }

  render() {
    if (!this.data || this.data.constructor == Object) {
      return html`<style>
          ${sharedStyles}
        </style>
        <etools-loading loading-text="Loading..." active></etools-loading>`;
    }
    // language=HTML
    return html`
      <style>
        ${sharedStyles} :host {
          display: block;
          margin-bottom: 24px;
        }

        #mitigationMeasures {
          width: 100%;
        }
        .row-h {
          overflow: hidden;
          padding: 20px;
        }
      </style>
      <etools-content-panel
        show-expand-btn
        panel-title=${translate('INTERVENTION_STRATEGY.RISKS.RISKS')}
        comment-element="risks"
        comment-description=${translate('INTERVENTION_STRATEGY.RISKS.RISKS')}
      >
        <div slot="panel-btns">
          <paper-icon-button
            ?hidden="${!this.canEditAtLeastOneField}"
            @click="${() => this.openRiskDialog()}"
            icon="add-box"
          >
          </paper-icon-button>
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
        <div class="row-h" ?hidden="${this.data?.length}">
          <p>${translate('INTERVENTION_STRATEGY.RISKS.NO_RISK_ADDED')}</p>
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
      label: (translate('INTERVENTION_STRATEGY.RISKS.TYPE') as unknown) as string,
      name: 'risk_type',
      type: EtoolsTableColumnType.Custom,
      customMethod: (item: any, _key: string, customData: AnyObject) => {
        const riskType = customData.riskTypes.find((x: LabelAndValue) => x.value === item.risk_type);
        return riskType ? riskType.label : '-';
      },
      cssClass: 'col_type'
    },
    {
      label: (translate('INTERVENTION_STRATEGY.RISKS.PROPOSED_MITIGATION_MEASURES') as unknown) as string,
      name: 'mitigation_measures',
      type: EtoolsTableColumnType.Text,
      cssClass: 'col_measures'
    }
  ];

  stateChanged(state: RootState) {
    if (!state.interventions.current) {
      return;
    }
    if (pageIsNotCurrentlyActive(get(state, 'app.routeDetails'), 'interventions', 'strategy')) {
      return;
    }

    this.interventionId = state.interventions.current.id!;
    this.riskTypes = (state.commonData && state.commonData.riskTypes) || [];
    this.data = selectRisks(state);
    this.set_canEditAtLeastOneField({risks: currentInterventionPermissions(state)?.edit.risks});
    super.stateChanged(state);
  }

  getTableStyle() {
    return html`<style>
        ${sharedStyles}
      </style>
      ${customStyles}`;
  }

  openRiskDialog(e?: CustomEvent) {
    openDialog({
      dialog: 'risk-dialog',
      dialogData: {
        item: e ? e.detail : {},
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
        content: (translate('INTERVENTION_STRATEGY.RISKS.DELETE_RISK_PROMPT') as unknown) as string,
        confirmBtnText: (translate('GENERAL.DELETE') as unknown) as string
      }
    }).then(({confirmed}) => {
      return confirmed;
    });

    if (confirmed) {
      this.deleteRiskItem(e.detail.id);
    }
  }

  deleteRiskItem(riskId: string) {
    const endpoint = getEndpoint(interventionEndpoints.riskDelete, {
      interventionId: this.interventionId,
      riskId: riskId
    });
    sendRequest({method: 'DELETE', endpoint: endpoint})
      .catch((error: any) => {
        parseRequestErrorsAndShowAsToastMsgs(error, this);
      })
      .then(() => {
        getStore().dispatch<AsyncAction>(getIntervention(String(this.interventionId)));
      });
  }
}
