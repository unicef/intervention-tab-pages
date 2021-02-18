import {LitElement, html, property, customElement} from 'lit-element';
import ReportingRequirementsCommonMixin from '../mixins/reporting-requirements-common-mixin';
import CONSTANTS from '../../../common/constants';
import GenerateQuarterlyReportingRequirementsMixin from '../mixins/generate-quarterly-reporting-requirements-mixin';

import '@polymer/paper-button/paper-button.js';
import {fireEvent} from '../../../utils/fire-custom-event';

import './edit-qpr-dialog';
import './qpr-list';
import {gridLayoutStylesLit} from '../../../common/styles/grid-layout-styles-lit';
import {buttonsStyles} from '../../../common/styles/button-styles';
import {translate, get as getTranslation} from 'lit-translate';
import {sharedStyles} from '../../../common/styles/shared-styles-lit';
import {openDialog} from '../../../utils/dialog';

/**
 * @polymer
 * @customElement
 * @mixinFunction
 * @appliesMixin ReportingRequirementsCommonMixin
 * @appliesMixin GenerateQuarterlyReportingRequirementsMixin
 */

@customElement('quarterly-reporting-requirements')
export class QuarterlyReportingRequirements extends GenerateQuarterlyReportingRequirementsMixin(
  ReportingRequirementsCommonMixin(LitElement)
) {
  static get styles() {
    return [gridLayoutStylesLit, buttonsStyles];
  }
  render() {
    return html`
      <style>
        ${sharedStyles} *[hidden] {
          display: none !important;
        }
      </style>

      <div class="flex-c" ?hidden="${this._empty(this.reportingRequirements)}">
        <qpr-list .qprData="${this.reportingRequirements}"></qpr-list>
      </div>

      <div ?hidden="${!this._empty(this.reportingRequirements)}">
        <div class="row-h">
          ${translate('INTERVENTION_TIMING.PARTNER_REPORTING_REQUIREMENTS.NO_QUARTERLY_REPORTING_REQUIREMENTS')}
        </div>
        <div class="row-h" ?hidden="${!this.editMode}">
          <paper-button class="secondary-btn" @click="${this.openQuarterlyRepRequirementsDialog}">
            ${translate('INTERVENTION_TIMING.PARTNER_REPORTING_REQUIREMENTS.ADD_REQUIREMENTS')}
          </paper-button>
        </div>
      </div>
    `;
  }

  @property({type: String})
  interventionStart!: string;

  @property({type: String})
  interventionEnd!: string;

  @property({type: Boolean})
  editMode!: boolean;

  @property() dialogOpened = true;

  openQuarterlyRepRequirementsDialog() {
    if (!this.interventionStart || !this.interventionEnd) {
      fireEvent(this, 'toast', {
        text: getTranslation('INTERVENTION_TIMING.PARTNER_REPORTING_REQUIREMENTS.QUARTERLY_REPORT_PROMPT'),
        showCloseBtn: true
      });
      return;
    }
    let qprData: any[];
    if (this.requirementsCount === 0) {
      qprData = this.generateQPRData(this.interventionStart, this.interventionEnd);
    } else {
      qprData = JSON.parse(JSON.stringify(this.reportingRequirements));
    }

    openDialog({
      dialog: 'edit-qpr-dialog',
      dialogData: {
        qprData: qprData,
        interventionId: this.interventionId
      }
    }).then(({confirmed, response}) => {
      if (!confirmed || !response) {
        return;
      }
      this._onReportingRequirementsSaved(response);
    });
  }

  _getReportType() {
    return CONSTANTS.REQUIREMENTS_REPORT_TYPE.QPR;
  }

  _sortRequirementsAsc() {
    this.reportingRequirements.sort((a: string, b: string) => {
      // @ts-ignore
      return new Date(a.due_date) - new Date(b.due_date);
    });
  }
}

export {QuarterlyReportingRequirements as QuarterlyReportingRequirementsEL};
