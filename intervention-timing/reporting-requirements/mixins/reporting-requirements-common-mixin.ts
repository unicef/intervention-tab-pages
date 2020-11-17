import {getEndpoint} from '../../../utils/endpoint-helper';
import {interventionEndpoints} from '../../../utils/intervention-endpoints';
import {sendRequest} from '@unicef-polymer/etools-ajax/etools-ajax-request';
import CONSTANTS from '../../../common/constants';
import {logError} from '@unicef-polymer/etools-behaviors/etools-logging';
import {parseRequestErrorsAndShowAsToastMsgs} from '@unicef-polymer/etools-ajax/ajax-error-parser';
import {LitElement, property} from 'lit-element';
import {isEmptyObject} from '../../../utils/utils';
import {Constructor} from '@unicef-polymer/etools-types';

/**
 * @polymer
 * @mixinFunction
 * @appliesMixin EndpointsMixin
 */
function ReportingRequirementsCommonMixin<T extends Constructor<LitElement>>(baseClass: T) {
  class ReportingRequirementsCommon extends baseClass {
    @property({type: Array})
    reportingRequirements: [] = [];

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

    // static get observers() {
    //   return ['_countReportingReq(reportingRequirements.length)'];
    // } move to element

    _getEndpointObj(id: number, type: string) {
      if (type === CONSTANTS.REQUIREMENTS_REPORT_TYPE.SPECIAL) {
        return getEndpoint(interventionEndpoints.specialReportingRequirements, {
          intervId: id
        });
      }

      return getEndpoint(interventionEndpoints.reportingRequirements, {
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
          this.reportingRequirements = CONSTANTS.REQUIREMENTS_REPORT_TYPE.SPECIAL
            ? response
            : response.reporting_requirements;
          console.log('here mutherfucker');
          this._countReportingReq(this.reportingRequirements.length);
        })
        .catch((error: any) => {
          logError('Failed to get qpr data from API!', 'reporting-requirements-common-mixin', error);
          parseRequestErrorsAndShowAsToastMsgs(error, this);
        });
    }

    _countReportingReq(length: number) {
      const l = typeof length === 'number' ? length : 0;
      this.requirementsCount = 1;
      // @ts-ignore *Defined in the component
      if (typeof this._sortRequirementsAsc === 'function' && l > 0) {
        console.log('do the stuff');
        // @ts-ignore *Defined in the component
        this._sortRequirementsAsc();
      }
    }

    _getIndex(index: number) {
      return index + 1;
    }

    _empty(list: []) {
      console.log(list);
      return isEmptyObject(list);
    }

    _onReportingRequirementsSaved(e: CustomEvent) {
      // this.set('reportingRequirements', e.detail);
      this.reportingRequirements = e.detail;
    }
  }
  return ReportingRequirementsCommon;
}

export default ReportingRequirementsCommonMixin;
