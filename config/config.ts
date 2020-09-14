export const tokenStorageKeys = {
  prp: 'etoolsPrpToken'
};

export const getTokenEndpoints = {
  prp: 'prpToken'
};

const STAGING_DOMAIN = 'etools-staging.unicef.org';
const DEV_DOMAIN = 'etools-dev.unicef.org';
const DEMO_DOMAIN = 'etools-demo.unicef.org';
const LOCAL_DOMAIN = 'localhost:8082';

export const _checkEnvironment = () => {
  const location = window.location.href;
  if (location.indexOf(STAGING_DOMAIN) > -1) {
    return 'STAGING';
  }
  if (location.indexOf(DEMO_DOMAIN) > -1) {
    return 'DEMO';
  }
  if (location.indexOf(DEV_DOMAIN) > -1) {
    return 'DEVELOPMENT';
  }
  if (location.indexOf(LOCAL_DOMAIN) > -1) {
    return 'LOCAL';
  }
  return null;
};

export const tokenEndpointsHost = (host: string) => {
  if (host === 'prp') {
    switch (_checkEnvironment()) {
      case 'LOCAL':
        return 'http://127.0.0.1:8081';
      case 'DEVELOPMENT':
        return 'https://dev.partnerreportingportal.org';
      case 'DEMO':
        return 'https://demo.partnerreportingportal.org';
      case 'STAGING':
        return 'https://staging.partnerreportingportal.org';
      case null:
        return 'https://www.partnerreportingportal.org';
      default:
        return 'https://dev.partnerreportingportal.org';
    }
  }
  return null;
};

export const CONSTANTS = {
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
  AGREEMENT_TYPES: {
    PCA: 'PCA',
    MOU: 'MOU'
  },
  STATUSES: {
    Draft: 'Draft',
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
  }
};
