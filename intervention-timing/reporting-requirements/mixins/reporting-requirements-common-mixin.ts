import {getEndpoint} from '../../../utils/endpoint-helper';
import {interventionEndpoints} from '../../../utils/intervention-endpoints';
import {sendRequest} from '@unicef-polymer/etools-ajax/etools-ajax-request';
import CONSTANTS from '../../../common/constants';
import {logError} from '@unicef-polymer/etools-behaviors/etools-logging';
import {parseRequestErrorsAndShowAsToastMsgs} from '@unicef-polymer/etools-ajax/ajax-error-parser';
import {PolymerElement} from '@polymer/polymer';
import {property} from '@polymer/decorators';
import {Constructor} from '../../../common/models/globals.types';
import {isEmptyObject} from '../../../utils/utils';

/**
 * @polymer
 * @mixinFunction
 * @appliesMixin EndpointsMixin
 */
function ReportingRequirementsCommonMixin<T extends Constructor<PolymerElement>>(baseClass: T) {
  class ReportingRequirementsCommon extends baseClass {
    @property({type: Array})
    reportingRequirements: [] = [];

    @property({type: Number, notify: true})
    requirementsCount = 0;

    @property({type: Number, observer: '_interventionIdChanged'})
    interventionId!: number;

    static get observers() {
      return ['_countReportingReq(reportingRequirements.length)'];
    }

    _getEndpointObj(id: string, type: string) {
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

    _interventionIdChanged(newId: string) {
      if (!newId) {
        this.reportingRequirements = [];
        return;
      }
      // @ts-ignore *Defined in the component
      const type = this._getReportType();
      const endpoint = this._getEndpointObj(newId, type);
      sendRequest({method: 'GET', endpoint: endpoint})
        .then((response: any) => {
          this.set(
            'reportingRequirements',
            type === CONSTANTS.REQUIREMENTS_REPORT_TYPE.SPECIAL ? response : response.reporting_requirements
          );
        })
        .catch((error: any) => {
          logError('Failed to get qpr data from API!', 'reporting-requirements-common-mixin', error);
          parseRequestErrorsAndShowAsToastMsgs(error, this);
        });
    }

    _countReportingReq(length: number) {
      const l = typeof length === 'number' ? length : 0;
      this.set('requirementsCount', l);
      // @ts-ignore *Defined in the component
      if (typeof this._sortRequirementsAsc === 'function' && l > 0) {
        // @ts-ignore *Defined in the component
        this._sortRequirementsAsc();
      }
    }

    _getIndex(index: number) {
      return index + 1;
    }

    _empty(list: []) {
      return isEmptyObject(list);
    }

    _onReportingRequirementsSaved(e: CustomEvent) {
      this.set('reportingRequirements', e.detail);
    }
  }
  return ReportingRequirementsCommon;
}

export default ReportingRequirementsCommonMixin;
