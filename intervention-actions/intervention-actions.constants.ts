import {GenericObject} from '../common/models/globals.types';

const EXPORT_COMMENTS = 'download_comments';
const EXPORT_CSV = 'export';
const EXPORT_PDF = 'generate_pdf';

const SEND_TO_PARTNER = 'send_to_partner';
const SEND_TO_UNICEF = 'send_to_unicef';
const UNLOCK = 'unlock';

const ACCEPT = 'accept';
const REVIEW = 'review';
const SIGNATURE = 'signature';
export const CANCEL = 'cancel';
const ACCEPT_AND_REVIEW = 'accept_and_review';

export const EXPORT_ACTIONS = [EXPORT_CSV, EXPORT_PDF, EXPORT_COMMENTS];
export const BACK_ACTIONS = [SEND_TO_PARTNER, SEND_TO_UNICEF, UNLOCK];
export const ACTIONS_WITH_COMMENT = [CANCEL, SEND_TO_UNICEF, SEND_TO_PARTNER];

export const namesMap: GenericObject<string> = {
  [EXPORT_COMMENTS]: 'Export Comments',
  [EXPORT_CSV]: 'Export CSV',
  [EXPORT_PDF]: 'Export PDF',
  [SEND_TO_PARTNER]: 'Send To Partner',
  [SEND_TO_UNICEF]: 'Send To Unicef',
  [UNLOCK]: 'Unlock',
  [ACCEPT]: 'Accept',
  [ACCEPT_AND_REVIEW]: 'Accept and Review',
  [REVIEW]: 'Review',
  [SIGNATURE]: 'Ready for Signature',
  [CANCEL]: 'Cancel'
};
