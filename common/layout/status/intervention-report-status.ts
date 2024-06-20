import {LitElement, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import '@unicef-polymer/etools-unicef/src/etools-icons/etools-icon';
import {getTranslatedValue} from '@unicef-polymer/etools-modules-common/dist/utils/language';
import {listenForLangChanged} from 'lit-translate';

/**
 * @customElement
 */
@customElement('intervention-report-status')
export class InterventionReportStatus extends LitElement {
  render() {
    return html`
      <style>
        :host {
          display: inline-block;
        }

        etools-icon {
          --etools-icon-font-size: var(--etools-font-size-16, 16px);
          padding-inline-end: 4px;
          margin-top: -2px;
        }

        etools-icon[status-type='default'] {
          color: var(--primary-color);
        }

        etools-icon[status-type='submitted'],
        etools-icon[status-type='success'] {
          color: var(--success-color);
        }

        etools-icon[status-type='no-status'],
        etools-icon[status-type='error'] {
          color: var(--dark-error-color);
        }

        etools-icon[status-type='neutral'] {
          color: var(--secondary-text-color);
        }

        etools-icon[status-type='warning'] {
          color: var(--warning-color);
        }

        #label {
          color: var(--primary-text-color);
        }
      </style>

      <etools-icon ?hidden="${this.noIcon}" status-type="${this.statusType}" .name="${this.icon}"></etools-icon>
      <span id="label" ?hidden="${this.noLabel}">${this.label}</span>
      <slot></slot>
    `;
  }

  @property({type: Boolean})
  noLabel = false;

  @property({type: Boolean})
  noIcon = false;

  @property({type: String})
  icon!: string;

  @property({type: String})
  label!: string;

  _status!: string;
  _statusType!: string;
  _final = false;
  _reportType!: string;

  set status(status: string) {
    this._status = status;
    this._computeStatusType(this.status);
    this._computeLabel(this.status, this.final, this.reportType);
  }

  @property({type: String})
  get status() {
    return this._status;
  }

  set statusType(statusType: string) {
    this._statusType = statusType;
    this._computeIcon(this.statusType);
  }

  @property({type: String})
  get statusType() {
    return this._statusType;
  }

  set final(final: boolean) {
    this._final = final;
    this._computeLabel(this.status, this.final, this.reportType);
  }

  @property({type: Boolean})
  get final() {
    return this._final;
  }

  set reportType(reportType: string) {
    this._reportType = reportType;
    this._computeLabel(this.status, this.final, this.reportType);
  }

  @property({type: String})
  get reportType() {
    return this._reportType;
  }

  constructor() {
    super();
    listenForLangChanged(() => {
      this._computeLabel(this.status, this.final, this.reportType);
    });
  }

  _computeStatusType(status: null | undefined | string) {
    if (status === null || typeof status === 'undefined') {
      this.statusType = 'no-status';
      return;
    }
    let stat = '';
    switch (status) {
      case '1':
      case 'Met':
      case 'OnT':
      case 'Com':
      case 'Acc':
        stat = 'success';
        break;
      case 'Sub':
        stat = 'submitted';
        break;
      case '2':
      case 'Ove':
      case 'Sen':
        stat = 'error';
        break;
      case '3':
      case 'Due':
      case 'NoP':
      case 'Ong':
        stat = 'neutral';
        break;
      case 'Rej':
      case 'Con':
      case 'Pla':
        stat = 'warning';
        break;
      case 'NoS':
        stat = 'no-status';
        break;
      default:
        stat = 'default';
    }
    this.statusType = stat;
  }

  _computeLabel(status: string, final: boolean, reportType: string) {
    let label = '';
    switch (status) {
      case '1':
        label = 'Nothing due';
        break;
      case '2':
      case 'Ove':
        label = 'Overdue';
        break;
      case '3':
      case 'Due':
        label = 'Due';
        break;
      case 'Sub':
        label = 'Submitted';
        break;
      case 'Rej':
        label = 'Rejected';
        break;
      case 'Met':
        label = final ? 'Met results as planned' : 'Met';
        break;
      case 'OnT':
        label = 'On Track';
        break;
      case 'NoP':
        label = 'No Progress';
        break;
      case 'Con':
        label = final ? 'Constrained (partially met result)' : 'Constrained';
        break;
      case 'Ong':
        label = 'Ongoing';
        break;
      case 'Pla':
        label = 'Planned';
        break;
      case 'Com':
        label = 'Completed';
        break;
      case 'NoS':
        label = 'No Status';
        break;
      case 'Sen':
        label = 'Sent Back';
        break;
      case 'Acc':
        label = reportType !== 'HR' ? 'Accepted' : 'Received';
        break;
      default:
        label = 'No Status';
    }
    this.label = getTranslatedValue(label, 'PROGRESS_REPORT_STATUS');
  }

  _computeIcon(type: string) {
    switch (type) {
      case 'success':
        return (this.icon = 'check-circle');
      case 'submitted':
        return (this.icon = 'assignment-turned-in');
      case 'error':
      case 'warning':
        return (this.icon = 'error');
      default:
        return (this.icon = 'image:lens');
    }
  }
}
