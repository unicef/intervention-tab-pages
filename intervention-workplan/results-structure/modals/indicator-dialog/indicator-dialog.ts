import {LitElement, customElement, html, property, query} from 'lit-element';
import '@polymer/iron-pages/iron-pages.js';
import '@polymer/iron-icons/iron-icons.js';
import '@polymer/paper-input/paper-input.js';
import '@polymer/paper-tabs/paper-tab.js';
import '@polymer/paper-tabs/paper-tabs.js';
import '@polymer/paper-dropdown-menu/paper-dropdown-menu.js';
import '@polymer/paper-item/paper-item.js';
import '@polymer/paper-toggle-button/paper-toggle-button.js';
import '@unicef-polymer/etools-dropdown/etools-dropdown.js';
import '@unicef-polymer/etools-dialog/etools-dialog.js';
import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';
import {gridLayoutStylesLit} from '@unicef-polymer/etools-modules-common/dist/styles/grid-layout-styles-lit';
import EtoolsDialog from '@unicef-polymer/etools-dialog/etools-dialog.js';
import SaveIndicatorMixin from './mixins/save-indicator-mixin';
import IndicatorDialogTabsMixin from './mixins/indicator-dialog-tabs-mixin';
import {fireEvent} from '@unicef-polymer/etools-modules-common/dist/utils/fire-custom-event';
import {getStore} from '@unicef-polymer/etools-modules-common/dist/utils/redux-store-access';
import {parseRequestErrorsAndShowAsToastMsgs} from '@unicef-polymer/etools-ajax/ajax-error-parser';
import {userIsPme} from '@unicef-polymer/etools-modules-common/dist/utils/user-permissions';
import ComponentBaseMixin from '@unicef-polymer/etools-modules-common/dist/mixins/component-base-mixin';
import {PaperCheckboxElement} from '@polymer/paper-checkbox';
import '@unicef-polymer/etools-modules-common/dist/layout/etools-tabs';
import './indicator-dissaggregations';
import './non-cluster-indicator';
import './cluster-indicator';
import './cluster-indicator-disaggregations';
import {Indicator, IndicatorDialogData} from '@unicef-polymer/etools-types';
import {AnyObject, EtoolsUser, LocationObject, Section} from '@unicef-polymer/etools-types';
import {translate, get as getTranslation} from 'lit-translate';
import {translatesMap} from '../../../../utils/intervention-labels-map';

@customElement('indicator-dialog')
export class IndicatorDialog extends IndicatorDialogTabsMixin(SaveIndicatorMixin(ComponentBaseMixin(LitElement))) {
  static get styles() {
    return [gridLayoutStylesLit];
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

        paper-input {
          width: 100%;
        }

        :host {
          --border-color: var(--dark-divider-color);
        }

        .indicator-content {
          margin: 0px 24px 40px 24px;
          border: solid 1px rgba(0, 0, 0, 0.4);
          overflow-x: hidden; /*To avoid horizontal scroll in IE11 */
        }
        .indicator-content.cluster {
          border: solid 1px #6dd36d;
        }

        .createDisaggreg {
          color: var(--secondary-text-color);
          padding: 8px 0;
          font-weight: 500;
          font-size: 16px !important;
        }

        a {
          color: var(--primary-color);
        }

        etools-dialog::part(ed-scrollable) {
          min-height: 400px;
          font-size: 16px;
        }
      </style>

      <etools-dialog
        id="indicatorDialog"
        size="lg"
        no-padding
        opened
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
          @iron-select="${this.tabChanged}"
        ></etools-tabs-lit>

        <iron-pages
          id="indicatorPages"
          .selected="${this.activeTab}"
          attr-for-selected="name"
          fallback-selection="details"
        >
          <div name="details">
            <div class="row-h flex-c">
              <div class="col col-4">
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
            </div>
            <div class="row-h" ?hidden="${!this.isCluster}">${translate('CLUSTER_INDICATOR')}</div>
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
          <div class="row-padding" name="disaggregations">
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
        </iron-pages>
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
    this.readonly = data.readonly;

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
    const newTabName: string = e.detail.item.getAttribute('name');
    if (newTabName === this.activeTab) {
      return;
    }
    this.activeTab = newTabName;
    this._centerDialog();
  }

  displayClusterDisaggregations(detail: {prpDisaggregations: []}) {
    this.prpDisaggregations = detail.prpDisaggregations;
  }

  isClusterChanged(e: CustomEvent) {
    const chk = e.target as PaperCheckboxElement;
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
    this.spinnerText = 'Saving...';
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

  _centerDialog() {
    this.indicatorDialog.notifyResize();
  }

  _hideAddDisaggreations(isCluster: boolean, currentUser: EtoolsUser | null) {
    return isCluster || !userIsPme(currentUser) || !currentUser?.is_unicef_user;
  }
}
