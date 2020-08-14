export interface EtoolsEndpoint {
  url?: string;
  template?: string;
  exp?: any;
  cachingKey?: string;
  cacheTableName?: string;
}
export interface EtoolsEndpoints {
  intervention: EtoolsEndpoint;
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
}

export const interventionEndpoints: EtoolsEndpoints = {
  intervention: {
    template: '/api/pmp/v3/interventions/<%=interventionId%>/'
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
  }
};
