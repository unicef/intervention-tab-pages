import {GenericObject} from '@unicef-polymer/etools-types';
import {get as getTranslation} from 'lit-translate';

const EXPORT_COMMENTS = 'download_comments';
const EXPORT_CSV = 'export';
const EXPORT_PDF = 'generate_pdf';

const SEND_TO_PARTNER = 'send_to_partner';
const SEND_TO_UNICEF = 'send_to_unicef';
const UNLOCK = 'unlock';
const SIGN = 'sign';

const ACCEPT = 'accept';
const REVIEW = 'review';
export const CANCEL = 'cancel';
export const TERMINATE = 'terminate';
const REJECT_REVIEW = 'reject_review';

export const EXPORT_ACTIONS = [EXPORT_CSV, EXPORT_PDF, EXPORT_COMMENTS];
export const BACK_ACTIONS = [SEND_TO_PARTNER, SEND_TO_UNICEF, UNLOCK, REJECT_REVIEW];
export const ACTIONS_WITH_INPUT = [CANCEL, TERMINATE];

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
  [SIGN]: getTranslation('SIGN')
};
