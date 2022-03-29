import {LitElement, html, TemplateResult, CSSResultArray, css, customElement, property} from 'lit-element';
import {ResultStructureStyles} from './results-structure.styles';
import {gridLayoutStylesLit} from '@unicef-polymer/etools-modules-common/dist/styles/grid-layout-styles-lit';
import '@polymer/paper-icon-button/paper-icon-button';
import '@polymer/iron-icons';
import './modals/activity-dialog/activity-data-dialog';
import '../../intervention-workplan-editor/time-intervals/time-intervals';
import {openDialog} from '@unicef-polymer/etools-modules-common/dist/utils/dialog';
import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';
import {sendRequest} from '@unicef-polymer/etools-ajax';
import {getStore} from '@unicef-polymer/etools-modules-common/dist/utils/redux-store-access';
import {getIntervention} from '../../common/actions/interventions';
import {fireEvent} from '@unicef-polymer/etools-modules-common/dist/utils/fire-custom-event';
import {formatServerErrorAsText} from '@unicef-polymer/etools-ajax/ajax-error-parser';
import {interventionEndpoints} from '../../utils/intervention-endpoints';
import {getEndpoint} from '@unicef-polymer/etools-modules-common/dist/utils/endpoint-helper';
import {CommentElementMeta, CommentsMixin} from '../../common/components/comments/comments-mixin';
import {AsyncAction, InterventionActivity, InterventionQuarter} from '@unicef-polymer/etools-types';
import {translate} from 'lit-translate';
import {translatesMap} from '../../utils/intervention-labels-map';
import {displayCurrencyAmount} from '@unicef-polymer/etools-currency-amount-input/mixins/etools-currency-module';

@customElement('pd-activities')
export class PdActivities extends CommentsMixin(LitElement) {
  @property({type: String})
  currency = '';

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
      ${sharedStyles}
      <etools-data-table-row>
        <div slot="row-data" class="layout-horizontal align-items-center editable-row">
          <div class="title-text flex-auto">${translate(translatesMap.activities)} (${this.activities.length})</div>
        </div>
        <div slot="row-data-details">
          <div class="add-button" ?hidden="${this.readonly}" @click="${() => this.openDialog()}">
            <paper-icon-button slot="custom-icon" icon="add-box" tabindex="0"></paper-icon-button>
            <span class="no-wrap">${translate('ADD_PD_ACTIVITY')}</span>
          </div>

          <div class="table-row table-head align-items-center" ?hidden="${this.readonly}">
            <div>${translate('ACTIVITY_NAME')}</div>
            <div>${translate('TIME_PERIODS')}</div>
            <div>${translate('PARTNER_CASH')}</div>
            <div>${translate('UNICEF_CASH')}</div>
            <div>${translate('GENERAL.TOTAL')} (${this.currency})</div>
          </div>

          ${this.activities.length
            ? this.activities.map(
                (activity: InterventionActivity) => html`
                  <div
                    class="table-row"
                    related-to="activity-${activity.id}"
                    related-to-description=" Activity - ${activity.name}"
                    comments-container
                    @paper-dropdown-open="${(event: CustomEvent) =>
                      (event.currentTarget as HTMLElement)!.classList.add('active')}"
                    @paper-dropdown-close="${(event: CustomEvent) =>
                      (event.currentTarget as HTMLElement)!.classList.remove('active')}"
                  >
                    <!--    Activity Data: code / name / other info / items link    -->
                    <div class="activity-data">
                      <div><b>${activity.code}</b>&nbsp;${activity.name || '-'}</div>
                      <div class="details">${activity.context_details || '-'}</div>
                      <div
                        class="activity-item-link"
                        ?hidden="${!activity.items?.length}"
                        @click="${() => this.openDialog(activity, this.readonly)}"
                      >
                        (${activity.items?.length}) items
                      </div>
                    </div>

                    <!--    Time intervals    -->
                    <div>
                      <time-intervals
                        .quarters="${this.quarters}"
                        .selectedTimeFrames="${activity.time_frames}"
                        without-popup
                      ></time-intervals>
                    </div>

                    <!--    CSO Cash    -->
                    <div class="cache-data">${displayCurrencyAmount(String(activity.cso_cash || 0), '0', 2)}</div>

                    <!--    UNICEF Cash    -->
                    <div class="cache-data">${displayCurrencyAmount(String(activity.unicef_cash || 0), '0', 2)}</div>

                    <!--    Total    -->
                    <div class="cache-data">
                      <!--       TODO: use field from backend         -->
                      <b>
                        ${displayCurrencyAmount(String(this.getTotal(activity.cso_cash, activity.unicef_cash)), '0', 2)}
                      </b>
                    </div>

                    <div class="show-actions" ?hidden="${this.commentMode}">
                      <paper-menu-button id="view-menu-button" close-on-activate horizontal-align="right">
                        <paper-icon-button
                          slot="dropdown-trigger"
                          icon="icons:more-vert"
                          tabindex="0"
                        ></paper-icon-button>
                        <paper-listbox slot="dropdown-content">
                          <div class="action" @click="${() => this.openDialog(activity, this.readonly)}">
                            <iron-icon icon="${this.readonly ? 'visibility' : 'create'}"></iron-icon>
                            ${this.readonly ? 'View' : 'Edit'}
                          </div>
                          <div
                            class="action delete-action"
                            ?hidden="${this.readonly}"
                            @click="${() => this.openDeleteDialog(String(activity.id))}"
                          >
                            <iron-icon icon="delete"></iron-icon>
                            Delete
                          </div>
                        </paper-listbox>
                      </paper-menu-button>
                    </div>
                  </div>
                `
              )
            : html`
                <div class="table-row align-items-center">
                  ${this.readonly
                    ? translate('THERE_ARE_NO_PD_ACTIVITIES')
                    : html`
                        <div>-</div>
                        <div>-</div>
                        <div>-</div>
                        <div>-</div>
                        <div>-</div>
                      `}
                </div>
              `}
        </div>
      </etools-data-table-row>
    `;
  }

  firstUpdated(): void {
    super.firstUpdated();
  }

  getSpecialElements(element: HTMLElement): CommentElementMeta[] {
    const relatedTo: string = element.getAttribute('related-to') as string;
    const relatedToDescription = element.getAttribute('related-to-description') as string;
    return [{element, relatedTo, relatedToDescription}];
  }

  getTotal(partner: string, unicef: string): number {
    return (Number(partner) || 0) + (Number(unicef) || 0);
  }

  openDialog(activity?: InterventionActivity, readonly?: boolean): void {
    openDialog<any>({
      dialog: 'activity-data-dialog',
      dialogData: {
        activityId: activity && activity.id,
        interventionId: this.interventionId,
        pdOutputId: this.pdOutputId,
        quarters: this.quarters,
        readonly: readonly,
        currency: this.currency
      }
    });
  }

  async openDeleteDialog(activityId: string) {
    const confirmed = await openDialog({
      dialog: 'are-you-sure',
      dialogData: {
        content: translate('DELETE_ACTIVITY_PROMPT') as unknown as string,
        confirmBtnText: translate('GENERAL.DELETE') as unknown as string
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

  static get styles(): CSSResultArray {
    // language=CSS
    return [
      gridLayoutStylesLit,
      ResultStructureStyles,
      css`
        :host {
          --green-background: #c4d7c7;
          --green-background-dark: #b0c8b3;
          display: block;
          background: var(--green-background);
        }
        .details-container.full {
          width: 70%;
        }

        div[slot='row-data'] {
          min-height: 53px;
        }
        .title-text {
          font-size: 16px;
          font-weight: 500;
          line-height: 26px;
        }
        .table-row {
          display: flex;
          position: relative;
          gap: 10px;
          font-size: 16px;
          font-weight: 400;
          line-height: 26px;
          color: #212121;
          padding: 19px 40px 19px 24px !important;
        }
        .table-head {
          padding: 22px 40px 22px 24px !important;
          font-size: 16px;
          font-weight: 700;
          line-height: 16px;
          color: #5c5c5c;
        }
        .table-row > div:first-child {
          width: 40%;
          flex: none;
        }
        .table-row div:not(:first-child) {
          text-align: center;
          flex: 1;
          min-width: 0;
        }
        .activity-data div {
          text-align: left !important;
          font-size: 16px;
          font-weight: 400;
          line-height: 26px;
        }
        .activity-data .activity-item-link {
          margin-top: 7px;
          font-size: 16px;
          font-weight: 700;
          line-height: 26px;
          color: #2073b7;
          text-decoration: underline;
          cursor: pointer;
        }
        .table-row div.cache-data {
          display: flex;
          align-items: center;
          justify-content: flex-end;
        }
        .table-row:not(:last-child):not(.table-head):after {
          content: '';
          display: block;
          position: absolute;
          width: calc(100% - 14px);
          left: 7px;
          bottom: 0;
          height: 1px;
          background-color: #c4c4c4;
        }
        .show-actions {
          position: absolute;
          display: none;
          top: 0;
          right: 0;
        }
        .table-row.active .show-actions,
        .table-row:hover .show-actions {
          display: block;
        }
        .table-row.active,
        .table-row:not(.table-head):hover {
          background-color: var(--green-background-dark);
        }
        .action {
          display: flex;
          align-items: center;
          font-size: 16px;
          font-weight: 400;
          line-height: 19px;
          padding: 10px 14px;
          color: #000000;
          white-space: nowrap;
          text-align: left;
          cursor: pointer;
        }
        .action iron-icon {
          margin: 0 11px 0 0;
        }
        .action:hover {
          background-color: var(--secondary-background-color);
        }
        .delete-action {
          color: #e14f4f;
        }
        time-intervals {
          justify-content: center;
        }
        etools-data-table-row {
          --list-bg-color: var(--green-background);
        }

        etools-data-table-row::part(edt-list-row-collapse-wrapper) {
          padding: 0 !important;
          background-color: var(--green-background);
          border-top: 1px solid var(--main-border-color);
        }
        etools-data-table-row::part(edt-list-row-wrapper) {
          background-color: var(--green-background);
          min-height: 48px;
          border: 1px solid var(--main-border-color) !important;
          border-bottom: none !important;
        }
        etools-data-table-row::part(edt-icon-wrapper) {
          padding: 0 0 0 38px !important;
          margin-right: 16px !important;
        }

        .editable-row .hover-block {
          background-color: rgb(199, 212, 200);
        }

        etools-data-table-row::part(edt-list-row-wrapper):hover {
          background-color: #c4d7c7;
        }
      `
    ];
  }
}
