import {LitElement, html, property, customElement} from 'lit-element';
import '@polymer/iron-icons/iron-icons';
import '@polymer/paper-icon-button/paper-icon-button';
import '@unicef-polymer/etools-content-panel/etools-content-panel';
import '@unicef-polymer/etools-data-table/etools-data-table';
import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';
import {gridLayoutStylesLit} from '@unicef-polymer/etools-modules-common/dist/styles/grid-layout-styles-lit';
import './add-amendment-dialog';
import '@unicef-polymer/etools-modules-common/dist/layout/are-you-sure';
import get from 'lodash-es/get';
import cloneDeep from 'lodash-es/cloneDeep';
import {RootState} from '../../common/types/store.types';
import {prettyDate} from '@unicef-polymer/etools-modules-common/dist/utils/date-utils';
import {getFileNameFromURL, isJsonStrMatch} from '@unicef-polymer/etools-modules-common/dist/utils/utils';
import {selectAmendmentsPermissions} from './pd-amendments.selectors';
import {AmendmentsKind, AmendmentsKindTranslateKeys, PdAmendmentPermissions} from './pd-amendments.models';
import {pageIsNotCurrentlyActive} from '@unicef-polymer/etools-modules-common/dist/utils/common-methods';
import {openDialog} from '@unicef-polymer/etools-modules-common/dist/utils/dialog';
import {CommentsMixin} from '../../common/components/comments/comments-mixin';
import {AnyObject, AsyncAction, LabelAndValue, Permission} from '@unicef-polymer/etools-types';
import {translate} from 'lit-translate';
import {ROOT_PATH} from '@unicef-polymer/etools-modules-common/dist/config/config';
import {get as getTranslation} from 'lit-translate/util';
import {getEndpoint} from '@unicef-polymer/etools-modules-common/dist/utils/endpoint-helper';
import {interventionEndpoints} from '../../utils/intervention-endpoints';
import {sendRequest} from '@unicef-polymer/etools-ajax/etools-ajax-request';
import {getStore} from '@unicef-polymer/etools-modules-common/dist/utils/redux-store-access';
import {getIntervention} from '../../common/actions/interventions';
import {fireEvent} from '@unicef-polymer/etools-modules-common/dist/utils/fire-custom-event';
import './amendment-difference';

/**
 * @customElement
 */
@customElement('pd-amendments')
export class PdAmendments extends CommentsMixin(LitElement) {
  static get styles() {
    return [gridLayoutStylesLit];
  }

  render() {
    return html`
      ${sharedStyles}
      <style>
        :host {
          display: block;
          width: 100%;
          -webkit-box-sizing: border-box;
          -moz-box-sizing: border-box;
          box-sizing: border-box;
          margin-bottom: 24px;
        }

        .attachment {
          color: var(--dark-icon-color);
          margin-right: 8px;
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
        iron-icon {
          width: 18px;
          margin-left: 5px;
        }
        a {
          line-height: 12px;
        }
        .label {
          margin-bottom: 5px;
          font-size: 12px;
          line-height: 16px;
          color: var(--secondary-text-color);
        }
        .value {
          font-size: 16px;
          line-height: 24px;
          color: var(--primary-text-color);
        }
        .info-block {
          margin: 15px 0;
          min-width: 110px;
        }
        .static-column {
          flex: 1;
          max-width: 150px;
        }
      </style>

      <etools-content-panel
        show-expand-btn
        panel-title=${translate('AMENDMENTS')}
        comment-element="amendments"
        comment-description=${translate('AMENDMENTS')}
      >
        <div slot="panel-btns">
          <paper-icon-button
            icon="add-box"
            title=${translate('ADD_AMENDMENT')}
            @click="${() => this._showAddAmendmentDialog()}"
            ?hidden="${!this.intervention?.permissions?.edit.amendments}"
          >
          </paper-icon-button>
        </div>
        <div class="p-relative" id="amendments-wrapper">
          <etools-data-table-header id="listHeader" no-title ?hidden="${!this.amendments.length}">
            <etools-data-table-column class="static-column">${translate('REF')}</etools-data-table-column>
            <etools-data-table-column class="static-column">${translate('KIND')}</etools-data-table-column>
            <etools-data-table-column class="flex-1">${translate('AMENDMENT_TYPES')}</etools-data-table-column>
            <etools-data-table-column class="static-column">
              ${translate('SIGNED_UNICEF_DATE')}
            </etools-data-table-column>
            <etools-data-table-column class="static-column">
              ${translate('SIGNED_PARTNER_DATE')}
            </etools-data-table-column>
            <etools-data-table-column class="static-column">${translate('STATUS')}</etools-data-table-column>
          </etools-data-table-header>

          ${this.amendments.map(
            (item: AnyObject) => html`
              <etools-data-table-row>
                <div slot="row-data" class="layout-horizontal editable-row">
                  <div class="static-column">${item.amendment_number}</div>

                  <span class="static-column">
                    ${translate(AmendmentsKindTranslateKeys[item.kind as AmendmentsKind])}
                  </span>
                  <span class="flex-1"> ${this._getReadonlyAmendmentTypes(item.types)} </span>

                  <span class="static-column"> ${prettyDate(item.signed_by_unicef_date) || html`&#8212;`} </span>
                  <span class="static-column"> ${prettyDate(item.signed_by_partner_date) || html`&#8212;`} </span>
                  <span class="static-column">
                    ${item.is_active
                      ? html`
                          <a
                            class="layout-horizontal align-items-center"
                            href="${ROOT_PATH}interventions/${item.amended_intervention}/metadata"
                          >
                            Active <iron-icon icon="launch"></iron-icon>
                          </a>
                        `
                      : 'Completed'}
                  </span>

                  <div class="hover-block" ?hidden="${!item.is_active}">
                    <paper-icon-button
                      icon="delete"
                      @click="${() => this.deleteAmendment(item.id, item.amended_intervention)}"
                    ></paper-icon-button>
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
                    <div class="value">${item.partner_authorized_officer_signatory?.user.name || html`&#8212;`}</div>
                  </div>
                  <div class="info-block">
                    <div class="label">${translate('SIGNED_AMENDMENT')}</div>
                    <div class="value" ?hidden="${!item.signed_amendment_attachment}">
                      <iron-icon icon="attachment" class="attachment"></iron-icon>
                      <span class="break-word file-label">
                        <a href="${item.signed_amendment_attachment}" target="_blank" download>
                          ${getFileNameFromURL(item.signed_amendment_attachment) || html`&#8212;`}
                        </a>
                      </span>
                    </div>
                    <div class="value" ?hidden="${item.signed_amendment_attachment}">&#8212;</div>
                  </div>

                  <div class="info-block">
                    <div class="label">Difference</div>
                    <amendment-difference .difference="${item.difference}"></amendment-difference>
                  </div>
                </div>
              </etools-data-table-row>
            `
          )}
          <div class="row-h" ?hidden=${this.amendments.length}>
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
  isNewAmendment = false;

  stateChanged(state: RootState) {
    if (
      pageIsNotCurrentlyActive(get(state, 'app.routeDetails'), 'interventions', 'metadata') ||
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
      this.amendments = this.intervention.amendments;
      if (this.isNewAmendment) {
        this.isNewAmendment = false;
        fireEvent(this, 'amendment-added', currentIntervention);
      }
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
        return t.label;
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
        this.isNewAmendment = true;
        history.pushState(window.history.state, '', `${ROOT_PATH}interventions/${response.id}/metadata`);
        window.dispatchEvent(new CustomEvent('popstate'));
      }
    });
  }

  deleteAmendment(amendmentId: number, amended_intervention: number): void {
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
        endpoint: getEndpoint(interventionEndpoints.interventionAmendmentDelete, {amendmentId})
      };
      sendRequest(options)
        .then(() => {
          fireEvent(this, 'amendment-deleted', {id: amended_intervention});
          return getStore().dispatch<AsyncAction>(getIntervention(this.intervention.id));
        })
        .catch(() => {
          fireEvent(this, 'toast', {text: 'Can not remove amendment. Try again later'});
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
