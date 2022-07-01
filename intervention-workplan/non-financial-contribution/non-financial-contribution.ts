import {LitElement, html, customElement, property} from 'lit-element';
import '@polymer/paper-button/paper-button';
import '@polymer/paper-icon-button/paper-icon-button';
import '@polymer/paper-input/paper-textarea';
import '@unicef-polymer/etools-loading/etools-loading';
import '@unicef-polymer/etools-content-panel/etools-content-panel';
import {buttonsStyles} from '@unicef-polymer/etools-modules-common/dist/styles/button-styles';
import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';
import {gridLayoutStylesLit} from '@unicef-polymer/etools-modules-common/dist/styles/grid-layout-styles-lit';
import {
  selectNonFinancialContribution,
  selectNonFinancialContributionPermissions
} from './nonFinancialContribution.selectors';
import {NonFinancialContributionData, NonFinancialContributionPermissions} from './nonFinancialContribution.models';
import ComponentBaseMixin from '@unicef-polymer/etools-modules-common/dist/mixins/component-base-mixin';
import {getStore} from '@unicef-polymer/etools-modules-common/dist/utils/redux-store-access';
import {patchIntervention} from '../../common/actions/interventions';
import cloneDeep from 'lodash-es/cloneDeep';
import {RootState} from '../../common/types/store.types';
import {
  pageIsNotCurrentlyActive,
  detailsTextareaRowsCount
} from '@unicef-polymer/etools-modules-common/dist/utils/common-methods';
import get from 'lodash-es/get';
import {CommentsMixin} from '../../common/components/comments/comments-mixin';
import {AsyncAction, Permission} from '@unicef-polymer/etools-types';
import {translate} from 'lit-translate';
import {translatesMap} from '../../utils/intervention-labels-map';
import {TABS} from '../../common/constants';
import '@unicef-polymer/etools-info-tooltip/info-icon-tooltip';

/**
 * @customElement
 */
@customElement('non-financial-contribution')
export class NonFinancialContributionElement extends CommentsMixin(ComponentBaseMixin(LitElement)) {
  static get styles() {
    return [gridLayoutStylesLit, buttonsStyles];
  }

  render() {
    if (!this.data || !this.permissions) {
      return html` ${sharedStyles}
        <etools-loading source="non-f" loading-text="Loading..." active></etools-loading>`;
    }
    // language=HTML
    return html`
      ${sharedStyles}
      <style>
        :host {
          display: block;
          margin-bottom: 24px;
        }

        etools-content-panel::part(ecp-content) {
          padding: 8px 24px 16px 24px;
        }
        .row-padding-v {
          position: relative;
        }
        #iit-non-fin {
          --iit-icon-size: 18px;
          --iit-margin: 0 0 4px 4px;
        }
      </style>

      <etools-content-panel
        show-expand-btn
        panel-title=${translate('PARTNER_NON_FINANCIAL_CONTRIBUTION')}
        comment-element="non-financial-contribution"
        comment-description=${translate('PARTNER_NON_FINANCIAL_CONTRIBUTION')}
      >
        <div slot="panel-btns">${this.renderEditBtn(this.editMode, this.canEditAtLeastOneField)}</div>

        <div class="row-padding-v">
          <div>
            <label class="paper-label">${translate(translatesMap.ip_program_contribution)}</label>
            <info-icon-tooltip
              id="iit-non-fin"
              slot="after-label"
              ?hidden="${this.isReadonly(this.editMode, this.permissions.edit?.ip_program_contribution)}"
              .tooltipText="${translate('PARTNER_NON_FINANCIAL_CONTRIBUTION_TOOLTIP')}"
            ></info-icon-tooltip>
          </div>
          <paper-textarea
            class="w100"
            id="ip_program_contribution"
            no-label-float
            placeholder="—"
            .value="${this.data.ip_program_contribution}"
            @value-changed="${({detail}: CustomEvent) => this.valueChanged(detail, 'ip_program_contribution')}"
            ?readonly="${this.isReadonly(this.editMode, this.permissions.edit?.ip_program_contribution)}"
            ?required="${this.permissions.required.ip_program_contribution}"
            maxlength="5000"
            rows="${detailsTextareaRowsCount(this.editMode)}"
            .charCounter="${!this.isReadonly(this.editMode, this.permissions.edit?.ip_program_contribution)}"
          >
          </paper-textarea>
        </div>

        ${this.renderActions(this.editMode, this.canEditAtLeastOneField)}
      </etools-content-panel>
    `;
  }
  @property({type: Object})
  data!: NonFinancialContributionData;

  @property({type: Object})
  permissions!: Permission<NonFinancialContributionPermissions>;

  @property({type: Object})
  originalData = {};

  stateChanged(state: RootState) {
    if (pageIsNotCurrentlyActive(get(state, 'app.routeDetails'), 'interventions', TABS.Workplan)) {
      return;
    }

    if (!state.interventions.current) {
      return;
    }
    this.data = selectNonFinancialContribution(state);
    this.originalData = cloneDeep(this.data);
    this.setPermissions(state);
    super.stateChanged(state);
  }

  private setPermissions(state: any) {
    this.permissions = selectNonFinancialContributionPermissions(state);
    this.set_canEditAtLeastOneField(this.permissions.edit);
  }

  saveData() {
    if (!this.validate()) {
      return Promise.resolve(false);
    }
    return getStore()
      .dispatch<AsyncAction>(patchIntervention(this.data))
      .then(() => {
        this.editMode = false;
      });
  }
}
