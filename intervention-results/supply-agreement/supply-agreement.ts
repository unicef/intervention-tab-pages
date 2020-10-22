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
import {AnyObject, RootState} from '../../common/models/globals.types';
import {InterventionSupplyItem, Intervention, ExpectedResult} from '../../common/models/intervention.types';
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
import {getIntervention, updateCurrentIntervention} from '../../common/actions';
import '../../common/layout/are-you-sure';
import {EtoolsCurrency} from '@unicef-polymer/etools-currency-amount-input/mixins/etools-currency-mixin';
import {CommentsMixin} from '../../common/components/comments/comments-mixin';
import {isUnicefUser} from '../../common/selectors';
import {AsyncAction} from '../../common/types/types';
import {EtoolsUpload} from '@unicef-polymer/etools-upload/etools-upload';

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
        panel-title="Supply Agreement"
        comment-element="supply-agreement"
        comment-description="Supply Agreement"
      >
        <div slot="panel-btns">
          <span class="mr-20">
            <label class="paper-label font-bold pad-right">TOTAL SUPPLY BUDGET: </label>
            <label class="font-bold-12"
              >${this.intervention.planned_budget.currency}
              ${this.displayCurrencyAmount(this.intervention.planned_budget.in_kind_amount_local)}</label
            >
          </span>
          <paper-icon-button
            ?hidden="${!this.permissions.edit.supply_items}"
            @click="${() => this.addSupplyItem()}"
            icon="add-box"
          >
          </paper-icon-button>
          <paper-icon-button
            ?hidden="${!this.permissions.edit.supply_items || this.uploadInProcess}"
            @click="${() => this.uploader?._openFileChooser()}"
            icon="file-upload"
          >
          </paper-icon-button>
          <etools-loading ?active="${this.uploadInProcess}" no-overlay loading-text></etools-loading>
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
          <p>There are no supply agreements added.</p>
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
      label: 'Item (all prices in PD Currency)',
      name: 'title',
      type: EtoolsTableColumnType.Text,
      cssClass: 'col_title'
    },
    {
      label: 'Number of Units',
      name: 'unit_number',
      type: EtoolsTableColumnType.Number,
      cssClass: 'col_nowrap'
    },
    {
      label: 'Price / Unit',
      name: 'unit_price',
      type: EtoolsTableColumnType.Number,
      cssClass: 'col_nowrap'
    },
    {
      label: 'Total Price',
      name: 'total_price',
      cssClass: 'col_nowrap',
      type: EtoolsTableColumnType.Number
    }
  ];

  @property({type: Object})
  permissions!: {edit: {supply_items?: boolean}};

  @property({type: Boolean})
  isUnicefUser = false;

  @property()
  uploadInProcess: boolean = false;

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
                <label class="paper-label">Cp Outputs</label><br />
                <label>${output || '—'}</label><br />
              </div>
            </td>`
          : html``
      }
      <td colspan="${this.isUnicefUser ? '4' : '5'}" class="ptb-0">
        <div class="child-row-inner-container">
          <label class="paper-label">Other Mentions</label><br />
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
        content: 'Are you sure you want to delete this Supply Agreement item?',
        confirmBtnText: 'Delete'
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
      .then((_resp: any) => {
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
      fireEvent(this, 'toast', {text: 'Supplies uploaded successfuly'});
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
