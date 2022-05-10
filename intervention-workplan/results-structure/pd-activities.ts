import {LitElement, html, TemplateResult, CSSResultArray, css, customElement, property} from 'lit-element';
import {ResultStructureStyles} from './styles/results-structure.styles';
import {gridLayoutStylesLit} from '@unicef-polymer/etools-modules-common/dist/styles/grid-layout-styles-lit';
import '@polymer/paper-icon-button/paper-icon-button';
import '@polymer/iron-icons';
import '@unicef-polymer/etools-info-tooltip/etools-info-tooltip';
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
import {ActivitiesAndIndicatorsStyles} from './styles/ativities-and-indicators.styles';
import {EtoolsDataTableRow} from '@unicef-polymer/etools-data-table/etools-data-table-row';
import {TruncateMixin} from '../../common/truncate.mixin';

@customElement('pd-activities')
export class PdActivities extends CommentsMixin(TruncateMixin(LitElement)) {
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
      <etools-data-table-row .detailsOpened="${true}">
        <div slot="row-data" class="layout-horizontal align-items-center editable-row start-justified">
          <div class="title-text">${translate(translatesMap.activities)} (${this.activities.length})</div>
          <etools-info-tooltip position="top" custom-icon ?hide-tooltip="${this.readonly}" offset="0">
            <paper-icon-button
              icon="add-box"
              slot="custom-icon"
              class="add"
              tabindex="0"
              @click="${() => this.openDialog()}"
              ?hidden="${this.readonly}"
            ></paper-icon-button>
            <span class="no-wrap" slot="message">${translate('ADD_PD_ACTIVITY')}</span>
          </etools-info-tooltip>
        </div>
        <div slot="row-data-details">
          <div class="table-row table-head align-items-center" ?hidden="${this.readonly}">
            <div class="flex-1 left-align layout-vertical">${translate('ACTIVITY_NAME')}</div>
            <div class="flex-1 secondary-cell center">${translate('TIME_PERIODS')}</div>
            <div class="flex-1 secondary-cell right">${translate('PARTNER_CASH')}</div>
            <div class="flex-1 secondary-cell right">${translate('UNICEF_CASH')}</div>
            <div class="flex-1 secondary-cell right">${translate('GENERAL.TOTAL')} (${this.currency})</div>
          </div>

          ${this.activities.length
            ? this.activities.map(
                (activity: InterventionActivity, index: number) => html`
                  <div
                    class="table-row editable-row"
                    related-to="activity-${activity.id}"
                    related-to-description=" Activity - ${activity.name}"
                    comments-container
                    @paper-dropdown-open="${(event: CustomEvent) =>
                      (event.currentTarget as HTMLElement)!.classList.add('active')}"
                    @paper-dropdown-close="${(event: CustomEvent) =>
                      (event.currentTarget as HTMLElement)!.classList.remove('active')}"
                  >
                    <!--    Activity Data: code / name / other info / items link    -->
                    <div class="flex-1 left-align layout-horizontal">
                      <b>${activity.code}&nbsp;</b>
                      <div>
                        <div><b>${activity.name || '-'}</b></div>
                        <div class="details" ?hidden="${!activity.context_details}">
                          ${this.truncateString(activity.context_details)}
                        </div>
                      </div>
                      <div
                        class="item-link"
                        ?hidden="${!activity.items?.length}"
                        @click="${() => this.openDialog(activity, this.readonly)}"
                      >
                        (${activity.items?.length}) items
                      </div>
                    </div>

                    <!--    Time intervals    -->
                    <div class="flex-1 secondary-cell center">
                      <time-intervals
                        .quarters="${this.quarters}"
                        .selectedTimeFrames="${activity.time_frames}"
                        without-popup
                      ></time-intervals>
                    </div>

                    <!--    CSO Cash    -->
                    <div class="flex-1 secondary-cell right">
                      ${displayCurrencyAmount(String(activity.cso_cash || 0), '0', 2)}
                    </div>

                    <!--    UNICEF Cash    -->
                    <div class="flex-1 secondary-cell right">
                      ${displayCurrencyAmount(String(activity.unicef_cash || 0), '0', 2)}
                    </div>

                    <!--    Total    -->
                    <div class="flex-1 secondary-cell right">
                      <!--       TODO: use field from backend         -->
                      <b>
                        ${displayCurrencyAmount(String(this.getTotal(activity.cso_cash, activity.unicef_cash)), '0', 2)}
                      </b>
                    </div>

                    <div class="show-actions hover-block" style="z-index: ${99 - index}" ?hidden="${this.commentMode}">
                      <paper-menu-button id="view-menu-button" close-on-activate horizontal-align="right">
                        <paper-icon-button
                          slot="dropdown-trigger"
                          icon="icons:more-vert"
                          tabindex="0"
                        ></paper-icon-button>
                        <paper-listbox slot="dropdown-content">
                          <div class="action" @click="${() => this.openDialog(activity, this.readonly)}">
                            <iron-icon icon="${this.readonly ? 'visibility' : 'create'}"></iron-icon>
                            ${this.readonly ? translate('VIEW') : translate('EDIT')}
                          </div>
                          <div
                            class="action delete-action"
                            ?hidden="${this.readonly}"
                            @click="${() => this.openDeleteDialog(String(activity.id))}"
                          >
                            <iron-icon icon="delete"></iron-icon>
                            ${translate('DELETE')}
                          </div>
                        </paper-listbox>
                      </paper-menu-button>
                    </div>
                  </div>
                `
              )
            : html`
                <div class="table-row empty align-items-center">
                  ${this.readonly
                    ? translate('THERE_ARE_NO_PD_ACTIVITIES')
                    : html`
                        <div class="flex-1 left-align layout-vertical">-</div>
                        <div class="flex-1 secondary-cell center">-</div>
                        <div class="flex-1 secondary-cell right">-</div>
                        <div class="flex-1 secondary-cell right">-</div>
                        <div class="flex-1 secondary-cell right">-</div>
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

  openAllRows(): void {
    const row: EtoolsDataTableRow = this.shadowRoot!.querySelector('etools-data-table-row') as EtoolsDataTableRow;
    row.detailsOpened = true;
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
      ActivitiesAndIndicatorsStyles,
      ...super.styles,
      css`
        :host {
          --main-background: #fdf0d2;
          --main-background-dark: #fdf0d2;
          display: block;
          background: var(--main-background);
        }
        .activity-data div {
          text-align: left !important;
          font-size: 16px;
          font-weight: 400;
          line-height: 26px;
        }
        .table-row:not(.empty) {
          min-height: 42px;
        }
        .table-row div.number-data {
          display: flex;
          align-items: center;
          justify-content: flex-end;
        }
        div.time-intervals {
          max-width: 160px;
          width: 15%;
        }
        div.editable-row .hover-block {
          background: linear-gradient(270deg, var(--main-background) 71.65%, rgba(196, 196, 196, 0) 100%);
          padding-left: 20px;
        }
      `
    ];
  }
}
