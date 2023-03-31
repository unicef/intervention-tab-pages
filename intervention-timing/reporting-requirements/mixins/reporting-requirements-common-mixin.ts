import {getEndpoint} from '@unicef-polymer/etools-utils/dist/endpoint.util';
import {interventionEndpoints} from '../../../utils/intervention-endpoints';
import {EtoolsRequestEndpoint, sendRequest} from '@unicef-polymer/etools-ajax/etools-ajax-request';
import CONSTANTS from '../../../common/constants';
import {logError} from '@unicef-polymer/etools-behaviors/etools-logging';
import {parseRequestErrorsAndShowAsToastMsgs} from '@unicef-polymer/etools-ajax/ajax-error-parser';
import {LitElement, property} from 'lit-element';
import {isEmptyObject} from '@unicef-polymer/etools-utils/dist/general.util';
import {Constructor, EtoolsEndpoint} from '@unicef-polymer/etools-types';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import {prettyDate} from '@unicef-polymer/etools-utils/dist/date.util';
import {updatePartnerReportingRequirements} from '../../../common/actions/interventions';
import {getStore} from '@unicef-polymer/etools-utils/dist/store.util';

/**
 * @polymer
 * @mixinFunction
 * @appliesMixin EndpointsMixin
 */
function ReportingRequirementsCommonMixin<T extends Constructor<LitElement>>(baseClass: T) {
  class ReportingRequirementsCommon extends baseClass {
    _reportingRequirements: any[] = [];

    get reportingRequirements() {
      return this._reportingRequirements;
    }
    set reportingRequirements(reportingRequirements) {
      this._reportingRequirements = reportingRequirements;
      fireEvent(this, 'reporting-requirements-loaded');
      this._countReportingReq(this._reportingRequirements.length);
    }

    @property({type: Number})
    requirementsCount = 0;

    _interventionId!: number;

    set interventionId(interventionId) {
      this._interventionId = interventionId;
      this._interventionIdChanged(interventionId);
    }

    @property({type: Number})
    get interventionId() {
      return this._interventionId;
    }

    _getEndpointObj(id: number, type: string) {
      if (type === CONSTANTS.REQUIREMENTS_REPORT_TYPE.SPECIAL) {
        return getEndpoint<EtoolsEndpoint, EtoolsRequestEndpoint>(interventionEndpoints.specialReportingRequirements, {
          intervId: id
        });
      }

      return getEndpoint<EtoolsEndpoint, EtoolsRequestEndpoint>(interventionEndpoints.reportingRequirements, {
        intervId: id,
        reportType: type
      });
    }

    _interventionIdChanged(newId: number) {
      if (!newId) {
        this.reportingRequirements = [];
        return;
      }
      // @ts-ignore *Defined in the component
      const type = this._getReportType();
      const endpoint = this._getEndpointObj(newId, type);
      sendRequest({method: 'GET', endpoint: endpoint})
        .then((response: any) => {
          this.reportingRequirements =
            CONSTANTS.REQUIREMENTS_REPORT_TYPE.SPECIAL == type ? response : response.reporting_requirements;
          this._countReportingReq(this.reportingRequirements.length);
          this.updateReportingRequirements(response, type);
        })
        .catch((error: any) => {
          logError('Failed to get qpr data from API!', 'reporting-requirements-common-mixin', error);
          parseRequestErrorsAndShowAsToastMsgs(error, this);
        });
    }

    _countReportingReq(length: number) {
      const l = typeof length === 'number' ? length : 0;
      this.requirementsCount = l;
      fireEvent(this, 'count-changed', {
        count: this.requirementsCount
      });
      // @ts-ignore *Defined in the component
      if (typeof this._sortRequirementsAsc === 'function' && l > 0) {
        // @ts-ignore *Defined in the component
        this._sortRequirementsAsc();
      }
    }

    _getIndex(index: number) {
      return index + 1;
    }

    _empty(list: any[]) {
      return isEmptyObject(list);
    }

    _onReportingRequirementsSaved(reportingRequirements: any[]) {
      this.reportingRequirements = reportingRequirements;
      this.requestUpdate();
    }

    getDateDisplayValue(dateString: string) {
      const formatedDate = prettyDate(dateString);
      return formatedDate ? formatedDate : '-';
    }

    updateReportingRequirements(reportingRequirements: any, type: string) {
      const requirements = getStore().getState().interventions.partnerReportingRequirements;

      switch (type) {
        case CONSTANTS.REQUIREMENTS_REPORT_TYPE.SPECIAL: {
          requirements.special = reportingRequirements;
          break;
        }
        case CONSTANTS.REQUIREMENTS_REPORT_TYPE.QPR: {
          requirements.qpr = reportingRequirements.reporting_requirements || reportingRequirements;
          break;
        }
        case CONSTANTS.REQUIREMENTS_REPORT_TYPE.HR: {
          requirements.hr = reportingRequirements.reporting_requirements || reportingRequirements;
          break;
        }
        case CONSTANTS.REQUIREMENTS_REPORT_TYPE.SR: {
          requirements.sr = reportingRequirements;
          break;
        }
      }
      getStore().dispatch(updatePartnerReportingRequirements(requirements));
    }
  }
  return ReportingRequirementsCommon;
}

export default ReportingRequirementsCommonMixin;
