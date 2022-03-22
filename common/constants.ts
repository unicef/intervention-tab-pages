const CONSTANTS = {
  PD_EXPORT_TYPES: {
    PdResult: 'PD Result',
    PdBudget: 'PD Budget',
    PdLocations: 'PD Locations'
  },
  DEFAULT_LIST_SIZE: 10,
  DOCUMENT_TYPES: {
    PD: 'PD',
    SSFA: 'SSFA',
    SHPD: 'SHPD',
    SPD: 'SPD',
    ProgrammeDocument: 'Programme Document',
    SmallScaleFundingAgreement: 'Small Scale Funding Agreement',
    SimplifiedHumanitarianProgrammeDocument: 'Simplified Humanitarian Programme Document'
  },
  DOCUMENT_TYPES_LONG: {
    PD: 'Programme Document',
    SSFA: 'Small Scale Funding Agreement',
    SPD: 'Simplified Programme Document'
  },
  AGREEMENT_TYPES: {
    PCA: 'PCA',
    SSFA: 'SSFA',
    MOU: 'MOU'
  },
  STATUSES: {
    Draft: 'Draft',
    Review: 'Review',
    Signature: 'Signature',
    Signed: 'Signed',
    Active: 'Active',
    Suspended: 'Suspended',
    Terminated: 'Terminated',
    Ended: 'Ended',
    Closed: 'Closed'
  },
  PARTNER_STATUSES: {
    NotSynced: 'Not Synced',
    SyncedFromVISION: 'Synced from VISION',
    BlockedInVISION: 'Blocked in VISION',
    MarkedForDeletionInVISION: 'Marked For Deletion in VISION'
  },
  REQUIREMENTS_REPORT_TYPE: {
    QPR: 'QPR', // Quarterly Progress Report
    HR: 'HR', // Humanitarian Report
    SPECIAL: 'SPECIAL', // Special Report
    SR: 'SR' // Special Report, value frm PRP
  },
  DOMAINS: {
    STAGING: 'etools-staging.unicef.org',
    DEV: 'etools-dev.unicef.org',
    DEMO: 'etools-demo.unicef.org',
    TEST: 'etools-test.unicef.io',
    LOCAL: 'localhost:8082'
  }
};

export const TABS = {
  Metadata: 'metadata',
  Strategy: 'strategy',
  Workplan: 'workplan',
  WorkplanEditor: 'workplan-editor',
  Timing: 'timing',
  Attachments: 'attachments',
  Review: 'review',
  Summary: 'summary',
  ImplementationStatus: 'implementation-status',
  MonitoringActivities: 'monitoring-activities',
  ResultsReported: 'results-reported',
  Reports: 'reports',
  Progress: 'progress'
};

export default CONSTANTS;
