import {GenericObject} from '@unicef-polymer/etools-types';

export const PRC_REVIEW = 'prc';
export const NON_PRC_REVIEW = 'non-prc';
export const NO_REVIEW = 'no-review';

export enum ReviewQuestionFields {
  relationshipIsRepresented = 'relationship_is_represented',
  partnerComparativeAdvantage = 'partner_comparative_advantage',
  relationshipsArePositive = 'relationships_are_positive',
  pdIsRelevant = 'pd_is_relevant',
  pdIsGuided = 'pd_is_guided',
  gesConsidered = 'ges_considered',
  budgetIsAligned = 'budget_is_aligned',
  supplyIssuesConsidered = 'supply_issues_considered'
}

export const REVIEW_QUESTIONS: Readonly<GenericObject<string>> = {
  [ReviewQuestionFields.relationshipIsRepresented]:
    // eslint-disable-next-line max-len
    'The proposed relationship is best represented and regulated by partnership (as opposed to procurement), with both UNICEF and the CSO making clear contributions to the PD/SPD',
  [ReviewQuestionFields.partnerComparativeAdvantage]:
    // eslint-disable-next-line max-len
    'The partner selection evidences the CSO’s comparative advantage and value for money in relation to the planned results',
  [ReviewQuestionFields.relationshipsArePositive]:
    'Previous UNICEF/UN relationships with the proposed CSO have been positive',
  [ReviewQuestionFields.pdIsRelevant]:
    // eslint-disable-next-line max-len
    'The proposed PD/SPD is relevant to achieving results in the country programme document, the relevant sector workplan and or humanitarian response plan',
  [ReviewQuestionFields.pdIsGuided]:
    'The results framework of the proposed PD/SPD has been guided by M&E feedback during the drafting process',
  [ReviewQuestionFields.gesConsidered]:
    'Gender, equity and sustainability have been considered in the programme design process',
  [ReviewQuestionFields.budgetIsAligned]:
    // eslint-disable-next-line max-len
    'The budget of the proposed PD/SPD is aligned with the principles of value for money with the effective and efficient programme management costs adhering to office defined limits',
  [ReviewQuestionFields.supplyIssuesConsidered]: 'The relevant supply issues have been duly considered'
};

export const REVIEW_ANSVERS: ReadonlyMap<string, string> = new Map([
  ['a', 'Yes, strongly agree'],
  ['b', 'Yes, agree'],
  ['c', 'No, disagree'],
  ['d', 'No, strongly disagree']
]);
