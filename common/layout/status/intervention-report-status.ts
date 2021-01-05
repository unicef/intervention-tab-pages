import {customElement, LitElement, property, html} from 'lit-element';
import '@polymer/iron-flex-layout/iron-flex-layout.js';
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

        :host([status-type='default']) iron-icon {
          color: var(--primary-color);
        }

        :host([status-type='submitted']) iron-icon,
        :host([status-type='success']) iron-icon {
          color: var(--success-color);
        }

        :host([status-type='no-status']) iron-icon,
        :host([status-type='error']) iron-icon {
          color: var(--dark-error-color);
        }

        :host([status-type='neutral']) iron-icon {
          color: var(--secondary-text-color);
        }

        :host([status-type='warning']) iron-icon {
          color: var(--warning-color);
        }

        #label {
          color: var(--primary-text-color);
        }
      </style>

      <iron-icon ?hidden="${this.noIcon}" .icon="${this.icon}"></iron-icon>
      <span id="label" ?hidden="${this.noLabel}">${this.label}</span>
      <slot></slot>
    `;
  }

  @property({type: Boolean})
  noLabel = false;

  @property({type: Boolean})
  noIcon = false;

  label!: string;
  _icon!: string;
  _status!: string;
  _statusType!: string;
  _final = false;
  _reportType!: string;

  set status(status: string) {
    this._status = status;
    this._computeStatusType(this._status);
    this._computeLabel(this._status, this._final, this._reportType);
  }

  @property({type: String})
  get status() {
    return this._status;
  }

  set statusType(statusType: string) {
    this._statusType = statusType;
    this._computeIcon(this._statusType);
  }

  @property({type: String})
  get statusType() {
    return this._statusType;
  }

  set icon(icon: string) {
    this._icon = icon;
    this._computeIcon(this.statusType);
  }

  @property({type: String})
  get icon() {
    return this._icon;
  }

  set final(final: boolean) {
    this._final = final;
    this._computeLabel(this._status, this._final, this._reportType);
  }

  @property({type: Boolean})
  get final() {
    return this._final;
  }

  set reportType(reportType: string) {
    this._reportType = reportType;
    this._computeLabel(this._status, this._final, this._reportType);
  }

  @property({type: String})
  get reportType() {
    return this._reportType;
  }

  _computeStatusType(status: null | undefined | string) {
    if (status === null || typeof status === 'undefined') {
      this._statusType = 'no-status';
    }
    switch (status) {
      case '1':
      case 'Met':
      case 'OnT':
      case 'Com':
      case 'Acc':
        return (this._statusType = 'success');
      case 'Sub':
        return (this._statusType = 'submitted');
      case '2':
      case 'Ove':
      case 'Sen':
        return (this._statusType = 'error');
      case '3':
      case 'Due':
      case 'NoP':
      case 'Ong':
        return (this._statusType = 'neutral');
      case 'Rej':
      case 'Con':
      case 'Pla':
        return (this._statusType = 'warning');
      case 'NoS':
        return (this._statusType = 'no-status');
      default:
        return (this._statusType = 'default');
    }
  }

  _computeLabel(status: string, final: boolean, reportType: string) {
    switch (status) {
      case '1':
        return (this.label = 'Nothing due');
      case '2':
      case 'Ove':
        return 'Overdue';
      case '3':
      case 'Due':
        return 'Due';
      case 'Sub':
        return 'Submitted';
      case 'Rej':
        return 'Rejected';
      case 'Met':
        return (this.label = final ? 'Met results as planned' : 'Met');
      case 'OnT':
        return 'On Track';
      case 'NoP':
        return 'No Progress';
      case 'Con':
        return (this.label = final ? 'Constrained (partially met result)' : 'Constrained');
      case 'Ong':
        return 'Ongoing';
      case 'Pla':
        return 'Planned';
      case 'Com':
        return 'Completed';
      case 'NoS':
        return 'No Status';
      case 'Sen':
        return 'Sent Back';
      case 'Acc':
        return (this.label = reportType !== 'HR' ? 'Accepted' : 'Received');
      default:
        return 'No Status';
    }
  }

  _computeIcon(type: string) {
    switch (type) {
      case 'success':
        return (this._icon = 'icons:check-circle');
      case 'submitted':
        return (this._icon = 'icons:assignment-turned-in');
      case 'error':
      case 'warning':
        return (this._icon = 'icons:error');
      default:
        return (this._icon = 'image:lens');
    }
  }
}
