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

export const ActionNamesMap: {[key: string]: {text: string; textKey: string}} = {
  [EXPORT_COMMENTS]: {text: getTranslation('EXPORT_COMMENTS'), textKey: 'EXPORT_COMMENTS'},
  [EXPORT_PDF]: {text: getTranslation('EXPORT_PDF'), textKey: 'EXPORT_PDF'},
  [EXPORT_XLS]: {text: getTranslation('EXPORT_XLS'), textKey: 'EXPORT_XLS'},
  [EXPORT_RESULTS]: {text: getTranslation('EXPORT_RESULTS'), textKey: 'EXPORT_RESULTS'},
  [SEND_TO_PARTNER]: {text: getTranslation('SEND_TO_PARTNER'), textKey: 'SEND_TO_PARTNER'},
  [SEND_TO_UNICEF]: {text: getTranslation('SEND_TO_UNICEF'), textKey: 'SEND_TO_UNICEF'},
  [UNLOCK]: {text: getTranslation('UNLOCK'), textKey: 'UNLOCK'},
  [ACCEPT]: {text: getTranslation('ACCEPT_AS_FINAL'), textKey: 'ACCEPT_AS_FINAL'},
  [REVIEW]: {text: getTranslation('SEND_FOR_REVIEW'), textKey: 'SEND_FOR_REVIEW'},
  [CANCEL]: {text: getTranslation('GENERAL.CANCEL'), textKey: 'GENERAL.CANCEL'},
  [SIGN]: {text: getTranslation('SIGN'), textKey: 'SIGN'},
  [SIGN_BUDGET_OWNER]: {text: getTranslation('SIGN_BUDGET_OWNER'), textKey: 'SIGN_BUDGET_OWNER'},
  [TERMINATE]: {text: getTranslation('TERMINATE'), textKey: 'TERMINATE'},
  [REJECT_REVIEW]: {text: getTranslation('REJECT_REVIEW'), textKey: 'REJECT_REVIEW'},
  [ACCEPT_ON_BEHALF_OF_PARTNER]: {
    text: getTranslation('ACCEPT_ON_BEHALF_OF_PARTNER'),
    textKey: 'ACCEPT_ON_BEHALF_OF_PARTNER'
  },
  [SEND_BACK_REVIEW]: {text: getTranslation('SEND_BACK_REVIEW'), textKey: 'SEND_BACK_REVIEW'}
};
