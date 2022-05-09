import {GenericObject} from '@unicef-polymer/etools-types';
import {get as getTranslation} from 'lit-translate';

const EXPORT_COMMENTS = 'download_comments';
const EXPORT_RESULTS = 'export_results';
const EXPORT_PDF = 'export_pdf';
const EXPORT_XLS = 'export_xls';

export const SEND_TO_PARTNER = 'send_to_partner';
export const SEND_TO_UNICEF = 'send_to_unicef';
export const UNLOCK = 'unlock';
export const SIGN = 'sign';
export const SIGN_BUDGET_OWNER = 'sign_budget_owner';

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
export const SEND_BACK_REVIEW = 'send_back_review';

export const EXPORT_ACTIONS = [EXPORT_PDF, EXPORT_XLS, EXPORT_COMMENTS, EXPORT_RESULTS];
export const BACK_ACTIONS = [SEND_TO_PARTNER, SEND_TO_UNICEF, UNLOCK, REJECT_REVIEW, SEND_BACK_REVIEW];
export const ACTIONS_WITH_INPUT = [
  CANCEL,
  TERMINATE,
  REVIEW,
  PRC_REVIEW,
  REJECT_REVIEW,
  SIGN,
  ACCEPT_ON_BEHALF_OF_PARTNER,
  SEND_BACK_REVIEW
];
export const ACTIONS_WITHOUT_CONFIRM = [PRC_REVIEW, REJECT_REVIEW, SIGN];

export const ActionNamesMap: GenericObject<string> = {
  [EXPORT_COMMENTS]: getTranslation('EXPORT_COMMENTS'),
  [EXPORT_PDF]: getTranslation('EXPORT_PDF'),
  [EXPORT_XLS]: getTranslation('EXPORT_XLS'),
  [EXPORT_RESULTS]: getTranslation('EXPORT_RESULTS'),
  [SEND_TO_PARTNER]: getTranslation('SEND_TO_PARTNER'),
  [SEND_TO_UNICEF]: getTranslation('SEND_TO_UNICEF'),
  [UNLOCK]: getTranslation('UNLOCK'),
  [ACCEPT]: getTranslation('ACCEPT'),
  [REVIEW]: getTranslation('SEND_FOR_REVIEW'),
  [CANCEL]: getTranslation('GENERAL.CANCEL'),
  [SIGN]: getTranslation('SIGN'),
  [SIGN_BUDGET_OWNER]: getTranslation('SIGN_BUDGET_OWNER'),
  [TERMINATE]: getTranslation('TERMINATE'),
  [REJECT_REVIEW]: getTranslation('REJECT_REVIEW'),
  [ACCEPT_ON_BEHALF_OF_PARTNER]: getTranslation('ACCEPT_ON_BEHALF_OF_PARTNER'),
  [SEND_BACK_REVIEW]: getTranslation('SEND_BACK_REVIEW')
};
