import {LitElement, html} from 'lit';
import {property, customElement, query} from 'lit/decorators.js';
import '@unicef-polymer/etools-unicef/src/etools-icons/etools-icon';
import '@unicef-polymer/etools-unicef/src/etools-dropdown/etools-dropdown.js';
import '@unicef-polymer/etools-unicef/src/etools-dialog/etools-dialog.js';
import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';
import {layoutStyles} from '@unicef-polymer/etools-unicef/src/styles/layout-styles';
import EtoolsDialog from '@unicef-polymer/etools-unicef/src/etools-dialog/etools-dialog.js';
import SaveIndicatorMixin from './mixins/save-indicator-mixin';
import IndicatorDialogTabsMixin from './mixins/indicator-dialog-tabs-mixin';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import {getStore} from '@unicef-polymer/etools-utils/dist/store.util';
import {parseRequestErrorsAndShowAsToastMsgs} from '@unicef-polymer/etools-utils/dist/etools-ajax/ajax-error-parser';
import {userIsPme} from '@unicef-polymer/etools-modules-common/dist/utils/user-permissions';
import ComponentBaseMixin from '@unicef-polymer/etools-modules-common/dist/mixins/component-base-mixin';
import './indicator-dissaggregations';
import './non-cluster-indicator';
import './cluster-indicator';
import './cluster-indicator-disaggregations';
import '@unicef-polymer/etools-modules-common/dist/layout/etools-tabs';
import {Indicator, IndicatorDialogData} from '@unicef-polymer/etools-types';
import {AnyObject, EtoolsUser, LocationObject, Section} from '@unicef-polymer/etools-types';
import {translate, get as getTranslation} from '@unicef-polymer/etools-unicef/src/etools-translate';
import {translatesMap} from '../../../../utils/intervention-labels-map';
import '@shoelace-style/shoelace/dist/components/tab-group/tab-group.js';
import '@shoelace-style/shoelace/dist/components/tab/tab.js';
import {isActiveTab} from '../../../../utils/utils';

@customElement('indicator-dialog')
export class IndicatorDialog extends IndicatorDialogTabsMixin(SaveIndicatorMixin(ComponentBaseMixin(LitElement))) {
  static get styles() {
    return [layoutStyles];
  }
  render() {
    if (!this.data) {
      return html``;
    }
    return html`
      ${sharedStyles}
      <style>
        [hidden] {
          display: none !important;
        }

        :host {
          --border-color: var(--dark-divider-color);
        }

        .indicator-content {
          margin: 14px 24px 40px 24px;
          border: solid 1px rgba(0, 0, 0, 0.4);
          overflow-x: hidden; /*To avoid horizontal scroll in IE11 */
        }
        .indicator-content.cluster {
          border: solid 1px #6dd36d;
        }

        .createDisaggreg {
          color: var(--secondary-text-color);
          padding: 8px 16px;
          font-weight: 500;
          font-size: var(--etools-font-size-16, 16px) !important;
        }

        a {
          color: var(--primary-color);
        }
        sl-tab-group {
          --indicator-color: var(--primary-color);
        }
        sl-tab::part(base) {
          text-transform: uppercase;
          opacity: 0.8;
        }
        sl-tab::part(base):focus-visible {
          outline: 0;
          opacity: 1;
          font-weight: 700;
        }
        .m-15 {
          margin: 0 15px !important;
        }
      </style>

      <etools-dialog
        id="indicatorDialog"
        size="lg"
        no-padding
        @close="${this.onClose}"
        @confirm-btn-clicked="${this._validateAndSaveIndicator}"
        ok-btn-text=${translate('GENERAL.SAVE')}
        cancel-btn-text=${translate('GENERAL.CANCEL')}
        keep-dialog-open
        .disableConfirmBtn="${this.disableConfirmBtn}"
        .hideConfirmBtn="${this.readonly}"
        spinner-text="${this.spinnerText}"
      >
        <etools-tabs-lit
          id="indicatorTabs"
          .tabs="${this.indicatorDataTabs}"
          .activeTab="${this.activeTab}"
          border-bottom
          @sl-tab-show="${this.tabChanged}"
        ></etools-tabs-lit>

        <div name="details" ?hidden="${!isActiveTab(this.activeTab, 'details')}">
          <div class="row m-15">
            <div class="col-md-4 col-12">
              <etools-dropdown
                id="sectionDropdw"
                label=${translate(translatesMap.section)}
                .selected="${this.data?.section}"
                placeholder="&#8212;"
                .options="${this.sectionOptions}"
                option-label="name"
                option-value="id"
                required
                auto-validate
                error-message=${translate('PLEASE_SELECT_SECTIONS')}
                fit-into="etools-dialog"
                ?readonly="${this.readonly}"
                trigger-value-change-event
                @etools-selected-item-changed="${({detail}: CustomEvent) =>
                  this.selectedItemChanged(detail, 'section')}"
              >
              </etools-dropdown>
            </div>
            <div class="col-12" ?hidden="${!this.isCluster}">${translate('CLUSTER_INDICATOR')}</div>
          </div>
          <div class="indicator-content${this.isCluster ? ' cluster' : ''}">
            ${!this.isCluster
              ? html` <non-cluster-indicator
                  id="nonClusterIndicatorEl"
                  .indicator="${this.data}"
                  .locationOptions="${this.locationOptions}"
                  .interventionStatus="${this.interventionStatus}"
                  .readonly="${this.readonly}"
                  .isUnicefUser="${this.currentUser?.is_unicef_user}"
                ></non-cluster-indicator>`
              : html``}
            ${this.isCluster
              ? html` <cluster-indicator
                  id="clusterIndicatorEl"
                  .indicator="${this.data}"
                  .locationOptions="${this.locationOptions}"
                  .readonly="${this.readonly}"
                  @prp-disaggregations-changed="${({detail}: CustomEvent) =>
                    this.displayClusterDisaggregations(detail)}"
                ></cluster-indicator>`
              : html``}
          </div>
        </div>
        <div class="row-padding" name="disaggregations" ?hidden="${!isActiveTab(this.activeTab, 'disaggregations')}">
          <div ?hidden="${this._hideAddDisaggreations(this.isCluster, this.currentUser)}" class="createDisaggreg">
            ${translate('IF_NO_DISAGGREG_GROUPS')}
            <a href="/pmp/settings" target="_blank">${translate('HERE')}</a>.
          </div>
          ${!this.isCluster
            ? html` <indicator-dissaggregations
                id="indicatorDisaggregations"
                .data="${this.disaggregations}"
                .readonly="${this.readonly}"
                @add-new-disaggreg="${({detail}: CustomEvent) => {
                  this._updateScroll();
                  this.disaggregations = detail;
                }}"
              >
              </indicator-dissaggregations>`
            : html``}
          ${this.isCluster
            ? html` <cluster-indicator-disaggregations .disaggregations="${this.prpDisaggregations}">
              </cluster-indicator-disaggregations>`
            : html``}
        </div>
      </etools-dialog>
    `;
  }

  @property({type: Object})
  data: Indicator = new Indicator(); // This is the indicator

  private _disaggregations: {disaggregId: string}[] = [];
  @property({type: Array})
  get disaggregations() {
    return this._disaggregations;
  }
  set disaggregations(newVal: {disaggregId: string}[]) {
    this._disaggregations = [...newVal];
    fireEvent(this, 'update-tab-counter', {count: this._disaggregations.length});
  }

  @property({type: Array})
  prpDisaggregations: [] = [];

  @property({type: Array})
  sections!: AnyObject[];

  @property({type: Array})
  sectionOptions!: Section[];

  @property({type: Array})
  locationOptions!: LocationObject[];

  @property({type: Boolean})
  isCluster = false;

  @property({type: Boolean})
  disableConfirmBtn = false;

  @property({type: String})
  spinnerText = getTranslation('GENERAL.SAVING_DATA');

  @property({type: String})
  interventionStatus!: string;

  @property({type: Object})
  currentUser!: EtoolsUser | null;

  @query('etools-dialog')
  indicatorDialog!: EtoolsDialog;

  @property({type: Boolean})
  isEditRecord!: boolean;

  @property({type: Boolean})
  readonly: boolean | undefined = false;

  protected llResultId!: string; /** aka pdOutputId */
  // private prpServerOn!: boolean;

  set dialogData(data: IndicatorDialogData) {
    this.sectionOptions = data.sectionOptions;
    this.locationOptions = data.locationOptions;
    this.data = data.indicator ? data.indicator : new Indicator();
    this.llResultId = data.llResultId;
    // this.prpServerOn = data.prpServerOn;
    this.currentUser = getStore().getState().user.data;
    this.interventionStatus = getStore().getState().interventions.current?.status || '';
    this.readonly = data.readonly || !this.data.is_active;

    if (!this.data.id) {
      this.preselectSectionAndLocation();
    }
    this.isCluster = !!this.data.cluster_indicator_id;
    if (!this.isCluster) {
      this.disaggregations = this._convertToArrayOfObj(this.data.disaggregation);
    }
    this.isEditRecord = !!(this.data && this.data.id);
    this.disableConfirmBtn = this.isEditRecord && this.isCluster && !this.currentUser?.is_unicef_user;
    this.setTitle();
  }

  tabChanged(e: CustomEvent) {
    const newTabName: string = e.detail.name;
    if (newTabName === this.activeTab) {
      return;
    }
    this.activeTab = newTabName;
  }

  displayClusterDisaggregations(detail: {prpDisaggregations: []}) {
    this.prpDisaggregations = detail.prpDisaggregations;
  }

  isClusterChanged(e: CustomEvent) {
    const chk = e.target as any;
    if (chk.checked === undefined || chk.checked === null) {
      return;
    }
    this.isCluster = chk.checked;
  }

  connectedCallback() {
    super.connectedCallback();
    this._initIndicatorDialogListeners();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._removeIndicatorDialogListeners();
  }

  _updateScroll() {
    this.indicatorDialog.scrollDown();
  }

  _initIndicatorDialogListeners() {
    this._startSpinner = this._startSpinner.bind(this);
    this._stopSpinner = this._stopSpinner.bind(this);
    this._showToast = this._showToast.bind(this);

    this.addEventListener('start-spinner', this._startSpinner as any);
    this.addEventListener('stop-spinner', this._stopSpinner as any);
    this.addEventListener('show-toast', this._showToast as any);
  }

  _removeIndicatorDialogListeners() {
    this.removeEventListener('start-spinner', this._startSpinner as any);
    this.removeEventListener('stop-spinner', this._stopSpinner as any);
    this.removeEventListener('show-toast', this._showToast as any);
  }
  onClose() {
    fireEvent(this, 'dialog-closed', {confirmed: false});
  }

  setTitle() {
    const title = this.readonly
      ? getTranslation('VIEW_INDICATOR')
      : this.isEditRecord
        ? getTranslation('EDIT_INDICATOR')
        : getTranslation('ADD_INDICATOR');
    setTimeout(() => {
      this.indicatorDialog.dialogTitle = title;
    });
  }

  preselectSectionAndLocation() {
    if (this.sectionOptions && this.sectionOptions.length === 1) {
      this.data!.section = this.sectionOptions[0].id;
    }
    if (this.locationOptions && this.locationOptions.length === 1) {
      this.data!.locations = [this.locationOptions[0].id];
    }
  }

  _convertToArrayOfObj(disaggregations: any) {
    if (!disaggregations) {
      return [];
    }
    return disaggregations.map(function (id: number) {
      /**
       * disaggregId and not simply id to avoid repeatable-behavior
       * from trying to make an endpoint request on Delete
       */
      return {disaggregId: id};
    });
  }

  _stopSpinner(e?: CustomEvent) {
    if (e) {
      e.stopImmediatePropagation();
    }
    this.indicatorDialog.stopSpinner();
    this.spinnerText = getTranslation('GENERAL.SAVING_DATA');
  }

  _startSpinner(e?: CustomEvent) {
    if (e) {
      e.stopImmediatePropagation();
      this.spinnerText = e.detail.spinnerText;
    }
    this.indicatorDialog.startSpinner();
  }

  _showToast(e: CustomEvent) {
    parseRequestErrorsAndShowAsToastMsgs(e.detail.error, this);
  }

  _hideAddDisaggreations(isCluster: boolean, currentUser: EtoolsUser | null) {
    return isCluster || !userIsPme(currentUser) || !currentUser?.is_unicef_user;
  }
}
