import {LitElement, html, TemplateResult, CSSResultArray, css, customElement, property} from 'lit-element';
import {ResultStructureStyles} from './results-structure.styles';
import {gridLayoutStylesLit} from '../../common/styles/grid-layout-styles-lit';
import '@polymer/iron-icons';
import './modals/activity-dialog/activity-data-dialog';
import {openDialog} from '../../utils/dialog';
import {sharedStyles} from '../../common/styles/shared-styles-lit';
import {sendRequest} from '@unicef-polymer/etools-ajax';
import {getStore} from '../../utils/redux-store-access';
import {getIntervention} from '../../common/interventions';
import {fireEvent} from '../../utils/fire-custom-event';
import {formatServerErrorAsText} from '@unicef-polymer/etools-ajax/ajax-error-parser';
import {interventionEndpoints} from '../../utils/intervention-endpoints';
import {getEndpoint} from '../../utils/endpoint-helper';
import {CommentElementMeta, CommentsMixin} from '../../common/components/comments/comments-mixin';
import {AsyncAction, InterventionActivity, InterventionQuarter} from '@unicef-polymer/etools-types';

@customElement('pd-activities')
export class PdActivities extends CommentsMixin(LitElement) {
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

  @property({type: Array})
  activities: InterventionActivity[] = [];

  @property({type: Boolean})
  readonly!: boolean;

  interventionId!: number;
  pdOutputId!: number;
  quarters!: InterventionQuarter[];

  protected render(): TemplateResult {
    // language=HTML
    return html`
      <style>
        ${sharedStyles} etools-data-table-row {
          --list-bg-color: var(--green-background);
          --list-row-collapse-wrapper: {
            padding: 0 !important;
            background-color: var(--green-background-dark);
            border-top: 1px solid var(--main-border-color);
          }
          --list-row-wrapper: {
            background-color: var(--green-background);
            min-height: 55px;
            border: 1px solid var(--main-border-color) !important;
            border-bottom: none !important;
          }
          --icon-wrapper: {
            padding: 0px 0px !important;
            margin-right: 16px !important;
          }
        }
        .editable-row .hover-block {
          background-color: rgb(199, 212, 200);
        }
        etools-data-table-row:last-child {
          --list-row-wrapper: {
            background-color: var(--green-background);
            min-height: 55px;
            border: 1px solid var(--main-border-color) !important;
            border-bottom: 1px solid var(--main-border-color) !important;
          }
        }
      </style>

      <div class="row-h align-items-center header">
        <div class="heading flex-auto">
          PD Activities
          <iron-icon icon="add-box" @click="${() => this.openDialog()}" ?hidden="${this.readonly}"></iron-icon>
        </div>
        <div class="heading number-data flex-none">CSO Cash</div>
        <div class="heading number-data flex-none">UNICEF Cash</div>
        <div class="heading number-data flex-none">Total</div>
        <div class="heading number-data flex-none">%Partner</div>
      </div>

      ${this.activities.map(
        (activity: InterventionActivity) => html`
          <etools-data-table-row
            secondary-bg-on-hover
            related-to="activity-${activity.id}"
            related-to-description=" Activity - ${activity.name}"
            comments-container
          >
            <div slot="row-data" class="layout-horizontal editable-row">
              <!--    PD Activity name    -->
              <div class="text flex-auto">${activity.name || '-'}</div>

              <!--    CSO Cash    -->
              <div class="text number-data flex-none">${this.formatCurrency(activity.cso_cash || 0)}</div>

              <!--    UNICEF Cash    -->
              <div class="text number-data flex-none">${this.formatCurrency(activity.unicef_cash || 0)}</div>

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
                <paper-icon-button
                  icon="icons:create"
                  @click="${() => this.openDialog(activity, false)}"
                  ?hidden="${this.readonly}"
                ></paper-icon-button>
                <paper-icon-button
                  icon="icons:visibility"
                  @click="${() => this.openDialog(activity, true)}"
                  ?hidden="${!this.readonly}"
                ></paper-icon-button>
                <paper-icon-button
                  icon="icons:delete"
                  ?hidden="${this.readonly}"
                  @click="${() => this.openDeleteDialog(String(activity.id))}"
                ></paper-icon-button>
              </div>
            </div>

            <!--    Indicator row collapsible Details    -->
            <div slot="row-data-details" class="row-h">
              <!--    Locations    -->
              <div class="details-container">
                <div class="text details-heading">Time Periods</div>
                <div class="details-text">
                  <b>${this.getQuartersNames(activity.time_frames)}</b>
                </div>
              </div>

              <!--    Section and Cluster    -->
              <div class="details-container full">
                <div class="text details-heading">Other Notes</div>
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

  getSpecialElements(container: HTMLElement): CommentElementMeta[] {
    const element: HTMLElement = container.shadowRoot!.querySelector('#wrapper') as HTMLElement;
    const relatedTo: string = container.getAttribute('related-to') as string;
    const relatedToDescription = container.getAttribute('related-to-description') as string;
    return [{element, relatedTo, relatedToDescription}];
  }

  formatCurrency(value: string | number): string {
    return String(value).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
  }

  getTotal(partner: string, unicef: string): number {
    return (Number(partner) || 0) + (Number(unicef) || 0);
  }

  getPartnerPercent(partner: string, unicef: string): string {
    if (!Number(partner)) {
      return '0 %';
    }
    const total: number = this.getTotal(partner, unicef);
    const percent: number = Number(partner) / (total / 100);
    return `${Number(percent.toFixed(2))} %`;
  }

  openDialog(activity?: InterventionActivity, readonly?: boolean): void {
    openDialog<any>({
      dialog: 'activity-data-dialog',
      dialogData: {
        activityId: activity && activity.id,
        interventionId: this.interventionId,
        pdOutputId: this.pdOutputId,
        quarters: this.quarters,
        readonly: readonly
      }
    });
  }

  async openDeleteDialog(activityId: string) {
    const confirmed = await openDialog({
      dialog: 'are-you-sure',
      dialogData: {
        content: 'Are you sure you want to delete this activity?',
        confirmBtnText: 'Delete'
      }
    }).then(({confirmed}) => {
      return confirmed;
    });

    if (confirmed) {
      this.deleteActivity(activityId);
    }
  }

  deleteActivity(activityId: string) {
    const endpoint = getEndpoint(interventionEndpoints.pdActivityDetails, {
      activityId: activityId,
      interventionId: this.interventionId,
      pdOutputId: this.pdOutputId
    });
    sendRequest({
      method: 'DELETE',
      endpoint: endpoint
    })
      .then(() => {
        getStore().dispatch<AsyncAction>(getIntervention());
      })
      .catch((err: any) => {
        fireEvent(this, 'toast', {text: formatServerErrorAsText(err)});
      });
  }

  getQuartersNames(selectedTimeFrames: number[]): string {
    return (
      selectedTimeFrames
        .map((timeFrameId: number) => this.quarters.find(({id}: InterventionQuarter) => id === timeFrameId)?.name)
        .join(', ') || '-'
    );
  }
}
