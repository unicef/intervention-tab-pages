import {LitElement, html, TemplateResult, CSSResultArray, css, customElement, property} from 'lit-element';
import {ResultStructureStyles} from './results-structure.styles';
import {gridLayoutStylesLit} from '../../common/styles/grid-layout-styles-lit';
import '@polymer/iron-icons';
import './modals/activity-dialog/activity-data-dialog';
import {InterventionActivity, InterventionQuarter} from '../../common/models/intervention.types';
import {openDialog} from '../../utils/dialog';

@customElement('pd-activities')
export class PdActivities extends LitElement {
  static get styles(): CSSResultArray {
    // language=CSS
    return [
      gridLayoutStylesLit,
      ResultStructureStyles,
      css`
        :host {
          --green-background: #c4d7c6;
          --green-background-dark: #b3c6b5;
          display: block;
          background: var(--green-background);
        }
        .details-container.full {
          width: 70%;
        }
      `
    ];
  }

  @property({type: Array}) activities: InterventionActivity[] = [];
  interventionId!: number;
  pdOutputId!: number;
  quarters!: InterventionQuarter[];

  protected render(): TemplateResult {
    // language=HTML
    return html`
      <style>
        etools-data-table-row {
          --list-bg-color: var(--green-background);
          --list-second-bg-color: var(--green-background);
          --list-row-collapse-wrapper: {
            padding: 0 !important;
            background-color: var(--green-background-dark);
            border-top: 1px solid var(--main-border-color);
          }
          --list-row-wrapper: {
            background-color: var(--green-background) !important;
            min-height: 55px;
            border: 1px solid var(--main-border-color) !important;
            border-bottom: none !important;
          }
        }
        .editable-row .hover-block {
          background-color: var(--green-background) !important;
        }
      </style>

      <div class="row-h align-items-center header">
        <div class="heading flex-auto">
          PD Activities
          <iron-icon icon="add-box" @click="${() => this.openDialog()}"></iron-icon>
        </div>
        <div class="heading number-data flex-none">CSO Cache</div>
        <div class="heading number-data flex-none">UNICEF Cache</div>
        <div class="heading number-data flex-none">Total</div>
        <div class="heading number-data flex-none">%Partner</div>
      </div>

      ${this.activities.map(
        (activity: InterventionActivity) => html`
          <etools-data-table-row>
            <div slot="row-data" class="layout-horizontal editable-row fixed-height">
              <!--    PD Activity name    -->
              <div class="text flex-auto">
                ${activity.name || '-'}
              </div>

              <!--    CSO Cache    -->
              <div class="text number-data flex-none">
                ${this.formatCurrency(activity.cso_cash || 0)}
              </div>

              <!--    UNICEF Cache    -->
              <div class="text number-data flex-none">
                ${this.formatCurrency(activity.unicef_cash || 0)}
              </div>

              <!--    Total    -->
              <div class="text number-data flex-none">
                <!--       TODO: use field from backend         -->
                ${this.formatCurrency(this.getTotal(activity.cso_cash, activity.unicef_cash))}
              </div>

              <!--    %Partner    -->
              <div class="text number-data flex-none">
                <!--       TODO: use field from backend         -->
                ${this.getPartnerPercent(activity.cso_cash, activity.unicef_cash)}
              </div>

              <div class="hover-block">
                <paper-icon-button icon="icons:create" @tap="${() => this.openDialog(activity)}"></paper-icon-button>
              </div>
            </div>

            <!--    Indicator row collapsible Details    -->
            <div slot="row-data-details" class="row-h">
              <!--    Locations    -->
              <div class="details-container">
                <div class="text details-heading">Time periods</div>
                <div class="details-text">
                  <b>${activity.time_frames.map(({name}: InterventionQuarter) => name).join(', ') || '-'}</b>
                </div>
              </div>

              <!--    Section and Cluster    -->
              <div class="details-container full">
                <div class="text details-heading">Other comments</div>
                <div class="details-text">${activity.context_details || '-'}</div>
              </div>
            </div>
          </etools-data-table-row>
        `
      )}
      ${!this.activities.length
        ? html`
            <div class="layout-horizontal empty-row">
              <div class="text flex-auto">-</div>
              <div class="text number-data flex-none">-</div>
              <div class="text number-data flex-none">-</div>
              <div class="text number-data flex-none">-</div>
              <div class="text number-data flex-none">-</div>
            </div>
          `
        : ''}
    `;
  }

  formatCurrency(value: string | number): string {
    return String(value).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
  }

  getTotal(partner: string, unicef: string): number {
    return (Number(partner) || 0) + (Number(unicef) || 0);
  }

  getPartnerPercent(partner: string, unicef: string): string {
    if (!partner) {
      return '%0';
    }
    const total: number = this.getTotal(partner, unicef);
    const percent: number = Number(partner) / (total / 100);
    return `%${Number(percent.toFixed(2))}`;
  }

  openDialog(activity?: InterventionActivity): void {
    openDialog<any>({
      dialog: 'activity-data-dialog',
      dialogData: {
        activityId: activity && activity.id,
        interventionId: this.interventionId,
        pdOutputId: this.pdOutputId,
        quarters: this.quarters
      }
    });
  }
}
