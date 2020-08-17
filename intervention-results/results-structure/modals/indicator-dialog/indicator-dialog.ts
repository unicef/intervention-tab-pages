/* eslint-disable lit/no-legacy-template-syntax */
import {LitElement, customElement, html, property} from 'lit-element';
import {sharedStyles} from '../../../../common/styles/shared-styles-lit';
import {gridLayoutStylesLit} from '../../../../common/styles/grid-layout-styles-lit';
import {AnyObject, Section, User} from '../../../../common/models/globals.types';
import {Indicator} from '../../../../common/models/intervention.types';
import {isEmptyObject} from '../../../../utils/utils';
import EtoolsDialog from '@unicef-polymer/etools-dialog';

@customElement('indicator-dialog')
export class IndicatorDialog extends LitElement {
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
        on-close="_cleanUp"
        no-padding
        on-confirm-btn-clicked="_validateAndSaveIndicator"
        ok-btn-text="Save"
        keep-dialog-open
        disable-confirm-btn="[[disableConfirmBtn]]"
        spinner-text="[[spinnerText]]"
      >
        <etools-tabs
          id="indicatorTabs"
          tabs="[[indicatorDataTabs]]"
          active-tab="{{activeTab}}"
          border-bottom
          on-iron-select="_centerDialog"
        ></etools-tabs>

        <iron-pages id="indicatorPages" selected="${this.activeTab}" attr-for-selected="name" fallback-selection="details">
          <div name="details">
            <div class="row-h flex-c">
              <div class="col col-4">
                <etools-dropdown
                  id="sectionDropdw"
                  label="Section"
                  selected="{{indicator.section}}"
                  placeholder="&#8212;"
                  options="[[sectionOptions]]"
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
                disabled$="[[_clusterToggleIsDisabled(indicator)]]"
                checked="{{isCluster}}"
              ></paper-toggle-button>
              Cluster Indicator
            </div>
            <div class="indicator-content">
              <template is="dom-if" if="[[!isCluster]]">
                <non-cluster-indicator
                  id="nonClusterIndicatorEl"
                  indicator="{{indicator}}"
                  location-options="[[locationOptions]]"
                  intervention-status="[[interventionStatus]]"
                ></non-cluster-indicator>
              </template>
              <template is="dom-if" if="[[isCluster]]">
                <cluster-indicator
                  id="clusterIndicatorEl"
                  indicator="{{indicator}}"
                  prp-disaggregations="{{prpDisaggregations}}"
                  location-options="[[locationOptions]]"
                ></cluster-indicator>
              </template>
            </div>
          </div>
          <div class="row-padding" name="disaggregations">
            <div hidden$="[[_hideAddDisaggreations(isCluster, currentUser)]]" class="createDisaggreg">
              If disaggregation groups that you need are not pre-defined yet, you can create them
              <a href="/pmp/settings" target="_blank">here</a>.
            </div>
            <template is="dom-if" if="[[!isCluster]]" restamp>
              <indicator-dissaggregations data-items="{{disaggregations}}" on-add-new-disaggreg="_updateScroll">
              </indicator-dissaggregations>
            </template>
            <template is="dom-if" if="[[isCluster]]" restamp>
              <cluster-indicator-disaggregations disaggregations="[[prpDisaggregations]]">
              </cluster-indicator-disaggregations>
            </template>
          </div>
        </iron-pages>
      </etools-dialog>
    `;
  }


  @property({type: Object})
  indicator!: Indicator;

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
  locationOptions!: Location[];

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


  ready() {
    super.ready();
    this._initIndicatorDialogListeners();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._removeIndicatorDialogListeners();
  }

  _updateScroll() {
    (this.$.indicatorDialog as EtoolsDialog).scrollDown();
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

  _clusterToggleIsDisabled(indicator: any) {
    if (indicator && indicator.id) {
      return true;
    }
    return !this.prpServerIsOn();
  }

  openIndicatorDialog() {
    this.updateActiveTab('details');
    this.disableConfirmBtn = false;
    (this.$.indicatorDialog as EtoolsDialog).opened = true;
  }

  setTitle(title: string) {
    (this.$.indicatorDialog as EtoolsDialog).dialogTitle = title;
  }

  setIndicatorData(data: any, actionParams: any, interventionStatus: string) {
    this.set('actionParams', actionParams);
    this.set('interventionStatus', interventionStatus);

    if (!data) {
      // new indicator
      this.isCluster = false;
      this.set('indicator', new Indicator());
      this.set('disaggregations', []);
      this.preselectSectionAndLocation();
      return;
    }

    this.isCluster = !!data.cluster_indicator_id;
    this.set('indicator', data);
    if (!this.isCluster) {
      this.set('disaggregations', this._convertToArrayOfObj(this.indicator.disaggregation));
    }
  }

  preselectSectionAndLocation() {
    if (this.sectionOptions && this.sectionOptions.length === 1) {
      this.set('indicator.section', this.sectionOptions[0].id);
    }
    if (this.locationOptions && this.locationOptions.length === 1) {
      this.set('indicator.locations', [this.locationOptions[0].id]);
    }
  }

  // For dom-repeat to work ok
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

  _cleanUp() {
    this._stopSpinner();
    this.disableConfirmBtn = false;
    // Anything else?
  }

  _stopSpinner(e?: CustomEvent) {
    if (e) {
      e.stopImmediatePropagation();
    }
    (this.$.indicatorDialog as EtoolsDialog).stopSpinner();
    this.spinnerText = 'Saving...';
  }

  _startSpinner(e: CustomEvent) {
    if (e) {
      e.stopImmediatePropagation();
      this.set('spinnerText', e.detail.spinnerText);
    }
    (this.$.indicatorDialog as EtoolsDialog).startSpinner();
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

  resetFieldValues() {
    this.indicator = new Indicator();
    this.disaggregations = [];
    this.prpDisaggregations = [];
    const clusterIndicEl = this.shadowRoot!.querySelector('#clusterIndicatorEl') as ClusterIndicatorEl;
    if (this.isCluster && clusterIndicEl) {
      clusterIndicEl.resetFieldValues();
    }
  }

  _centerDialog() {
    (this.$.indicatorDialog as EtoolsDialog).notifyResize();
  }

  _computeOptions(optionsIds: string[], allOptions: AnyObject[]) {
    if (isEmptyObject(optionsIds) || isEmptyObject(allOptions)) {
      return [];
    }

    const ids = optionsIds.map((id) => Number(id));

    let options = allOptions.filter((opt: any) => {
      return ids.indexOf(Number(opt.id)) > -1;
    });

    return options;
  }

  _hideAddDisaggreations(isCluster: boolean, currentUser: User) {
    return isCluster || !userIsPme(currentUser);
  }
}
}
