export interface EtoolsEndpoint {
  url?: string;
  template?: string;
  exp?: any;
  cachingKey?: string;
  cacheTableName?: string;
  token?: string;
}
export interface EtoolsEndpoints {
  intervention: EtoolsEndpoint;
  interventionAction: EtoolsEndpoint;
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
  resultLinkDetails: EtoolsEndpoint;
  pdDetails: EtoolsEndpoint;
  createPd: EtoolsEndpoint;
  pdActivityDetails: EtoolsEndpoint;
  pdActivities: EtoolsEndpoint;
  attachmentsUpload: EtoolsEndpoint;
  interventionAmendmentAdd: EtoolsEndpoint;
  frNumbersDetails: EtoolsEndpoint;
  comments: EtoolsEndpoint;
  resolveComment: EtoolsEndpoint;
  deleteComment: EtoolsEndpoint;
  cpOutputRamIndicators: EtoolsEndpoint;
  interventionProgress: EtoolsEndpoint;
  prpToken: EtoolsEndpoint;
}

export const interventionEndpoints: EtoolsEndpoints = {
  intervention: {
    template: '/api/pmp/v3/interventions/<%=interventionId%>/'
  },
  interventionAction: {
    template: '/api/pmp/v3/interventions/<%=interventionId%>/<%=action%>'
  },
  partnerStaffMembers: {
    template: '/api/v2/partners/<%=id%>/staff-members/'
  },
  partnerAgreements: {
    template: '/api/pmp/v3/agreements/?partner_id=<%=id%>'
  },
  specialReportingRequirements: {
    template: '/api/v2/reports/interventions/<%=intervId%>/special-reporting-requirements/'
  },
  reportingRequirements: {
    template: '/api/v2/interventions/<%=intervId%>/reporting-requirements/<%=reportType%>/'
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
  resultLinkDetails: {
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
  pdActivityDetails: {
    template: '/api/pmp/v3/interventions/<%=interventionId%>/pd-outputs/<%=pdOutputId%>/activities/<%=activityId%>/'
  },
  attachmentsUpload: {
    url: '/api/v2/attachments/upload/'
  },
  interventionAmendmentAdd: {
    template: '/api/v2/interventions/<%=intervId%>/amendments/'
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
};
