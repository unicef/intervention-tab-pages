import {customElement, LitElement, property, html} from 'lit-element';
import '@polymer/iron-icons/iron-icons.js';
import '@polymer/iron-icons/image-icons.js';

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

        iron-icon {
          --iron-icon-width: 16px;
          --iron-icon-height: 16px;
          padding-right: 4px;
          margin-top: -2px;
        }

        iron-icon[status-type='default'] {
          color: var(--primary-color);
        }

        iron-icon[status-type='submitted'],
        iron-icon[status-type='success'] {
          color: var(--success-color);
        }

        iron-icon[status-type='no-status'],
        iron-icon[status-type='error'] {
          color: var(--dark-error-color);
        }

        iron-icon[status-type='neutral'] {
          color: var(--secondary-text-color);
        }

        iron-icon[status-type='warning'] {
          color: var(--warning-color);
        }

        #label {
          color: var(--primary-text-color);
        }
      </style>

      <iron-icon ?hidden="${this.noIcon}" status-type="${this.statusType}" .icon="${this.icon}"></iron-icon>
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
    this.label = label;
  }

  _computeIcon(type: string) {
    switch (type) {
      case 'success':
        return (this.icon = 'icons:check-circle');
      case 'submitted':
        return (this.icon = 'icons:assignment-turned-in');
      case 'error':
      case 'warning':
        return (this.icon = 'icons:error');
      default:
        return (this.icon = 'image:lens');
    }
  }
}
