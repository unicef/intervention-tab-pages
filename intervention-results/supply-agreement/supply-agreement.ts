import {LitElement, html, property, customElement, query} from 'lit-element';
import '@unicef-polymer/etools-content-panel/etools-content-panel.js';
import '@polymer/paper-icon-button/paper-icon-button.js';
import '@unicef-polymer/etools-table/etools-table';
import {getStore} from '../../utils/redux-store-access';
import ComponentBaseMixin from '../../common/mixins/component-base-mixin';
import '@unicef-polymer/etools-loading';
import {sharedStyles} from '../../common/styles/shared-styles-lit';
import {buttonsStyles} from '../../common/styles/button-styles';
import {gridLayoutStylesLit} from '../../common/styles/grid-layout-styles-lit';
import {EtoolsTableColumn, EtoolsTableColumnType, EtoolsTableChildRow} from '@unicef-polymer/etools-table/etools-table';
import './supply-agreement-dialog';
import {RootState} from '../../common/types/store.types';
import {openDialog} from '../../utils/dialog';
import {pageIsNotCurrentlyActive} from '../../utils/common-methods';
import get from 'lodash-es/get';
import cloneDeep from 'lodash-es/cloneDeep';
import {selectSupplyAgreement, selectSupplyAgreementPermissions} from './supplyAgreement.selectors';
import {sendRequest} from '@unicef-polymer/etools-ajax/etools-ajax-request';
import {getEndpoint} from '../../utils/endpoint-helper';
import {interventionEndpoints} from '../../utils/intervention-endpoints';
import {fireEvent} from '../../utils/fire-custom-event';
import {formatServerErrorAsText} from '@unicef-polymer/etools-ajax/ajax-error-parser';
import {getIntervention, updateCurrentIntervention} from '../../common/actions/interventions';
import '../../common/layout/are-you-sure';
import {EtoolsCurrency} from '@unicef-polymer/etools-currency-amount-input/mixins/etools-currency-mixin';
import {CommentsMixin} from '../../common/components/comments/comments-mixin';
import {isUnicefUser} from '../../common/selectors';
import {EtoolsUpload} from '@unicef-polymer/etools-upload/etools-upload';
import {AnyObject, AsyncAction, InterventionSupplyItem} from '@unicef-polymer/etools-types';
import {Intervention, ExpectedResult} from '@unicef-polymer/etools-types';
import {translate} from 'lit-translate';

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
export class FollowUpPage extends CommentsMixin(EtoolsCurrency(ComponentBaseMixin(LitElement))) {
  static get styles() {
    return [gridLayoutStylesLit, buttonsStyles];
  }
  render() {
    if (!this.supply_items) {
      return html`<style>
          ${sharedStyles}
        </style>
        <etools-loading loading-text="Loading..." active></etools-loading>`;
    }
    return html`
      <style>
        ${sharedStyles} :host {
          display: block;
          margin-bottom: 24px;
          --ecp-content-padding: 0;
          --ecp-content_-_padding: 0;
        }
        .mr-20 {
          margin-right: 20px;
        }
        .pad-right {
          padding-right: 6px;
        }
        div[slot='panel-btns'] {
          display: flex;
          align-items: center;
        }
      </style>

      <etools-content-panel
        show-expand-btn
        panel-title=${translate('INTERVENTION_RESULTS.SUPPLY_AGREEMENT.SUPPLY_AGREEMENT')}
        comment-element="supply-agreement"
        comment-description=${translate('INTERVENTION_RESULTS.SUPPLY_AGREEMENT.SUPPLY_AGREEMENT')}
      >
        <div slot="panel-btns">
          <span class="mr-20">
            <label class="paper-label font-bold pad-right"
              >${translate('INTERVENTION_RESULTS.SUPPLY_AGREEMENT.TOTAL_SUPPLY_BUDGET')}
            </label>
            <label class="font-bold-12"
              >${this.intervention.planned_budget.currency}
              ${this.displayCurrencyAmount(this.intervention.planned_budget.in_kind_amount_local)}</label
            >
          </span>
          <paper-icon-button
            ?hidden="${!this.permissions.edit.supply_items || this.uploadInProcess}"
            @click="${() => this.uploader?._openFileChooser()}"
            icon="file-upload"
          >
          </paper-icon-button>
          <etools-loading ?active="${this.uploadInProcess}" no-overlay loading-text></etools-loading>
          <paper-icon-button
            ?hidden="${!this.permissions.edit.supply_items}"
            @click="${() => this.addSupplyItem()}"
            icon="add-box"
          >
          </paper-icon-button>
        </div>
        <etools-table
          ?hidden="${!this.supply_items?.length}"
          .columns="${this.columns}"
          .items="${this.supply_items}"
          @edit-item="${this.editSupplyItem}"
          @delete-item="${this.confirmDeleteSupplyItem}"
          .getChildRowTemplateMethod="${this.getChildRowTemplate.bind(this)}"
          .extraCSS="${this.getTableStyle()}"
          .showEdit=${this.permissions.edit.supply_items}
          .showDelete=${this.permissions.edit.supply_items}
        ></etools-table>
        <div class="row-h" ?hidden="${this.supply_items?.length}">
          <p>${translate('INTERVENTION_RESULTS.SUPPLY_AGREEMENT.NO_SUPPLY_AGREEMENTS')}</p>
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
      label: (translate('INTERVENTION_RESULTS.SUPPLY_AGREEMENT.ITEM_ALL_PRICES') as unknown) as string,
      name: 'title',
      type: EtoolsTableColumnType.Text,
      cssClass: 'col_title'
    },
    {
      label: (translate('INTERVENTION_RESULTS.SUPPLY_AGREEMENT.NUMBER_UNITS') as unknown) as string,
      name: 'unit_number',
      type: EtoolsTableColumnType.Number,
      cssClass: 'col_nowrap'
    },
    {
      label: (translate('INTERVENTION_RESULTS.SUPPLY_AGREEMENT.PRICE_UNIT') as unknown) as string,
      name: 'unit_price',
      type: EtoolsTableColumnType.Number,
      cssClass: 'col_nowrap'
    },
    {
      label: (translate('INTERVENTION_RESULTS.SUPPLY_AGREEMENT.TOTAL_PRICE') as unknown) as string,
      name: 'total_price',
      cssClass: 'col_nowrap',
      type: EtoolsTableColumnType.Number
    },
    {
      label: (translate('INTERVENTION_RESULTS.SUPPLY_AGREEMENT.UNICEF_PRODUCT_NUMBER') as unknown) as string,
      name: 'unicef_product_number',
      cssClass: 'col_nowrap',
      type: EtoolsTableColumnType.Number
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
                <label class="paper-label">${translate('INTERVENTION_RESULTS.SUPPLY_AGREEMENT.CP_OUTPUTS')}</label
                ><br />
                <label>${output || '—'}</label><br />
              </div>
            </td>`
          : html``
      }
      <td colspan="${this.isUnicefUser ? '4' : '5'}" class="ptb-0">
        <div class="child-row-inner-container">
          <label class="paper-label">${translate('INTERVENTION_RESULTS.SUPPLY_AGREEMENT.OTHER_MENTIONS')}</label><br />
          <label>${item.other_mentions || '—'}</label>
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

  stateChanged(state: RootState): void {
    if (pageIsNotCurrentlyActive(get(state, 'app.routeDetails'), 'interventions', 'results')) {
      return;
    }
    if (get(state, 'interventions.current')) {
      const currentIntervention = get(state, 'interventions.current');
      this.intervention = cloneDeep(currentIntervention);
    }
    this.supply_items = selectSupplyAgreement(state);
    this.permissions = selectSupplyAgreementPermissions(state);
    this.supply_items.map((item: AnyObject) => {
      item.total_price = this.addCurrencyAmountDelimiter(item.total_price);
      item.unit_number = Number(item.unit_number);
      item.unit_price = this.addCurrencyAmountDelimiter(item.unit_price);
      return item;
    });
    if (state.user && state.user.data) {
      this.isUnicefUser = isUnicefUser(state);
    }
    super.stateChanged(state);
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
        content: translate('INTERVENTION_RESULTS.SUPPLY_AGREEMENT.DELETE_SUPPLY_PROMPT'),
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

    sendRequest({
      endpoint: endpoint,
      method: 'DELETE'
    })
      .then(() => {
        getStore().dispatch<AsyncAction>(getIntervention());
      })
      .catch((err: any) => {
        fireEvent(this, 'toast', {text: formatServerErrorAsText(err)});
      });
  }

  onUploadFinished({success, error}: any) {
    this.uploadInProcess = false;
    if (success) {
      getStore().dispatch(updateCurrentIntervention(success));
      fireEvent(this, 'toast', {text: translate('INTERVENTION_RESULTS.SUPPLY_AGREEMENT.SUPPLIES_UPLOADED')});
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
        isUnicefUser: this.isUnicefUser
      }
    });
  }
}
