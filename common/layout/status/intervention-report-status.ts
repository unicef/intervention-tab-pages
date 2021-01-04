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

  @property({type: String})
  status!: string;

  @property({type: Boolean})
  noLabel = false;

  @property({type: Boolean})
  noIcon = false;

  _statusType!: string;
  _label!: string;
  _icon!: string;

  set statusType(statusType: string) {
    this._statusType = statusType;
    this._computeStatusType(this.status);
  }

  @property({type: String})
  get statusType() {
    return this._statusType;
  }

  set label(label: string) {
    this._label = label;
    this._computeLabel(this.status, this.final, this.reportType);
  }

  @property({type: String})
  get label() {
    return this._label;
  }

  set icon(icon: string) {
    this._icon = icon;
    this._computeIcon(this._statusType);
  }

  @property({type: String})
  get icon() {
    return this._icon;
  }

  @property({type: Boolean})
  final = false;

  @property({type: String})
  reportType = '';

  _computeStatusType(status: null | undefined | string) {
    if (status === null || typeof status === 'undefined') {
      return 'no-status';
    }
    switch (status) {
      case '1':
      case 'Met':
      case 'OnT':
      case 'Com':
      case 'Acc':
        return 'success';
      case 'Sub':
        return 'submitted';
      case '2':
      case 'Ove':
      case 'Sen':
        return 'error';
      case '3':
      case 'Due':
      case 'NoP':
      case 'Ong':
        return 'neutral';
      case 'Rej':
      case 'Con':
      case 'Pla':
        return 'warning';
      case 'NoS':
        return 'no-status';
      default:
        return 'default';
    }
  }

  _computeLabel(status: string, final: boolean, reportType: string) {
    switch (status) {
      case '1':
        return 'Nothing due';
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
        return final ? 'Met results as planned' : 'Met';
      case 'OnT':
        return 'On Track';
      case 'NoP':
        return 'No Progress';
      case 'Con':
        return final ? 'Constrained (partially met result)' : 'Constrained';
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
        return reportType !== 'HR' ? 'Accepted' : 'Received';
      default:
        return 'No Status';
    }
  }

  _computeIcon(type: string) {
    switch (type) {
      case 'success':
        return 'icons:check-circle';
      case 'submitted':
        return 'icons:assignment-turned-in';
      case 'error':
      case 'warning':
        return 'icons:error';
      default:
        return 'image:lens';
    }
  }
}
