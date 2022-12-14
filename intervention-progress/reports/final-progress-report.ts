import ComponentBaseMixin from '@unicef-polymer/etools-modules-common/dist/mixins/component-base-mixin';
import {customElement, html, LitElement, property} from 'lit-element';
import '@unicef-polymer/etools-content-panel/etools-content-panel.js';
import {translate} from 'lit-translate';
import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';
import '@polymer/paper-checkbox/paper-checkbox';
import {gridLayoutStylesLit} from '@unicef-polymer/etools-modules-common/dist/styles/grid-layout-styles-lit';
import {pageIsNotCurrentlyActive} from '@unicef-polymer/etools-modules-common/dist/utils/common-methods';
import get from 'lodash-es/get';
import {RootState} from '../../common/types/store.types';
import {TABS} from '../../common/constants';
import {cloneDeep, isJsonStrMatch} from '@unicef-polymer/etools-modules-common/dist/utils/utils';
import {getStore} from '@unicef-polymer/etools-modules-common/dist/utils/redux-store-access';
import {AsyncAction} from '@unicef-polymer/etools-types';
import {patchIntervention} from '../../common/actions/interventions';
import {connectStore} from '@unicef-polymer/etools-modules-common/dist/mixins/connect-store-mixin';

/** Visible only when PD is in status Ended */
@customElement('final-progress-report')
export class IndicatorReportTarget extends connectStore(ComponentBaseMixin(LitElement)) {
  static get styles() {
    return [gridLayoutStylesLit];
  }
  render() {
    return html`
      <style>
        ${sharedStyles} .padding {
          padding: 35px 24px;
        }
        paper-checkbox[disabled] {
          --paper-checkbox-checked-color: black;
          --paper-checkbox-unchecked-color: black;
          --paper-checkbox-label-color: black;
        }
      </style>
      <etools-content-panel
        show-expand-btn
        panel-title="${translate('FINAL_PROGRESS_REPORT')}"
        ?hidden="${!this.permissions?.view?.final_review_approved}"
      >
        <div slot="panel-btns">${this.renderEditBtn(this.editMode, this.permissions?.edit?.final_review_approved)}</div>

        <div class="padding">
          <paper-checkbox
            ?checked="${this.data.final_review_approved}"
            ?disabled="${this.isReadonly(this.editMode, this.permissions?.edit.final_review_approved)}"
            @checked-changed="${(e: CustomEvent) => {
              this.data.final_review_approved = e.detail.value;
            }}"
            >${translate('FINAL_PROGRESS_REPORT_AND_REVIEW_WAS_APPROVED')}</paper-checkbox
          >
        </div>

        ${this.renderActions(this.editMode, this.permissions?.edit?.final_review_approved)}
      </etools-content-panel>
    `;
  }

  @property({type: Object})
  permissions: any;

  stateChanged(state: RootState) {
    if (pageIsNotCurrentlyActive(get(state, 'app.routeDetails'), 'interventions', TABS.Progress, 'reports')) {
      return;
    }
    if (state.interventions.current) {
      // @ts-ignore
      const currData = {final_review_approved: state.interventions.current.final_review_approved};
      if (!isJsonStrMatch(this.originalData, currData)) {
        this.data = currData;
        this.originalData = cloneDeep(this.data);
      }

      this.setPermissions(state.interventions.current?.permissions);
    }
  }

  private setPermissions(permissions: any) {
    const currentPerm = {
      edit: {final_review_approved: permissions.edit.final_review_approved},
      view: {final_review_approved: permissions.view.final_review_approved}
    };
    if (!isJsonStrMatch(this.permissions, currentPerm)) {
      this.permissions = currentPerm;
    }
  }

  saveData() {
    return getStore()
      .dispatch<AsyncAction>(patchIntervention(this.data))
      .then(() => {
        this.editMode = false;
      });
  }
}
