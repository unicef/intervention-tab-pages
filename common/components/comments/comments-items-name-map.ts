import {GenericObject} from '@unicef-polymer/etools-types';
import {translatesMap} from '../../../utils/intervention-labels-map';
import {TABS} from '../../constants';

export const CommentsItemsNameMap: GenericObject<string> = {
  attachments: 'ATTACHMENTS',
  'prc-document': 'PRC_REVIEW_DOC_TITLE',
  amendments: 'AMENDMENTS',
  details: 'DETAILS',
  financial: 'FINANCIAL',
  'fund-reservations': 'FUND_RESERVATIONS',
  'other-metadata': 'OTHER',
  'partner-details': 'PARTNER_DETAILS',
  'signatures-and-dates': 'SIGNATURES_DATES',
  'unicef-details': 'UNICEF_DETAILS',
  'document-details': 'DOCUMENT_DETAILS',
  'gender-equity-sustainability': 'GENDER_EQUITY_SUSTAINABILITY',
  'geographical-coverage': 'GEOGRAPHICAL_COVERAGE',
  risks: translatesMap.risks,
  'activity-timeframes': 'ACTIVITY_TIMEFRAMES',
  'programme-document-dates': 'PROGRAMME_DOC_DATES',
  'programmatic-visits': 'PROGRAMATIC_VISITS',
  'timing-overview': 'OVERVIEW',
  'pd-output': 'PD_OUTPUT',
  activity: 'ACTIVITY',
  'budget-summary': 'BUDGET_SUMMARY',
  'programme-management': translatesMap.management_budgets,
  'capacity-strengthening-costs': 'CAPACITY_STRENGTHENING_COST',
  'non-financial-contribution': 'PARTNER_NON_FINANCIAL_CONTRIBUTION',
  'supply-agreement': translatesMap.supply_items,
  indicator: 'INDICATOR',
  prp: 'PARTNER_REPORTING_REQUIREMENTS',
  eepm: 'EFFECTIVE_EFFICIENT_PROG_MGM',
  'programme-management-item': 'PROGRAMME_MANAGEMENT_ITEM',
  'activity-item': 'ACTIVITY_ITEM',
  'other-info': 'IMPORT_INFO'
};

export const CommentsDescription: GenericObject<string> = {
  attachments: 'ATTACHMENTS_DESCRIPTION',
  'prc-document': 'PRC_REVIEW_DOC_DESCRIPTION',
  amendments: 'AMENDMENTS_DESCRIPTION',
  details: 'DETAILS_DESCRIPTION',
  financial: 'FINANCIAL_DESCRIPTION',
  'fund-reservations': 'FUND_RESERVATIONS_DESCRIPTION',
  'other-metadata': 'OTHER_DESCRIPTION',
  'partner-details': 'PARTNER_DETAILS_DESCRIPTION',
  'signatures-and-dates': 'SIGNATURES_DATES_DESCRIPTION',
  'unicef-details': 'UNICEF_DETAILS_DESCRIPTION',
  'document-details': 'DOCUMENT_DETAILS_DESCRIPTION',
  'gender-equity-sustainability': 'GENDER_EQUITY_SUSTAINABILITY_DESCRIPTION',
  'geographical-coverage': 'GEOGRAPHICAL_COVERAGE_DESCRIPTION',
  risks: `${translatesMap.risks}_DESCRIPTION`,
  'activity-timeframes': 'ACTIVITY_TIMEFRAMES_DESCRIPTION',
  'programme-document-dates': 'PROGRAMME_DOC_DATES_DESCRIPTION',
  'programmatic-visits': 'PROGRAMATIC_VISITS_DESCRIPTION',
  'timing-overview': 'OVERVIEW_DESCRIPTION',
  'budget-summary': 'BUDGET_SUMMARY_DESCRIPTION',
  'programme-management': `${translatesMap.management_budgets}_DESCRIPTION`,
  'capacity-strengthening-costs': 'CAPACITY_STRENGTHENING_COST_DESCRIPTION',
  'non-financial-contribution': 'PARTNER_NON_FINANCIAL_CONTRIBUTION_DESCRIPTION',
  'supply-agreement': `${translatesMap.supply_items}_DESCRIPTION`,
  'other-info': 'IMPORT_INFO_DESCRIPTION',
  'eepm-1': 'TITLE_1',
  'eepm-2': 'TITLE_2',
  'eepm-3': 'TITLE_3'
};

export const ComponentsPosition: GenericObject<string> = {
  attachments: TABS.Attachments,
  'prc-document': TABS.Attachments,
  amendments: TABS.Metadata,
  details: TABS.Metadata,
  financial: TABS.Metadata,
  'fund-reservations': TABS.Metadata,
  'other-metadata': TABS.Metadata,
  'partner-details': TABS.Metadata,
  'signatures-and-dates': TABS.Metadata,
  'unicef-details': TABS.Metadata,
  'document-details': TABS.Strategy,
  'gender-equity-sustainability': TABS.Strategy,
  'geographical-coverage': TABS.Strategy,
  risks: TABS.Strategy,
  'activity-timeframes': TABS.Timing,
  'programme-document-dates': TABS.Timing,
  'programmatic-visits': TABS.Timing,
  'timing-overview': TABS.Timing,
  'pd-output': TABS.Workplan,
  activity: TABS.Workplan,
  'budget-summary': TABS.Workplan,
  'programme-management': TABS.Workplan,
  'capacity-strengthening-costs': TABS.Workplan,
  'non-financial-contribution': TABS.Workplan,
  'supply-agreement': TABS.Workplan,
  indicator: TABS.Workplan,
  prp: TABS.Timing,
  eepm: TABS.Workplan,
  'programme-management-item': TABS.WorkplanEditor,
  'activity-item': TABS.WorkplanEditor,
  'other-info': TABS.Metadata
};
