import {LitElement, html, TemplateResult, CSSResultArray, css} from 'lit';
import {property, customElement, queryAll} from 'lit/decorators.js';
import {ResultStructureStyles} from './styles/results-structure.styles';
import {gridLayoutStylesLit} from '@unicef-polymer/etools-modules-common/dist/styles/grid-layout-styles-lit';

import '@unicef-polymer/etools-unicef/src/etools-info-tooltip/etools-info-tooltip';
import './modals/activity-dialog/activity-data-dialog';
import '../../intervention-workplan-editor/time-intervals/time-intervals';
import {openDialog} from '@unicef-polymer/etools-utils/dist/dialog.util';
import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';
import {CommentElementMeta, CommentsMixin} from '../../common/components/comments/comments-mixin';
import {InterventionActivity, InterventionQuarter} from '@unicef-polymer/etools-types';
import {translate} from 'lit-translate';
import {translatesMap} from '../../utils/intervention-labels-map';
import {displayCurrencyAmount} from '@unicef-polymer/etools-unicef/src/utils/currency';
import {ActivitiesAndIndicatorsStyles} from './styles/ativities-and-indicators.styles';
import {EtoolsDataTableRow} from '@unicef-polymer/etools-unicef/src/etools-data-table/etools-data-table-row';
import {TruncateMixin} from '../../common/mixins/truncate.mixin';
import {
  openActivityDeactivationDialog,
  openDeleteActivityDialog,
  _canDeactivate,
  _canDelete
} from '../../common/mixins/results-structure-common';
import {isEmptyObject} from '@unicef-polymer/etools-utils/dist/equality-comparisons.util';
import '@unicef-polymer/etools-unicef/src/etools-icons/etools-icon';
import '@unicef-polymer/etools-unicef/src/etools-icon-button/etools-icon-button';
import '@shoelace-style/shoelace/dist/components/dropdown/dropdown.js';
import '@shoelace-style/shoelace/dist/components/menu/menu.js';
import '@shoelace-style/shoelace/dist/components/menu-item/menu-item.js';
import SlDropdown from '@shoelace-style/shoelace/dist/components/dropdown/dropdown.js';
@customElement('pd-activities')
export class PdActivities extends CommentsMixin(TruncateMixin(LitElement)) {
  @property({type: String})
  currency = '';

  @property({type: Array})
  activities: InterventionActivity[] = [];

  @property({type: Boolean})
  readonly!: boolean;

  @property({type: Boolean})
  inAmendment!: boolean;

  @property({type: String})
  inAmendmentDate!: string;

  @property({type: String})
  interventionStatus!: string;

  @property({type: Boolean}) showInactive!: boolean;

  interventionId!: number;
  pdOutputId!: number;
  quarters!: InterventionQuarter[];

  protected render(): TemplateResult {
    // language=HTML
    return html`
      ${sharedStyles}
      <etools-data-table-row .detailsOpened="${true}" id="activitiesRow">
        <div slot="row-data" class="layout-horizontal align-items-center editable-row start-justified">
          <div class="title-text">${translate(translatesMap.activities)} (${this.activities.length})</div>
          <etools-info-tooltip position="top" custom-icon ?hide-tooltip="${this.readonly}" offset="0">
            <etools-icon-button
              name="add-box"
              slot="custom-icon"
              class="add"
              @click="${() => this.openDialog()}"
              ?hidden="${this.readonly}"
            ></etools-icon-button>
            <span class="no-wrap" slot="message">${translate('ADD_PD_ACTIVITY')}</span>
          </etools-info-tooltip>
        </div>
        <div slot="row-data-details">
          <div class="table-row table-head align-items-center" ?hidden="${isEmptyObject(this.activities)}">
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
                    related-to-description="${activity.name}"
                    comments-container
                    ?hidden="${this._hideActivity(activity, this.showInactive)}"
                    @sl-show="${(event: CustomEvent) => {
                      (event.currentTarget as HTMLElement)!.classList.add('active');
                    }}"
                    @sl-hide="${(event: CustomEvent) =>
                      (event.currentTarget as HTMLElement)!.classList.remove('active')}"
                  >
                    <!--    Activity Data: code / name / other info / items link    -->
                    <div class="flex-1 left-align layout-horizontal">
                      <b>${activity.code}&nbsp;</b>
                      <div>
                        <div>
                          <b
                            >${activity.is_active ? '' : html`(<u>${translate('INACTIVE')}</u>) `}${activity.name ||
                            '-'}</b
                          >
                        </div>
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
                      <sl-dropdown distance="-40" id="view-menu-button">
                        <etools-icon-button slot="trigger" name="more-vert" tabindex="0"></etools-icon-button>
                        <sl-menu>
                          <sl-menu-item
                            class="action"
                            @click="${() => this.openDialog(activity, this.readonly || !activity.is_active)}"
                          >
                            <etools-icon
                              slot="prefix"
                              name="${this.readonly || !activity.is_active ? 'visibility' : 'create'}"
                            ></etools-icon>
                            ${this.readonly || !activity.is_active ? translate('VIEW') : translate('EDIT')}
                          </sl-menu-item>
                          <sl-menu-item
                            class="action"
                            ?hidden="${!_canDeactivate(
                              activity,
                              this.readonly,
                              this.interventionStatus,
                              this.inAmendment,
                              this.inAmendmentDate
                            )}"
                            @click="${() =>
                              openActivityDeactivationDialog(activity.id, this.pdOutputId, this.interventionId)}"
                          >
                            <etools-icon slot="prefix" name="block"></etools-icon>
                            ${translate('DEACTIVATE')}
                          </sl-menu-item>
                          <sl-menu-item
                            class="action delete-action"
                            ?hidden="${!_canDelete(
                              activity,
                              this.readonly,
                              this.interventionStatus,
                              this.inAmendment,
                              this.inAmendmentDate
                            )}"
                            @click="${() =>
                              openDeleteActivityDialog(activity.id, this.pdOutputId, this.interventionId)}"
                          >
                            <etools-icon slot="prefix" name="delete"></etools-icon>
                            ${translate('DELETE')}
                          </sl-menu-item>
                        </sl-menu>
                      </sl-dropdown>
                    </div>
                  </div>
                `
              )
            : html` <div class="table-row empty center-align">${translate('THERE_ARE_NO_PD_ACTIVITIES')}</div> `}
        </div>
      </etools-data-table-row>
    `;
  }

  @queryAll('#view-menu-button')
  actionsMenuBtns!: SlDropdown[];

  connectedCallback(): void {
    super.connectedCallback();
    this.closeMenusOnScroll = this.closeMenusOnScroll.bind(this);
    this.getScrollableArea().addEventListener('scroll', this.closeMenusOnScroll, false);
  }

  // Scroll happens on this area, not on window
  getScrollableArea() {
    return document!
      .querySelector('app-shell')!
      .shadowRoot!.querySelector('#appHeadLayout')!
      .shadowRoot!.querySelector('#contentContainer')!;
  }

  closeMenusOnScroll() {
    this.actionsMenuBtns.forEach((p) => (p.open = false));
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.getScrollableArea().removeEventListener('scroll', this.closeMenusOnScroll, false);
  }

  _hideActivity(activity: any, showInactive: boolean) {
    if (!activity.is_active) {
      return !showInactive;
    }
    return false;
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
          font-size: var(--etools-font-size-16, 16px);
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
          padding-inline-start: 20px;
        }
        etools-data-table-row#activitiesRow::part(edt-list-row-wrapper) {
          padding-inline-start: 25px !important;
        }
        etools-data-table-row#activitiesRow::part(edt-list-row-collapse-wrapper) {
          border-top: none;
        }
        etools-icon-button[name='more-vert'] {
          color: inherit;
        }
        sl-dropdown {
          --sl-spacing-x-small: 4px;
        }
        sl-dropdown sl-menu-item:focus-visible::part(base) {
          background-color: rgba(0, 0, 0, 0.1);
          color: var(--sl-color-neutral-1000);
        }
      `
    ];
  }
}
