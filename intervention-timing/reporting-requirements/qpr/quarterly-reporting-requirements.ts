import {LitElement, html, property, customElement} from 'lit-element';
import ReportingRequirementsCommonMixin from '../mixins/reporting-requirements-common-mixin';
import CONSTANTS from '../../../common/constants';
import GenerateQuarterlyReportingRequirementsMixin from '../mixins/generate-quarterly-reporting-requirements-mixin';

import '@polymer/paper-button/paper-button.js';
import {fireEvent} from '../../../utils/fire-custom-event';

import './edit-qpr-dialog';
import './qpr-list';
import {EditQprDialogEl} from './edit-qpr-dialog';
import {gridLayoutStylesLit} from '../../../common/styles/grid-layout-styles-lit';

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
    return [gridLayoutStylesLit];
  }
  render() {
    return html`
      <style>
        *[hidden] {
          display: none !important;
        }
      </style>

      <div class="flex-c" ?hidden="${this._empty(this.reportingRequirements)}">
        <qpr-list .qprData="${this.reportingRequirements}" .paperButtons></qpr-list>
      </div>

      <div ?hidden="${!this._empty(this.reportingRequirements)}">
        <div class="row-h">There are no quarterly reporting requirements set.</div>
        <div class="row-h" ?hidden="${!this.editMode}">
          <paper-button class="secondary-btn" @click="${this.openQuarterlyRepRequirementsDialog}">
            Add Requirements
          </paper-button>
        </div>
      </div>
    `;
  }

  @property({type: String})
  interventionStart!: string;

  @property({type: String})
  interventionEnd!: string;

  @property({type: Object})
  editQprDialog!: EditQprDialogEl;

  @property({type: Boolean})
  editMode!: boolean;

  @property() dialogOpened = true;

  connectedCallback() {
    super.connectedCallback();
    this._createEditQprDialog();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._removeEditQprDialog();
  }

  _createEditQprDialog() {
    if (this.reportingRequirements) {
      this.editQprDialog = document.createElement('edit-qpr-dialog') as EditQprDialogEl;
      this._onReportingRequirementsSaved = this._onReportingRequirementsSaved.bind(this);
      this.editQprDialog.addEventListener('reporting-requirements-saved', this._onReportingRequirementsSaved as any);
      document.querySelector('body')!.appendChild(this.editQprDialog);
    }
  }

  _removeEditQprDialog() {
    if (this.editQprDialog) {
      this.editQprDialog.removeEventListener('reporting-requirements-saved', this._onReportingRequirementsSaved as any);
      document.querySelector('body')!.removeChild(this.editQprDialog);
    }
  }

  openQuarterlyRepRequirementsDialog() {
    if (!this.interventionStart || !this.interventionEnd) {
      fireEvent(this, 'toast', {
        text: 'You have to fill PD Start Date and End Date first!',
        showCloseBtn: true
      });
      return;
    }
    let qprData: [];
    if (this.requirementsCount === 0) {
      qprData = this.generateQPRData(this.interventionStart, this.interventionEnd);
    } else {
      qprData = JSON.parse(JSON.stringify(this.reportingRequirements));
    }
    this.editQprDialog.qprData = qprData;
    this.editQprDialog.interventionId = this.interventionId;
    this.editQprDialog.openQprDialog();
  }

  _getReportType() {
    return CONSTANTS.REQUIREMENTS_REPORT_TYPE.QPR;
  }
}

export {QuarterlyReportingRequirements as QuarterlyReportingRequirementsEL};
