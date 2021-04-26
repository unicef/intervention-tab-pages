import {LitElement, html, property, customElement} from 'lit-element';
import '@polymer/iron-icons/iron-icons';
import {completedStatusIcon} from './status-icons';

export type EtoolsStatusItem = [string, string];

/**
 * @LitElement
 * @customElement
 */

@customElement('etools-status-lit')
export class EtoolsStatus extends LitElement {
  public render() {
    const activeStatusIndex: number = this.activeStatus
      ? this.statuses.findIndex(([status]: EtoolsStatusItem) => status === this.activeStatus)
      : 0;

    // language=HTML
    return html`
      <style>
        :host {
          display: flex;
          flex-direction: row;
          align-items: center;
          border-bottom: 1px solid var(--light-divider-color);
          border-top: 1px solid var(--light-divider-color);
          padding: 22px 14px 0;
          flex-wrap: wrap;
          background-color: var(--primary-background-color);
          margin-top: 4px;
          justify-content: center;
        }

        .status {
          display: flex;
          flex-direction: row;
          align-items: center;
          color: var(--secondary-text-color);
          font-size: 16px;
          margin-bottom: 22px;
        }

        .status:not(:last-of-type)::after {
          content: '';
          display: inline-block;
          vertical-align: middle;
          width: 40px;
          height: 1px;
          margin-right: 16px;
          margin-left: 24px;
          border-top: 1px solid var(--secondary-text-color);
        }

        .status .icon {
          display: inline-block;
          text-align: center;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          color: #fff;
          background-color: var(--secondary-text-color);
          margin-right: 8px;
          margin-left: 8px;
          font-size: 14px;
          line-height: 24px;
        }

        .status.active .icon {
          background-color: var(--primary-color);
        }

        .status.completed .icon {
          background-color: var(--success-color);
          fill: #ffffff;
        }
      </style>
      ${this.statuses.map((item: any, index: number) => this.getStatusHtml(item, index, activeStatusIndex))}
    `;
  }

  @property({type: String})
  activeStatus!: string;

  @property({type: Array})
  statuses: EtoolsStatusItem[] = [];

  @property({type: Number})
  interventionId!: number;

  getStatusHtml(item: EtoolsStatusItem, index: number, activeStatusIndex: number) {
    const completed = this.isCompleted(index, activeStatusIndex);
    // if status is terminated..we do not show active, and reverse
    // @lajos: this should be refactored to something better
    if (this.activeStatus == 'terminated') {
      if (this.statuses.length - 1 == index) {
        // special icon for terminated status
        return html`
          <div class="status ${this.getStatusClasses(index, activeStatusIndex)}">
            <iron-icon class="custom-icon" style="color: #ea4022" icon="report-problem"> </iron-icon>
            <span class="label">${item[1]}</span>
          </div>
        `;
      }
    }

    return html`
      <div class="status ${this.getStatusClasses(index, activeStatusIndex)}">
        <span class="icon"> ${completed ? html`${completedStatusIcon}` : html`${this.getBaseOneIndex(index)}`} </span>
        <span class="label">${item[1]}</span>
      </div>
    `;
  }

  /**
   * Get status icon or icon placeholder
   * @param index
   */
  getBaseOneIndex(index: number): number | string {
    return index + 1;
  }

  isCompleted(index: number, activeStatusIndex: number): boolean {
    return index < activeStatusIndex || activeStatusIndex === this.statuses.length - 1;
  }

  getStatusClasses(index: number, activeStatusIndex: number): string {
    const classes: string[] = [];
    if (index === activeStatusIndex) {
      classes.push('active');
    }
    if (this.isCompleted(index, activeStatusIndex)) {
      classes.push('completed');
    }
    return classes.join(' ');
  }
}
