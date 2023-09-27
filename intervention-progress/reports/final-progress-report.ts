import ComponentBaseMixin from '@unicef-polymer/etools-modules-common/dist/mixins/component-base-mixin';
import {html, LitElement} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import '@unicef-polymer/etools-unicef/src/etools-content-panel/etools-content-panel';
import {translate} from 'lit-translate';
import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';
import '@shoelace-style/shoelace/dist/components/checkbox/checkbox.js';
import {gridLayoutStylesLit} from '@unicef-polymer/etools-modules-common/dist/styles/grid-layout-styles-lit';
import {EtoolsRouter} from '@unicef-polymer/etools-utils/dist/singleton/router';
import get from 'lodash-es/get';
import {RootState} from '../../common/types/store.types';
import {TABS} from '../../common/constants';
import {cloneDeep} from '@unicef-polymer/etools-utils/dist/general.util';
import {isJsonStrMatch} from '@unicef-polymer/etools-utils/dist/equality-comparisons.util';
import {getStore} from '@unicef-polymer/etools-utils/dist/store.util';
import {AsyncAction} from '@unicef-polymer/etools-types';
import {patchIntervention} from '../../common/actions/interventions';
import {connectStore} from '@unicef-polymer/etools-modules-common/dist/mixins/connect-store-mixin';
import {buttonsStyles} from '@unicef-polymer/etools-modules-common/dist/styles/button-styles';

/** Visible only when PD is in status Ended */
@customElement('final-progress-report')
export class IndicatorReportTarget extends connectStore(ComponentBaseMixin(LitElement)) {
  static get styles() {
    return [gridLayoutStylesLit];
  }
  render() {
    return html`
      <style>
        ${sharedStyles} ${buttonsStyles} .padding {
          padding: 35px 24px;
        }
        sl-checkbox[disabled]::part(base) {
          opacity: 1;
        }
        sl-checkbox[disabled]::part(control) {
          opacity: 0.5;
        }
        sl-checkbox[disabled]::part(control--checked) {
          opacity: 0.5;
        }
      </style>
      <etools-content-panel
        show-expand-btn
        panel-title="${translate('FINAL_PROGRESS_REPORT')}"
        ?hidden="${!this.permissions?.view?.final_review_approved}"
      >
        <div slot="panel-btns">${this.renderEditBtn(this.editMode, this.permissions?.edit?.final_review_approved)}</div>

        <div class="padding">
          <sl-checkbox
            ?checked="${this.data.final_review_approved}"
            ?disabled="${this.isReadonly(this.editMode, this.permissions?.edit.final_review_approved)}"
            @sl-change="${(e: any) => this.valueChanged({value: e.target.checked}, 'final_review_approved')}"
            >${translate('FINAL_PROGRESS_REPORT_AND_REVIEW_WAS_APPROVED')}</sl-checkbox
          >
        </div>

        ${this.renderActions(this.editMode, this.permissions?.edit?.final_review_approved)}
      </etools-content-panel>
    `;
  }

  @property({type: Object})
  permissions: any;

  stateChanged(state: RootState) {
    if (
      EtoolsRouter.pageIsNotCurrentlyActive(get(state, 'app.routeDetails'), 'interventions', TABS.Progress, 'reports')
    ) {
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
