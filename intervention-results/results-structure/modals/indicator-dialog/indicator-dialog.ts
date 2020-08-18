/* eslint-disable lit/no-legacy-template-syntax */
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
import {sharedStyles} from '../../../../common/styles/shared-styles-lit';
import {gridLayoutStylesLit} from '../../../../common/styles/grid-layout-styles-lit';
import {AnyObject, Section, User, LocationObject} from '../../../../common/models/globals.types';
import {Indicator} from '../../../../common/models/intervention.types';
import EtoolsDialog from '@unicef-polymer/etools-dialog';
import SaveIndicatorMixin from './mixins/save-indicator-mixin';
import IndicatorDialogTabsMixin from './mixins/indicator-dialog-tabs-mixin';
import {fireEvent} from '../../../../utils/fire-custom-event';
import {getStore} from '../../../../utils/redux-store-access';
import {IndicatorDialogData} from './types';
import {parseRequestErrorsAndShowAsToastMsgs} from '@unicef-polymer/etools-ajax/ajax-error-parser';
import {userIsPme} from '../../../../common/user-permissions';

@customElement('indicator-dialog')
export class IndicatorDialog extends IndicatorDialogTabsMixin(SaveIndicatorMixin(LitElement)) {
  render() {
    return html`
      ${gridLayoutStylesLit}
      <style>
        ${sharedStyles} [hidden] {
          display: none !important;
        }

        paper-input {
          width: 100%;
        }

        :host {
          --border-color: var(--dark-divider-color);
        }

        .indicator-content {
          margin: 16px 24px;
          margin-bottom: 40px;
          border: solid 1px var(--border-color);
          overflow-x: hidden; /*To avoid horizontal scroll in IE11 */
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

        etools-dialog {
          --etools-dialog-scrollable: {
            min-height: 400px;
            font-size: 16px;
          }
        }
      </style>

      <etools-dialog
        id="indicatorDialog"
        size="lg"
        dialog-title="Indicator"
        no-padding
        ?opened="${this.dialogOpened}"
        @close="${this.onClose}"
        @confirm-btn-clicked="${this._validateAndSaveIndicator}"
        ok-btn-text="Save"
        keep-dialog-open
        .disableConfirmBtn="${this.disableConfirmBtn}"
        spinner-text="${this.spinnerText}"
      >
        <etools-tabs
          id="indicatorTabs"
          tabs="${this.indicatorDataTabs}"
          active-tab="${this.activeTab}"
          border-bottom
          on-iron-select="_centerDialog"
        ></etools-tabs>

        <iron-pages
          id="indicatorPages"
          selected="${this.activeTab}"
          attr-for-selected="name"
          fallback-selection="details"
        >
          <div name="details">
            <div class="row-h flex-c">
              <div class="col col-4">
                <etools-dropdown
                  id="sectionDropdw"
                  label="Section"
                  selected="${this.indicator?.section}"
                  placeholder="&#8212;"
                  options="${this.sectionOptions}"
                  option-label="name"
                  option-value="id"
                  required
                  auto-validate
                  error-message="Please select section(s)"
                  disable-on-focus-handling
                  fit-into="etools-dialog"
                >
                </etools-dropdown>
              </div>
            </div>
            <div class="row-h">
              <paper-toggle-button
                disabled$="${this._clusterToggleIsDisabled(this.indicator)}"
                checked="${this.isCluster}"
              ></paper-toggle-button>
              Cluster Indicator
            </div>
            <div class="indicator-content">
              <template is="dom-if" if="${!this.isCluster}">
                <non-cluster-indicator
                  id="nonClusterIndicatorEl"
                  indicator="${this.indicator}"
                  location-options="${this.locationOptions}"
                  intervention-status="${this.interventionStatus}"
                ></non-cluster-indicator>
              </template>
              <template is="dom-if" if="${this.isCluster}">
                <cluster-indicator
                  id="clusterIndicatorEl"
                  indicator="${this.indicator}"
                  prp-disaggregations="${this.prpDisaggregations}"
                  location-options="${this.locationOptions}"
                ></cluster-indicator>
              </template>
            </div>
          </div>
          <div class="row-padding" name="disaggregations">
            <div hidden$="${this._hideAddDisaggreations(this.isCluster, this.currentUser)}" class="createDisaggreg">
              If disaggregation groups that you need are not pre-defined yet, you can create them
              <a href="/pmp/settings" target="_blank">here</a>.
            </div>
            <template is="dom-if" if="${!this.isCluster}" restamp>
              <indicator-dissaggregations data-items="${this.disaggregations}" on-add-new-disaggreg="_updateScroll">
              </indicator-dissaggregations>
            </template>
            <template is="dom-if" if="${this.isCluster}" restamp>
              <cluster-indicator-disaggregations disaggregations="${this.prpDisaggregations}">
              </cluster-indicator-disaggregations>
            </template>
          </div>
        </iron-pages>
      </etools-dialog>
    `;
  }

  @property({type: Object})
  indicator: Indicator | null = null;

  @property({type: Object})
  actionParams!: AnyObject;

  @property({type: Array})
  disaggregations: [] = [];

  @property({type: Array})
  prpDisaggregations: [] = [];

  @property({type: Array})
  sections!: AnyObject[];

  @property({type: Array})
  sectionOptionsIds!: [];

  @property({type: Array})
  sectionOptions!: Section[];

  @property({type: Array})
  locationOptions!: LocationObject[];

  @property({type: Boolean})
  isCluster = false;

  @property({type: Object})
  toastEventSource!: PolymerElement;

  @property({type: Boolean})
  disableConfirmBtn = false;

  @property({type: String})
  spinnerText = 'Saving...';

  @property({type: String})
  interventionStatus!: string;

  @property({type: Object})
  currentUser!: User;

  @property({type: Boolean})
  dialogOpened = true;

  @query('etools-dialog')
  indicatorDialog!: EtoolsDialog;

  private llResultId!: string; /** aka pdOutputId */
  private prpServerOn!: boolean;

  set dialogData(data: IndicatorDialogData) {
    this.indicator = data.indicator ? data.indicator : new Indicator();
    this.setTitle(this.indicator);
    this.sectionOptions = data.sectionOptions;
    this.locationOptions = data.locationOptions;
    this.llResultId = data.llResultId;
    this.prpServerOn = data.prpServerOn;
    this.currentUser = getStore().getState().user.data;
    this.interventionStatus = getStore().getState().interventions.current.status;

    this.preselectSectionAndLocation();
    this.isCluster = !!this.indicator.cluster_indicator_id;
    if (!this.isCluster) {
      this.disaggregations = this._convertToArrayOfObj(this.indicator.disaggregation);
    }
  }

  // setIndicatorData(data: any, actionParams: any, interventionStatus: string) {
  //   // this.set('actionParams', actionParams);
  //   // this.set('interventionStatus', interventionStatus);

  //   //if (!data) {
  //     // new indicator
  //    // this.isCluster = false;
  //     //this.set('indicator', new Indicator());
  //    // this.set('disaggregations', []);
  //    // this.preselectSectionAndLocation();
  //   //  return;
  //   //}

  //  // this.isCluster = !!data.cluster_indicator_id;
  //  // this.set('indicator', data);
  //   // if (!this.isCluster) {
  //   //   this.set('disaggregations', this._convertToArrayOfObj(this.indicator.disaggregation));
  //   // }
  // }

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

  _clusterToggleIsDisabled(indicator: any) {
    if (indicator && indicator.id) {
      return true;
    }
    return !this.prpServerOn;
  }

  // openIndicatorDialog() {
  //   this.updateActiveTab('details');
  //   this.disableConfirmBtn = false;
  //   this.indicatorDialog.opened = true;
  // }

  setTitle(indicator: Indicator) {
    const title = indicator && indicator.id ? 'Edit Indicator' : 'Add Indicator';
    this.indicatorDialog.dialogTitle = title;
  }

  preselectSectionAndLocation() {
    if (this.sectionOptions && this.sectionOptions.length === 1) {
      this.indicator!.section = this.sectionOptions[0].id;
    }
    if (this.locationOptions && this.locationOptions.length === 1) {
      this.indicator!.locations = [this.locationOptions[0].id];
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

  _startSpinner(e: CustomEvent) {
    if (e) {
      e.stopImmediatePropagation();
      this.spinnerText = e.detail.spinnerText;
    }
    this.indicatorDialog.startSpinner();
  }

  _showToast(e: CustomEvent) {
    parseRequestErrorsAndShowAsToastMsgs(e.detail.error, this.toastEventSource);
  }

  resetValidationsAndStyle(isCluster: boolean | undefined, skipUndefinedCheck: boolean) {
    if (typeof isCluster === 'undefined' && !skipUndefinedCheck) {
      return;
    }
    let indicatorEl: ClusterIndicatorEl | NonClusterIndicatorEl;
    if (this.isCluster) {
      indicatorEl = this.shadowRoot!.querySelector('#clusterIndicatorEl') as ClusterIndicatorEl;
      this.updateStyles({'--border-color': 'var(--ternary-color)'});
    } else {
      indicatorEl = (this.shadowRoot!.querySelector('#nonClusterIndicatorEl') as unknown) as NonClusterIndicatorEl;
      this.updateStyles({'--border-color': 'var(--dark-divider-color)'});
    }
    if (indicatorEl) {
      indicatorEl.resetValidations();
      this.updateStyles();
    }

    const sectionDropdown = this.shadowRoot!.querySelector('#sectionDropdw') as EtoolsDropdownEl;
    sectionDropdown.resetInvalidState();
  }

  // resetFieldValues() {
  //   this.indicator = new Indicator();
  //   this.disaggregations = [];
  //   this.prpDisaggregations = [];
  //   const clusterIndicEl = this.shadowRoot!.querySelector('#clusterIndicatorEl') as ClusterIndicatorEl;
  //   if (this.isCluster && clusterIndicEl) {
  //     clusterIndicEl.resetFieldValues();
  //   }
  // }

  _centerDialog() {
    this.indicatorDialog.notifyResize();
  }

  // _computeOptions(optionsIds: string[], allOptions: AnyObject[]) {
  //   if (isEmptyObject(optionsIds) || isEmptyObject(allOptions)) {
  //     return [];
  //   }

  //   const ids = optionsIds.map((id) => Number(id));

  //   let options = allOptions.filter((opt: any) => {
  //     return ids.indexOf(Number(opt.id)) > -1;
  //   });

  //   return options;
  // }

  _hideAddDisaggreations(isCluster: boolean, currentUser: User) {
    return isCluster || !userIsPme(currentUser);
  }
}
