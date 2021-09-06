import {EtoolsEndpoint} from '@unicef-polymer/etools-types';

export interface EtoolsEndpoints {
  intervention: EtoolsEndpoint;
  interventionAction: EtoolsEndpoint;
  efaceAction: EtoolsEndpoint;
  partnerStaffMembers: EtoolsEndpoint;
  partnerAgreements: EtoolsEndpoint;
  specialReportingRequirements: EtoolsEndpoint;
  reportingRequirements: EtoolsEndpoint;
  specialReportingRequirementsUpdate: EtoolsEndpoint;
  monitoringVisits: EtoolsEndpoint;
  partnerT2fProgrammaticVisits: EtoolsEndpoint;
  partnerTPMActivities: EtoolsEndpoint;
  interventionTPMActivities: EtoolsEndpoint;
  resultLinks: EtoolsEndpoint;
  ramIndicators: EtoolsEndpoint;
  resultLinkGetDelete: EtoolsEndpoint;
  pdDetails: EtoolsEndpoint;
  createPd: EtoolsEndpoint;
  pdActivityDetails: EtoolsEndpoint;
  pdActivities: EtoolsEndpoint;
  interventionBudgetUpdate: EtoolsEndpoint;
  supplyAgreementAdd: EtoolsEndpoint;
  supplyAgreementEdit: EtoolsEndpoint;
  attachmentsUpload: EtoolsEndpoint;
  supplyItemsUpload: EtoolsEndpoint;
  interventionAmendmentAdd: EtoolsEndpoint;
  interventionAmendmentDelete: EtoolsEndpoint;
  frNumbersDetails: EtoolsEndpoint;
  comments: EtoolsEndpoint;
  resolveComment: EtoolsEndpoint;
  deleteComment: EtoolsEndpoint;
  createIndicator: EtoolsEndpoint;
  getEditDeleteIndicator: EtoolsEndpoint;
  cpOutputRamIndicators: EtoolsEndpoint;
  interventionProgress: EtoolsEndpoint;
  prpToken: EtoolsEndpoint;
  reports: EtoolsEndpoint;
  expectedResultsExport: EtoolsEndpoint;
  riskDelete: EtoolsEndpoint;
  pdAttachments: EtoolsEndpoint;
  updatePdAttachment: EtoolsEndpoint;
  lowerResultsDelete: EtoolsEndpoint;
  getPrpClusterIndicators: EtoolsEndpoint;
  getPrpClusterIndicator: EtoolsEndpoint;
  getResponsePlans: EtoolsEndpoint;
  hrClusterReportingRequirements: EtoolsEndpoint;
  getPRPCountries: EtoolsEndpoint;
  downloadComment: EtoolsEndpoint;
  downloadPDPdf: EtoolsEndpoint;
  interventionReview: EtoolsEndpoint;
  sendReviewNotification: EtoolsEndpoint;
  officersReviews: EtoolsEndpoint;
  officerReviewData: EtoolsEndpoint;
}

export const interventionEndpoints: EtoolsEndpoints = {
  intervention: {
    template: '/api/pmp/v3/interventions/<%=interventionId%>/'
  },
  interventionAction: {
    template: '/api/pmp/v3/interventions/<%=interventionId%>/<%=action%>/'
  },
  efaceAction: {
    // TODO eface
    template: '/api/v1/forms/<%=efaceId%>/<%=action%>/'
  },
  partnerStaffMembers: {
    template: '/api/pmp/v3/partners/<%=id%>/staff-members/'
  },
  partnerAgreements: {
    template: '/api/pmp/v3/agreements/?partner_id=<%=id%>'
  },
  specialReportingRequirements: {
    template: '/api/reports/v3/interventions/<%=intervId%>/special-reporting-requirements/'
  },
  reportingRequirements: {
    template: '/api/pmp/v3/interventions/<%=intervId%>/reporting-requirements/<%=reportType%>/'
  },
  specialReportingRequirementsUpdate: {
    template: '/api/v2/reports/interventions/special-reporting-requirements/<%=reportId%>/'
  },
  monitoringVisits: {
    template: '/api/t2f/travels/activities/partnership/<%=id%>/?year=<%=year%>'
  },
  partnerT2fProgrammaticVisits: {
    template: '/api/t2f/travels/activities/<%=id%>/?year=<%=year%>&status=completed'
  },
  partnerTPMActivities: {
    template:
      '/api/tpm/activities/?tpm_visit__status=unicef_approved&is_pv=true&date__year=<%=year%>&partner=<%=partnerId%>'
  },
  interventionTPMActivities: {
    template:
      '/api/tpm/activities/?tpm_visit__status=unicef_approved&date__year=<%=year%>&intervention=<%=interventionId%>'
  },
  resultLinks: {
    template: '/api/v2/interventions/<%=id%>/result-links/'
  },
  resultLinkGetDelete: {
    template: '/api/v2/interventions/result-links/<%=result_link%>/'
  },
  ramIndicators: {
    template: '/api/v2/reports/results/<%=id%>/indicators/'
  },
  pdDetails: {
    template: '/api/pmp/v3/interventions/<%=intervention_id%>/pd-outputs/<%=pd_id%>/'
  },
  createPd: {
    template: '/api/pmp/v3/interventions/<%=intervention_id%>/pd-outputs/'
  },
  pdActivities: {
    template: '/api/pmp/v3/interventions/<%=interventionId%>/pd-outputs/<%=pdOutputId%>/activities/'
  },
  interventionBudgetUpdate: {
    template: '/api/pmp/v3/interventions/<%=interventionId%>/budget/'
  },
  pdActivityDetails: {
    template: '/api/pmp/v3/interventions/<%=interventionId%>/pd-outputs/<%=pdOutputId%>/activities/<%=activityId%>/'
  },
  supplyAgreementAdd: {
    template: '/api/pmp/v3/interventions/<%=interventionId%>/supply/'
  },
  supplyAgreementEdit: {
    template: '/api/pmp/v3/interventions/<%=interventionId%>/supply/<%=supplyId%>/'
  },
  attachmentsUpload: {
    url: '/api/v2/attachments/upload/'
  },
  supplyItemsUpload: {
    template: '/api/pmp/v3/interventions/<%=interventionId%>/supply/upload/'
  },
  interventionAmendmentAdd: {
    template: '/api/v2/interventions/<%=intervId%>/amendments/'
  },
  interventionAmendmentDelete: {
    template: '/api/v2/interventions/amendments/<%=amendmentId%>/'
  },
  frNumbersDetails: {
    url: '/api/v2/funds/frs'
  },
  comments: {
    template: '/api/comments/v1/partners/intervention/<%=interventionId%>/'
  },
  resolveComment: {
    template: '/api/comments/v1/partners/intervention/<%=interventionId%>/<%=commentId%>/resolve/'
  },
  deleteComment: {
    template: '/api/comments/v1/partners/intervention/<%=interventionId%>/<%=commentId%>/delete/'
  },
  downloadComment: {
    template: '/api/comments/v1/partners/intervention/<%=interventionId%>/csv/'
  },
  lowerResultsDelete: {
    template: '/api/pmp/v3/interventions/<%=intervention_id%>/pd-outputs/<%=lower_result_id%>/'
  },
  createIndicator: {
    template: '/api/pmp/v3/interventions/lower-results/<%=id%>/indicators/'
  },
  getEditDeleteIndicator: {
    template: '/api/pmp/v3/interventions/applied-indicators/<%=id%>/'
  },
  cpOutputRamIndicators: {
    template: '/api/v2/interventions/<%=intervention_id%>/output_cp_indicators/<%=cp_output_id%>/'
  },
  interventionProgress: {
    template: '/api/unicef/<%=countryId%>/programme-document/<%=pdId%>/progress/?external=1',
    token: 'prp'
  },
  prpToken: {
    url: '/api/jwt/get'
  },
  reports: {
    template: '/api/unicef/<%=countryId%>/progress-reports/',
    token: 'prp'
  },
  expectedResultsExport: {
    template: '/api/reports/v3/interventions/results/<%=intervention_id%>/?format=docx_table'
  },
  riskDelete: {
    template: '/api/pmp/v3/interventions/<%=interventionId%>/risks/<%=riskId%>'
  },
  pdAttachments: {
    template: '/api/pmp/v3/interventions/<%=id%>/attachments/'
  },
  interventionReview: {
    template: '/api/pmp/v3/interventions/<%=interventionId%>/reviews/<%=id%>/'
  },
  sendReviewNotification: {
    template: '/api/pmp/v3/interventions/<%=interventionId%>/reviews/<%=id%>/notify/'
  },
  officersReviews: {
    template: '/api/pmp/v3/interventions/<%=interventionId%>/reviews/<%=id%>/officers-reviews/'
  },
  officerReviewData: {
    template: '/api/pmp/v3/interventions/<%=interventionId%>/reviews/<%=id%>/officers-reviews/<%=userId%>/'
  },
  updatePdAttachment: {
    template: '/api/pmp/v3/interventions/<%=id%>/attachments/<%=attachment_id%>/'
  },
  getPrpClusterIndicators: {
    // by cluster id
    template: '/api/indicator/ca/?clusters=<%=id%>',
    token: 'prp'
  },
  getPrpClusterIndicator: {
    // by id
    template: '/api/indicator/<%=id%>/',
    token: 'prp'
  },
  getResponsePlans: {
    template: '/api/core/workspace/<%=countryId%>/response-plan/',
    token: 'prp'
  },
  hrClusterReportingRequirements: {
    template: '/api/indicator/reporting-frequencies/',
    token: 'prp'
  },
  getPRPCountries: {
    template: '/api/core/workspace/',
    exp: 60 * 60 * 60 * 1000,
    token: 'prp',
    cachingKey: 'prpCountries'
  },
  downloadPDPdf: {
    template: '/api/pmp/v3/interventions/<%=interventionId%>/pdf'
  }
};
