import {AsyncAction, Constructor} from '@unicef-polymer/etools-types/dist/global.types';
import {LitElement} from 'lit-element';
import {interventionEndpoints} from '../../utils/intervention-endpoints';
import {getIntervention} from '../actions/interventions';
import {sendRequest} from '@unicef-polymer/etools-ajax';
import {formatServerErrorAsText} from '@unicef-polymer/etools-ajax/ajax-error-parser';
import {getEndpoint} from '@unicef-polymer/etools-modules-common/dist/utils/endpoint-helper';
import {fireEvent} from '@unicef-polymer/etools-modules-common/dist/utils/fire-custom-event';
import {getStore} from '@unicef-polymer/etools-modules-common/dist/utils/redux-store-access';
import {Indicator, InterventionActivity} from '@unicef-polymer/etools-types';
import {convertDate} from '@unicef-polymer/etools-modules-common/dist/utils/date-utils';
import {openDialog} from '@unicef-polymer/etools-modules-common/dist/utils/dialog';
import {translate} from 'lit-translate';
import {InterventionActivityExtended} from '../types/editor-page-types';

export function ActivitiesIndicatorsMixin<T extends Constructor<LitElement>>(baseClass: T) {
  return class ActivitiesIndicatorsClass extends baseClass {
    deactivateActivity(activityId: number, pdOutputId: number, interventionId: number) {
      const endpoint = getEndpoint(interventionEndpoints.pdActivityDetails, {
        activityId: activityId,
        interventionId: interventionId,
        pdOutputId: pdOutputId
      });
      sendRequest({
        method: 'PATCH',
        endpoint: endpoint,
        body: {
          is_active: false
        }
      })
        .then(() => {
          getStore().dispatch<AsyncAction>(getIntervention());
        })
        .catch((err: any) => {
          fireEvent(this, 'toast', {text: formatServerErrorAsText(err)});
        });
    }

    deleteActivity(activityId: number, pdOutputId: number, interventionId: number) {
      const endpoint = getEndpoint(interventionEndpoints.pdActivityDetails, {
        activityId: activityId,
        interventionId: interventionId,
        pdOutputId: pdOutputId
      });
      sendRequest({
        method: 'DELETE',
        endpoint: endpoint
      })
        .then(() => {
          getStore().dispatch<AsyncAction>(getIntervention());
        })
        .catch((err: any) => {
          fireEvent(this, 'toast', {text: formatServerErrorAsText(err)});
        });
    }

    _canDeactivate(
      item: InterventionActivity | InterventionActivityExtended | Indicator,
      readonly: boolean,
      interventionStatus: string,
      inAmendment: boolean,
      inAmendmentDate: string
    ) {
      if (!readonly) {
        return false;
      }

      if (inAmendment) {
        if (!item.is_active) {
          return false;
        }
        if (convertDate(item.created, true)! <= convertDate(inAmendmentDate, true)!) {
          // Activities/Indicators created before amendment can only  be deactivated,
          // the ones created during amendment can be deleted
          return true;
        } else {
          return false;
        }
      }

      if (interventionStatus === 'draft' || interventionStatus === 'development') {
        return false;
      } else {
        if (item.is_active) {
          return true;
        }
      }
      return false;
    }

    _canDelete(
      item: Indicator | InterventionActivity | InterventionActivityExtended,
      readonly: boolean,
      interventionStatus: string,
      inAmendment: boolean,
      inAmendmentDate: string
    ): boolean {
      if (readonly) {
        return false;
      }
      if (inAmendment) {
        // if created during Amedment , it can be deleted, otherwise just deactivated
        if (convertDate(item.created, true)! >= convertDate(inAmendmentDate, true)!) {
          return true;
        }
        return false;
      }
      if (interventionStatus === 'draft' || interventionStatus === 'development') {
        return true;
      }
      return false;
    }

    async openActivityDeactivationDialog(activityId: number, pdOutputId: number, interventionId: number) {
      const confirmed = await openDialog({
        dialog: 'are-you-sure',
        dialogData: {
          content: translate('DEACTIVATE_ACTIVITY_PROMPT') as unknown as string,
          confirmBtnText: translate('DEACTIVATE') as unknown as string
        }
      }).then(({confirmed}) => {
        return confirmed;
      });

      if (confirmed) {
        this.deactivateActivity(Number(activityId), pdOutputId, interventionId);
      }
    }

    async openDeleteActivityDialog(activityId: number, pdOutputId: number, interventionId: number) {
      const confirmed = await openDialog({
        dialog: 'are-you-sure',
        dialogData: {
          content: translate('DELETE_ACTIVITY_PROMPT') as unknown as string,
          confirmBtnText: translate('GENERAL.DELETE') as unknown as string
        }
      }).then(({confirmed}) => {
        return confirmed;
      });

      if (confirmed) {
        this.deleteActivity(activityId, pdOutputId, interventionId);
      }
    }
  };
}
