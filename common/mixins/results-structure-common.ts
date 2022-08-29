import {AsyncAction} from '@unicef-polymer/etools-types/dist/global.types';
import {interventionEndpoints} from '../../utils/intervention-endpoints';
import {getIntervention} from '../actions/interventions';
import {sendRequest} from '@unicef-polymer/etools-ajax';
import {formatServerErrorAsText} from '@unicef-polymer/etools-ajax/ajax-error-parser';
import {getEndpoint} from '@unicef-polymer/etools-modules-common/dist/utils/endpoint-helper';
import {fireEvent} from '@unicef-polymer/etools-modules-common/dist/utils/fire-custom-event';
import {getStore} from '@unicef-polymer/etools-modules-common/dist/utils/redux-store-access';
import {Indicator, InterventionActivity, ResultLinkLowerResult} from '@unicef-polymer/etools-types';
import {convertDate} from '@unicef-polymer/etools-modules-common/dist/utils/date-utils';
import {openDialog} from '@unicef-polymer/etools-modules-common/dist/utils/dialog';
import {translate} from 'lit-translate';
import {InterventionActivityExtended} from '../types/editor-page-types';

function deactivateActivity(activityId: number, pdOutputId: number, interventionId: number) {
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
      fireEvent(document.body.querySelector('app-shell')!, 'toast', {text: formatServerErrorAsText(err)});
    });
}

function deleteActivity(activityId: number, pdOutputId: number, interventionId: number) {
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
      fireEvent(document.body.querySelector('app-shell')!, 'toast', {text: formatServerErrorAsText(err)});
    });
}

export function _canDeactivate(
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
    if (convertDate(item.created!, true)! <= convertDate(inAmendmentDate, true)!) {
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

export function _canDelete(
  item: Indicator | InterventionActivity | InterventionActivityExtended | ResultLinkLowerResult,
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
    if (convertDate(item.created!, true)! >= convertDate(inAmendmentDate, true)!) {
      return true;
    }
    return false;
  }
  if (interventionStatus === 'draft' || interventionStatus === 'development') {
    return true;
  }
  return false;
}

export async function openActivityDeactivationDialog(activityId: number, pdOutputId: number, interventionId: number) {
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
    deactivateActivity(Number(activityId), pdOutputId, interventionId);
  }
}

export async function openDeleteActivityDialog(activityId: number, pdOutputId: number, interventionId: number) {
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
    deleteActivity(activityId, pdOutputId, interventionId);
  }
}
