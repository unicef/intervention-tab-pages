import {LitElement, html, property, customElement, query} from 'lit-element';
import '@unicef-polymer/etools-content-panel/etools-content-panel.js';
import '@polymer/paper-icon-button/paper-icon-button.js';
import '@unicef-polymer/etools-table/etools-table';
import {getStore} from '@unicef-polymer/etools-modules-common/dist/utils/redux-store-access';
import ComponentBaseMixin from '@unicef-polymer/etools-modules-common/dist/mixins/component-base-mixin';
import '@unicef-polymer/etools-loading';
import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';
import {buttonsStyles} from '@unicef-polymer/etools-modules-common/dist/styles/button-styles';
import {gridLayoutStylesLit} from '@unicef-polymer/etools-modules-common/dist/styles/grid-layout-styles-lit';
import {EtoolsTableColumn, EtoolsTableColumnType, EtoolsTableChildRow} from '@unicef-polymer/etools-table/etools-table';
import './supply-agreement-dialog';
import {RootState} from '../../common/types/store.types';
import {openDialog} from '@unicef-polymer/etools-modules-common/dist/utils/dialog';
import {pageIsNotCurrentlyActive} from '@unicef-polymer/etools-modules-common/dist/utils/common-methods';
import get from 'lodash-es/get';
import cloneDeep from 'lodash-es/cloneDeep';
import {selectSupplyAgreement, selectSupplyAgreementPermissions} from './supplyAgreement.selectors';
import {sendRequest} from '@unicef-polymer/etools-ajax/etools-ajax-request';
import {getEndpoint} from '@unicef-polymer/etools-modules-common/dist/utils/endpoint-helper';
import {interventionEndpoints} from '../../utils/intervention-endpoints';
import {fireEvent} from '@unicef-polymer/etools-modules-common/dist/utils/fire-custom-event';
import {formatServerErrorAsText} from '@unicef-polymer/etools-ajax/ajax-error-parser';
import {getIntervention, updateCurrentIntervention} from '../../common/actions/interventions';
import '@unicef-polymer/etools-modules-common/dist/layout/are-you-sure';
import {
  addCurrencyAmountDelimiter,
  displayCurrencyAmount
} from '@unicef-polymer/etools-currency-amount-input/mixins/etools-currency-module';
import {CommentsMixin} from '../../common/components/comments/comments-mixin';
import {isUnicefUser} from '../../common/selectors';
import {EtoolsUpload} from '@unicef-polymer/etools-upload/etools-upload';
import {AnyObject, AsyncAction, InterventionSupplyItem} from '@unicef-polymer/etools-types';
import {Intervention, ExpectedResult} from '@unicef-polymer/etools-types';
import {translate, get as getTranslation} from 'lit-translate';
import {translatesMap} from '../../utils/intervention-labels-map';
import {TABS} from '../../common/constants';

const customStyles = html`
  <style>
    .col_title {
      width: 99%;
    }
    .col_nowrap {
      width: 1%;
      white-space: nowrap;
    }
    .expand-cell iron-icon {
      width: 70px !important;
      color: #2b2b2b !important;
    }
  </style>
`;

@customElement('supply-agreements')
export class FollowUpPage extends CommentsMixin(ComponentBaseMixin(LitElement)) {
  static get styles() {
    return [gridLayoutStylesLit, buttonsStyles];
  }
  render() {
    if (!this.supply_items) {
      return html` ${sharedStyles}
        <etools-loading source="supply-a" loading-text="Loading..." active></etools-loading>`;
    }
    return html`
      ${sharedStyles}
      <style>
        :host {
          display: block;
          margin-bottom: 24px;
          --etools-table-col-font-size: 16px;
        }

        .mr-20 {
          margin-right: 20px;
        }
        .pad-right {
          padding-right: 6px;
        }
        #uploadHelpPanel {
          margin-block-end: 0;
        }
        div[slot='panel-btns'] {
          display: flex;
          align-items: center;
        }
      </style>

      <etools-content-panel
        show-expand-btn
        panel-title=${translate(translatesMap.supply_items)}
        comment-element="supply-agreement"
        comment-description=${translate('SUPPLY_CONTRIBUTION')}
      >
        <div slot="panel-btns">
          <span class="mr-20">
            <label class="paper-label font-bold pad-right">${translate('TOTAL_SUPPLY_BUDGET')} </label>
            <label class="font-bold-12"
              >${this.intervention.planned_budget.currency}
              ${displayCurrencyAmount(this.intervention.planned_budget.total_supply!, '0.00')}</label
            >
          </span>

          <etools-info-tooltip
            custom-icon
            position="left"
            ?hide-tooltip="${!this.permissions.edit.supply_items || this.uploadInProcess}"
          >
            <paper-icon-button
              slot="custom-icon"
              ?hidden="${!this.permissions.edit.supply_items || this.uploadInProcess}"
              @click="${() => this.uploader?._openFileChooser()}"
              icon="file-upload"
            >
            </paper-icon-button>
            <span slot="message">${translate('UPLOAD_SUPPLY_TOOLTIP')}</span>
          </etools-info-tooltip>

          <etools-loading ?active="${this.uploadInProcess}" no-overlay loading-text></etools-loading>
          <paper-icon-button
            ?hidden="${!this.permissions.edit.supply_items}"
            @click="${() => this.addSupplyItem()}"
            icon="add-box"
          >
          </paper-icon-button>
        </div>
        <div class="row-h" ?hidden="${!this.permissions.edit.supply_items || this.supply_items?.length}">
          ${this.getUploadHelpElement()}
        </div>

        <etools-table
          ?hidden="${!this.supply_items?.length}"
          .columns="${this.columns}"
          .items="${this.supply_items}"
          @edit-item="${this.editSupplyItem}"
          @delete-item="${this.confirmDeleteSupplyItem}"
          .getChildRowTemplateMethod="${this.getChildRowTemplate.bind(this)}"
          .extraCSS="${this.getTableStyle()}"
          .customData="${{supplyItemProviders: this.supplyItemProviders}}"
          .showEdit=${this.permissions.edit.supply_items}
          .showDelete=${this.permissions.edit.supply_items}
        ></etools-table>
        <div class="row-h" ?hidden="${this.supply_items?.length}">
          <p>${translate('NO_SUPPLY_CONTRIBUTION')}</p>
        </div>
      </etools-content-panel>

      <etools-upload
        hidden
        accept=".csv"
        .endpointInfo="${{
          endpoint: getEndpoint(interventionEndpoints.supplyItemsUpload, {interventionId: this.intervention.id}).url,
          rawFilePropertyName: 'supply_items_file',
          rejectWithRequest: true
        }}"
        @upload-finished="${(event: CustomEvent) => this.onUploadFinished(event.detail)}"
        @upload-started="${() => (this.uploadInProcess = true)}"
      ></etools-upload>
    `;
  }

  @property({type: Array})
  supply_items!: AnyObject[];

  @property({type: Object})
  intervention!: Intervention;

  @property({type: Array})
  columns: EtoolsTableColumn[] = [
    {
      label: translate('ITEM_ALL_PRICES') as unknown as string,
      name: 'title',
      type: EtoolsTableColumnType.Text,
      cssClass: 'col_title'
    },
    {
      label: translate('NUMBER_UNITS') as unknown as string,
      name: 'unit_number',
      type: EtoolsTableColumnType.Number,
      cssClass: 'col_nowrap'
    },
    {
      label: translate('PRICE_UNIT') as unknown as string,
      name: 'unit_price',
      type: EtoolsTableColumnType.Number,
      cssClass: 'col_nowrap'
    },
    {
      label: '',
      name: 'total_price',
      cssClass: 'col_nowrap',
      type: EtoolsTableColumnType.Number
    },
    {
      label: translate('PROVIDED_BY') as unknown as string,
      name: 'provided_by',
      cssClass: 'col_nowrap',
      type: EtoolsTableColumnType.Custom,
      capitalize: true,
      customMethod: (item: any, _key: string, customData: AnyObject) => {
        return customData.supplyItemProviders[item.provided_by] || '—';
      }
    }
  ];

  @property({type: Object})
  permissions!: {edit: {supply_items?: boolean}};

  @property({type: Boolean})
  isUnicefUser = false;

  @property()
  uploadInProcess = false;

  @query('etools-upload')
  uploader!: EtoolsUpload & {_openFileChooser(): void};

  @property({type: Object})
  supplyItemProviders: AnyObject = {
    unicef: getTranslation('UNICEF'),
    partner: getTranslation('PARTNER')
  };

  getChildRowTemplate(item: any): EtoolsTableChildRow {
    const childRow = {} as EtoolsTableChildRow;
    childRow.showExpanded = false;
    const resultLink = this.intervention.result_links.find((result: ExpectedResult) => result.id === item.result);
    const output = resultLink ? resultLink.cp_output_name : '';
    // hide CP Output for Partner User, and preserve layout
    childRow.rowHTML = html`
      <td></td>
      ${
        this.isUnicefUser
          ? html`<td class="ptb-0">
              <div class="child-row-inner-container">
                <label class="paper-label">${translate('CP_OUTPUTS')}</label><br />
                <label>${output || '—'}</label><br />
              </div>
            </td>`
          : html``
      }
      <td colspan="${this.isUnicefUser ? '3' : '4'}" class="ptb-0">
        <div class="child-row-inner-container">
          <label class="paper-label">${translate('OTHER_MENTIONS')}</label><br />
          <label>${item.other_mentions || '—'}</label>
          </paper-input>
        </div>
      </td>
      <td colspan="2" class="ptb-0">
        <div class="child-row-inner-container" ?hidden="${item.provided_by.toLowerCase() === 'partner'}">
          <label class="paper-label">
            ${translate('UNICEF_PRODUCT_NUMBER')}</label><br />
          <label>${item.unicef_product_number || '—'}</label>
          </paper-input>
        </div>
      </td>
    `;
    return childRow;
  }

  getTableStyle() {
    return html`<style>
        ${sharedStyles}
      </style>
      ${customStyles}`;
  }

  getUploadHelpElement() {
    const link = 'https://supply.unicef.org/all-materials.html';
    const paragraph = document.createElement('p');
    paragraph.innerHTML = getTranslation('UPLOAD_SUPPLY_HELPER').replace(
      '{0}',
      `<a target='_blank' href=${link}>${link}</a>`
    );
    return paragraph;
  }

  stateChanged(state: RootState): void {
    if (pageIsNotCurrentlyActive(get(state, 'app.routeDetails'), 'interventions', TABS.Workplan)) {
      return;
    }
    if (get(state, 'interventions.current')) {
      const currentIntervention = get(state, 'interventions.current');
      this.intervention = cloneDeep(currentIntervention);
      this.currencyDisplayForTotal();
    }
    this.supply_items = selectSupplyAgreement(state);
    this.permissions = selectSupplyAgreementPermissions(state);
    this.supply_items.map((item: AnyObject) => {
      item.total_price = addCurrencyAmountDelimiter(item.total_price);
      item.unit_number = Number(item.unit_number);
      item.unit_price = addCurrencyAmountDelimiter(item.unit_price);
      return item;
    });

    if (state.user && state.user.data) {
      this.isUnicefUser = isUnicefUser(state);
    }
    super.stateChanged(state);
  }
  currencyDisplayForTotal() {
    this.columns[3].label = getTranslation('TOTAL_PRICE') + ' (' + this.intervention?.planned_budget?.currency + ')';
  }

  cancelSupply() {
    this.editMode = false;
  }

  editSupplyItem(e: CustomEvent) {
    this.openSupplyDialog(e.detail);
  }

  addSupplyItem() {
    this.openSupplyDialog(new InterventionSupplyItem());
    this.openContentPanel();
  }

  async confirmDeleteSupplyItem(e: CustomEvent) {
    const confirmed = await openDialog({
      dialog: 'are-you-sure',
      dialogData: {
        content: translate('DELETE_SUPPLY_PROMPT'),
        confirmBtnText: translate('GENERAL.DELETE')
      }
    }).then(({confirmed}) => {
      return confirmed;
    });

    if (confirmed) {
      this.deleteSupplyItem(e.detail.id);
    }
  }

  deleteSupplyItem(supplyId: number) {
    const endpoint = getEndpoint(interventionEndpoints.supplyAgreementEdit, {
      interventionId: this.intervention.id,
      supplyId: supplyId
    });

    fireEvent(this, 'global-loading', {
      message: 'Loading...',
      active: true,
      loadingSource: 'intervention-tabs'
    });

    sendRequest({
      endpoint: endpoint,
      method: 'DELETE'
    })
      .then(() => {
        getStore()
          .dispatch<AsyncAction>(getIntervention())
          .finally(() =>
            fireEvent(this, 'global-loading', {
              active: false,
              loadingSource: 'intervention-tabs'
            })
          );
      })
      .catch((err: any) => {
        fireEvent(this, 'toast', {text: formatServerErrorAsText(err)});
        fireEvent(this, 'global-loading', {
          active: false,
          loadingSource: 'intervention-tabs'
        });
      });
  }

  onUploadFinished({success, error}: any) {
    this.uploadInProcess = false;
    if (success) {
      getStore().dispatch(updateCurrentIntervention(success));
      fireEvent(this, 'toast', {
        text: getTranslation('SUPPLIES_UPLOADED')
      });
    } else {
      const message = this.getUploadError(error);
      fireEvent(this, 'toast', {text: `Can not upload supplies: ${message}`});
    }
  }

  getUploadError(error: any): string {
    const defaultMessage: string = error?.error?.message || 'Unknown error';
    const errorResponse: string = error?.request?.xhr?.responseText || '';
    try {
      const response: AnyObject = JSON.parse(errorResponse);
      return Object.values(response).join('; ');
    } catch (e) {
      return defaultMessage;
    }
  }

  private openSupplyDialog(item: InterventionSupplyItem) {
    openDialog({
      dialog: 'supply-agreement-dialog',
      dialogData: {
        data: item,
        interventionId: this.intervention.id,
        result_links: this.intervention.result_links,
        isUnicefUser: this.isUnicefUser,
        currency: this.intervention.planned_budget.currency
      }
    });
  }
}
