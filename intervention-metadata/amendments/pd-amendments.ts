import {LitElement, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import '@unicef-polymer/etools-unicef/src/etools-icons/etools-icon';
import '@unicef-polymer/etools-unicef/src/etools-content-panel/etools-content-panel';
import '@unicef-polymer/etools-unicef/src/etools-data-table/etools-data-table';
import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';
import {layoutStyles} from '@unicef-polymer/etools-unicef/src/styles/layout-styles';
import './add-amendment-dialog';
import '@unicef-polymer/etools-modules-common/dist/layout/are-you-sure';
import get from 'lodash-es/get';
import cloneDeep from 'lodash-es/cloneDeep';
import {RootState} from '../../common/types/store.types';
import {prettyDate} from '@unicef-polymer/etools-utils/dist/date.util';
import {getTranslatedValue} from '@unicef-polymer/etools-modules-common/dist/utils/language';
import {getFileNameFromURL} from '@unicef-polymer/etools-utils/dist/general.util';
import {isJsonStrMatch} from '@unicef-polymer/etools-utils/dist/equality-comparisons.util';
import {selectAmendmentsPermissions} from './pd-amendments.selectors';
import {AmendmentsKind, AmendmentsKindTranslateKeys, PdAmendmentPermissions} from './pd-amendments.models';
import {EtoolsRouter} from '@unicef-polymer/etools-utils/dist/singleton/router';
import {openDialog} from '@unicef-polymer/etools-utils/dist/dialog.util';
import {CommentsMixin} from '../../common/components/comments/comments-mixin';
import {AnyObject, AsyncAction, EtoolsEndpoint, LabelAndValue, Permission} from '@unicef-polymer/etools-types';
import {translate} from '@unicef-polymer/etools-unicef/src/etools-translate';
import {get as getTranslation} from '@unicef-polymer/etools-unicef/src/etools-translate';
import {getEndpoint} from '@unicef-polymer/etools-utils/dist/endpoint.util';
import {interventionEndpoints} from '../../utils/intervention-endpoints';
import {RequestEndpoint, sendRequest} from '@unicef-polymer/etools-utils/dist/etools-ajax/ajax-request';
import {getStore} from '@unicef-polymer/etools-utils/dist/store.util';
import {getIntervention, setShouldReGetList} from '../../common/actions/interventions';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import '@unicef-polymer/etools-unicef/src/etools-icon-button/etools-icon-button';
import './amendment-difference';
import {Environment} from '@unicef-polymer/etools-utils/dist/singleton/environment';
import {dataTableStylesLit} from '@unicef-polymer/etools-unicef/src/etools-data-table/styles/data-table-styles';

/**
 * @customElement
 */
@customElement('pd-amendments')
export class PdAmendments extends CommentsMixin(LitElement) {
  static get styles() {
    return [layoutStyles];
  }

  render() {
    return html`
      ${sharedStyles}
      <style>
        ${dataTableStylesLit} :host {
          display: block;
          width: 100%;
          -webkit-box-sizing: border-box;
          -moz-box-sizing: border-box;
          box-sizing: border-box;
          margin-bottom: 24px;
        }

        .attachment {
          color: var(--dark-icon-color);
          margin-inline-end: 8px;
        }
        .file-label {
          width: calc(100% - 32px);
        }
        .other-description {
          display: block;
          width: 100%;
        }
        *[slot='row-data'] {
          margin-top: 12px;
          margin-bottom: 12px;
        }
        div[slot='row-data'] {
          position: relative;
          padding: 12px 0;
          margin: 0;
        }
        etools-icon {
          --etools-icon-font-size: var(--etools-font-size-18, 18px);
          margin-inline-start: 5px;
        }
        a {
          line-height: 12px;
        }
        .label {
          margin-bottom: 5px;
          font-size: var(--etools-font-size-12, 12px);
          line-height: 16px;
          color: var(--secondary-text-color);
        }
        .value {
          font-size: var(--etools-font-size-16, 16px);
          line-height: 24px;
          color: var(--primary-text-color);
        }
        .info-block {
          margin: 15px 0;
          min-width: 110px;
        }
        .editable-row {
          line-height: 24px;
        }
        .row.padding-row {
          padding: 16px 24px;
          margin: 0;
        }
      </style>
      <etools-media-query
        query="(max-width: 1200px)"
        .queryMatches="${this.lowResolutionLayout}"
        @query-matches-changed="${(e: CustomEvent) => {
          this.lowResolutionLayout = e.detail.value;
        }}"
      ></etools-media-query>
      <etools-content-panel show-expand-btn panel-title=${translate('AMENDMENTS')} comment-element="amendments">
        <div slot="panel-btns">
          <etools-icon-button
            name="add-box"
            title=${translate('ADD_AMENDMENT')}
            @click="${() => this._showAddAmendmentDialog()}"
            ?hidden="${!this.intervention?.permissions?.edit.amendments}"
          >
          </etools-icon-button>
        </div>
        <div class="p-relative" id="amendments-wrapper">
          <etools-data-table-header
            id="listHeader"
            no-title
            ?hidden="${!this.amendments.length}"
            .lowResolutionLayout="${this.lowResolutionLayout}"
          >
            <etools-data-table-column class="col-2">${translate('REF')}</etools-data-table-column>
            <etools-data-table-column class="col-1">${translate('KIND')}</etools-data-table-column>
            <etools-data-table-column class="col-3">${translate('AMENDMENT_TYPES')}</etools-data-table-column>
            <etools-data-table-column class="col-2"> ${translate('SIGNED_UNICEF_DATE')} </etools-data-table-column>
            <etools-data-table-column class="col-2"> ${translate('SIGNED_PARTNER_DATE')} </etools-data-table-column>
            <etools-data-table-column class="col-2">${translate('STATUS')}</etools-data-table-column>
          </etools-data-table-header>

          ${this.amendments.map(
            (item: AnyObject) => html`
              <etools-data-table-row .lowResolutionLayout="${this.lowResolutionLayout}">
                <div slot="row-data" class="layout-horizontal editable-row">
                  <div class="col-data col-2" data-col-header-label="${translate('REF')}">${item.amendment_number}</div>

                  <span class="col-data col-1" data-col-header-label="${translate('KIND')}">
                    ${translate(AmendmentsKindTranslateKeys[item.kind as AmendmentsKind])}
                  </span>
                  <span class="col-data col-3" data-col-header-label="${translate('AMENDMENT_TYPES')}">
                    ${this._getReadonlyAmendmentTypes(item.types)}
                  </span>

                  <span class="col-data col-2" data-col-header-label="${translate('SIGNED_UNICEF_DATE')}">
                    ${prettyDate(item.signed_by_unicef_date) || html`&#8212;`}
                  </span>
                  <span class="col-data col-2" data-col-header-label="${translate('SIGNED_PARTNER_DATE')}">
                    ${prettyDate(item.signed_by_partner_date) || html`&#8212;`}
                  </span>
                  <span class="col-data col-2" data-col-header-label="${translate('STATUS')}">
                    ${item.is_active
                      ? html`
                          <a
                            class="layout-horizontal align-items-center"
                            href="${Environment.basePath}interventions/${item.amended_intervention}/metadata"
                          >
                            ${translate('ACTIVE')} <etools-icon name="launch"></etools-icon>
                          </a>
                        `
                      : translate('COMPLETED')}
                  </span>

                  <div class="hover-block" ?hidden="${!item.is_active}">
                    <etools-icon-button
                      name="delete"
                      @click="${() => this.deleteAmendment(item.id)}"
                    ></etools-icon-button>
                  </div>
                </div>

                <div slot="row-data-details">
                  <div class="info-block">
                    <div class="label">${translate('OTHER_INFO')}</div>
                    <div class="value">
                      ${this._showOtherInput(item.types) ? item.other_description || html`&#8212;` : html`&#8212;`}
                    </div>
                  </div>
                  <div class="info-block">
                    <div class="label">${translate('UNICEF_SIGNATORY')}</div>
                    <div class="value">${item.unicef_signatory?.name || html`&#8212;`}</div>
                  </div>
                  <div class="info-block">
                    <div class="label">${translate('PARTNER_AUTHORIZED_OFFICER_SIGNATORY')}</div>
                    <div class="value">${item.partner_authorized_officer_signatory?.user?.name || html`&#8212;`}</div>
                  </div>
                  <div class="info-block">
                    <div class="label">${translate('SIGNED_AMENDMENT')}</div>
                    <div class="value" ?hidden="${!item.signed_amendment_attachment}">
                      <etools-icon name="attachment" class="attachment"></etools-icon>
                      <span class="break-word file-label">
                        <a href="${item.signed_amendment_attachment}" target="_blank" download>
                          ${getFileNameFromURL(item.signed_amendment_attachment) || html`&#8212;`}
                        </a>
                      </span>
                    </div>
                    <div class="value" ?hidden="${item.signed_amendment_attachment}">&#8212;</div>
                  </div>

                  <div class="info-block">
                    <div class="label">${translate('DIFFERENCE')}</div>
                    <amendment-difference .difference="${item.difference}"></amendment-difference>
                  </div>
                </div>
              </etools-data-table-row>
            `
          )}
          <div class="row padding-row" ?hidden=${this.amendments.length}>
            <p>${translate('NO_AMENDMENTS_ADDED')}</p>
          </div>
        </div>
      </etools-content-panel>
    `;
  }

  @property({type: Array})
  amendments: AnyObject[] = [];

  @property({type: Array})
  filteredAmendmentTypes!: LabelAndValue[];

  @property({type: Array})
  amendmentTypes!: LabelAndValue[];

  @property({type: Object})
  permissions!: Permission<PdAmendmentPermissions>;

  @property({type: Object})
  intervention!: AnyObject;

  @property({type: Boolean})
  lowResolutionLayout = false;

  stateChanged(state: RootState) {
    if (
      EtoolsRouter.pageIsNotCurrentlyActive(get(state, 'app.routeDetails'), 'interventions', 'metadata') ||
      !state.interventions.current
    ) {
      return;
    }

    const amendmentTypes = get(state, 'commonData.interventionAmendmentTypes');
    if (amendmentTypes && !isJsonStrMatch(this.amendmentTypes, amendmentTypes)) {
      this.amendmentTypes = [...state.commonData!.interventionAmendmentTypes];
    }
    const currentIntervention = get(state, 'interventions.current');
    if (currentIntervention && !isJsonStrMatch(this.intervention, currentIntervention)) {
      this.intervention = cloneDeep(currentIntervention);
      this.amendments = this.intervention.amendments?.sort((a: any, b: any) => b.id - a.id);
    }
    this.setPermissions(state);
    super.stateChanged(state);
  }

  private setPermissions(state: any) {
    const permissions = selectAmendmentsPermissions(state);

    if (!isJsonStrMatch(this.permissions, permissions)) {
      this.permissions = permissions;
    }
  }

  _getReadonlyAmendmentTypes(types: string[]) {
    if (!types || !types.length) {
      return null;
    }
    const amdTypes = this.amendmentTypes.filter((t: AnyObject) => {
      return types.indexOf(t.value) > -1;
    });
    if (amdTypes.length) {
      const amdTypesLabels = amdTypes.map((t: AnyObject) => {
        return getTranslatedValue(t.label, 'AMENDMENT_TYPES_ITEMS');
      });
      return amdTypesLabels.join(', ');
    }
    return null;
  }

  _showAddAmendmentDialog() {
    openDialog({
      dialog: 'add-amendment-dialog',
      dialogData: {
        intervention: cloneDeep(this.intervention),
        amendmentTypes: this.amendmentTypes
      }
    }).then(({response}) => {
      if (response?.id) {
        getStore().dispatch(setShouldReGetList(true));
        history.pushState(window.history.state, '', `${Environment.basePath}interventions/${response.id}/metadata`);
        window.dispatchEvent(new CustomEvent('popstate'));
      }
    });
  }

  deleteAmendment(amendmentId: number): void {
    openDialog({
      dialog: 'are-you-sure',
      dialogData: {
        content: getTranslation('ARE_YOU_SURE_PROMPT') + getTranslation('DELETE_AMENDMENT_QUESTION'),
        confirmBtnText: 'delete'
      }
    }).then(({confirmed}) => {
      if (!confirmed) {
        return;
      }
      fireEvent(this, 'global-loading', {
        active: true,
        loadingSource: 'intervention-amendments'
      });
      const options = {
        method: 'DELETE',
        endpoint: getEndpoint<EtoolsEndpoint, RequestEndpoint>(interventionEndpoints.interventionAmendmentDelete, {
          amendmentId
        })
      };
      sendRequest(options)
        .then(() => {
          getStore().dispatch(setShouldReGetList(true));
          return getStore().dispatch<AsyncAction>(getIntervention(this.intervention.id));
        })
        .catch(() => {
          fireEvent(this, 'toast', {text: getTranslation('CAN_NOT_REMOVE_AMENDMENT')});
        })
        .finally(() => {
          fireEvent(this, 'global-loading', {
            active: false,
            loadingSource: 'intervention-amendments'
          });
        });
    });
  }

  _showOtherInput(types: string[]) {
    return types?.includes('other') || false;
  }
}
