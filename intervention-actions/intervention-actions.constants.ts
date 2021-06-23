import {GenericObject} from '@unicef-polymer/etools-types';
import {get as getTranslation} from 'lit-translate';

const EXPORT_COMMENTS = 'download_comments';
const EXPORT_CSV = 'export';
const EXPORT_PDF = 'generate_pdf';

export const SEND_TO_PARTNER = 'send_to_partner';
export const SEND_TO_UNICEF = 'send_to_unicef';
const UNLOCK = 'unlock';
export const SIGN = 'sign';

const ACCEPT = 'accept';
export const REVIEW = 'review';
export const PRC_REVIEW = 'individual_review';
export const CANCEL = 'cancel';
export const ACCEPT_REVIEW = 'accept_review';
export const SIGNATURE = 'signature';
export const AMENDMENT_MERGE = 'amendment_merge';
export const TERMINATE = 'terminate';
export const REJECT_REVIEW = 'reject_review';
export const ACCEPT_ON_BEHALF_OF_PARTNER = 'accept_on_behalf_of_partner';

export const EXPORT_ACTIONS = [EXPORT_CSV, EXPORT_PDF, EXPORT_COMMENTS];
export const BACK_ACTIONS = [SEND_TO_PARTNER, SEND_TO_UNICEF, UNLOCK, REJECT_REVIEW];
export const ACTIONS_WITH_INPUT = [
  CANCEL,
  TERMINATE,
  REVIEW,
  PRC_REVIEW,
  REJECT_REVIEW,
  SIGN,
  ACCEPT_ON_BEHALF_OF_PARTNER
];
export const ACTIONS_WITHOUT_CONFIRM = [PRC_REVIEW, REJECT_REVIEW, SIGN];

export const namesMap: GenericObject<string> = {
  [EXPORT_COMMENTS]: getTranslation('EXPORT_COMMENTS'),
  [EXPORT_CSV]: getTranslation('EXPORT_CSV'),
  [EXPORT_PDF]: getTranslation('EXPORT_PDF'),
  [SEND_TO_PARTNER]: getTranslation('SEND_TO_PARTNER'),
  [SEND_TO_UNICEF]: getTranslation('SEND_TO_UNICEF'),
  [UNLOCK]: getTranslation('UNLOCK'),
  [ACCEPT]: getTranslation('ACCEPT'),
  [REVIEW]: getTranslation('REVIEW'),
  [CANCEL]: getTranslation('GENERAL.CANCEL'),
  [TERMINATE]: getTranslation('TERMINATE'),
  [REJECT_REVIEW]: getTranslation('REJECT_REVIEW'),
  [ACCEPT_ON_BEHALF_OF_PARTNER]: getTranslation('ACCEPT_ON_BEHALF_OF_PARTNER')
};
