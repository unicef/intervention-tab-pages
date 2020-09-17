import {LitElement, html, property, customElement} from 'lit-element';
import '@polymer/paper-input/paper-textarea';
import '@unicef-polymer/etools-content-panel/etools-content-panel';
import '@unicef-polymer/etools-table/etools-table';
import {EtoolsTableColumn, EtoolsTableColumnType} from '@unicef-polymer/etools-table/etools-table';
import '@unicef-polymer/etools-dropdown';
import '@polymer/paper-icon-button/paper-icon-button';
import {parseRequestErrorsAndShowAsToastMsgs} from '@unicef-polymer/etools-ajax/ajax-error-parser';
import {sendRequest} from '@unicef-polymer/etools-ajax';
import {connect} from 'pwa-helpers/connect-mixin';
import {getStore} from '../../utils/redux-store-access';
import {openDialog} from '../../utils/dialog';
import ComponentBaseMixin from '../../common/mixins/component-base-mixin';
import {buttonsStyles} from '../../common/styles/button-styles';
import {gridLayoutStylesLit} from '../../common/styles/grid-layout-styles-lit';
import {sharedStyles} from '../../common/styles/shared-styles-lit';
import {Risk} from './risk.models';
import {RootState, LabelAndValue, AnyObject} from '../../common/models/globals.types';
import {pageIsNotCurrentlyActive} from '../../utils/common-methods';
import get from 'lodash-es/get';
import {selectRisks} from './risk.selectors';
import './risk-dialog';
import '../../common/layout/are-you-sure';
import {getEndpoint} from '../../utils/endpoint-helper';
import {interventionEndpoints} from '../../utils/intervention-endpoints';
import {getIntervention} from '../../common/actions';
import {currentInterventionPermissions} from '../../common/selectors';

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
export class RisksElement extends connect(getStore())(ComponentBaseMixin(LitElement)) {
  static get styles() {
    return [buttonsStyles, gridLayoutStylesLit];
  }

  render() {
    if (!this.data) {
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
          --ecp-content-padding: 0;
          --ecp-content_-_padding: 0;
        }
        #mitigationMeasures {
          width: 100%;
        }
      </style>
      <etools-content-panel show-expand-btn panel-title="Risks">
        <div slot="panel-btns">
          <paper-icon-button
            ?hidden="${!this.canEditAtLeastOneField}"
            @click="${() => this.openRiskDialog()}"
            icon="add-box"
          >
          </paper-icon-button>
        </div>
        <etools-table
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
      </etools-content-panel>
    `;
  }

  @property({type: Object})
  data!: Risk[];

  @property({type: Array})
  riskTypes!: LabelAndValue[];

  @property({type: Number})
  interventionId!: number;

  @property({type: Array})
  columns: EtoolsTableColumn[] = [
    {
      label: 'Type',
      name: 'risk_type',
      type: EtoolsTableColumnType.Custom,
      customMethod: (item: any, _key: string, customData: AnyObject) => {
        const riskType = customData.riskTypes.find((x: LabelAndValue) => x.value === item.risk_type);
        return riskType ? riskType.label : '-';
      },
      cssClass: 'col_type'
    },
    {
      label: 'Proposed mitigation measures',
      name: 'mitigation_measures',
      type: EtoolsTableColumnType.Text,
      cssClass: 'col_measures'
    }
  ];

  stateChanged(state: RootState) {
    if (!state.interventions.current) {
      return;
    }
    if (pageIsNotCurrentlyActive(get(state, 'app.routeDetails'), 'interventions', 'management')) {
      return;
    }

    this.interventionId = state.interventions.current.id!;
    this.riskTypes = (state.commonData && state.commonData.riskTypes) || [];
    this.data = selectRisks(state);
    this.set_canEditAtLeastOneField({risks: currentInterventionPermissions(state)?.edit.risks});
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
  }

  async confirmDeleteRiskItem(e: CustomEvent) {
    const confirmed = await openDialog({
      dialog: 'are-you-sure',
      dialogData: {
        content: 'Are you sure you want to delete this Risk item?',
        confirmBtnText: 'Delete'
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
      .then((_resp: any) => {
        getStore().dispatch(getIntervention(String(this.interventionId)));
      });
  }
}
