import CONSTANTS from '../common/constants';

const getBasePath = () => {
  console.log(document.getElementsByTagName('base')[0].href);
  return document.getElementsByTagName('base')[0].href;
};

export const tokenStorageKeys = {
  prp: 'etoolsPrpToken'
};

export const getTokenEndpoints = {
  prp: 'prpToken'
};

export const ROOT_PATH = '/' + getBasePath().replace(window.location.origin, '').slice(1, -1) + '/';

export const _checkEnvironment = () => {
  const location = window.location.href;
  if (location.indexOf(CONSTANTS.DOMAINS.STAGING) > -1) {
    return 'STAGING';
  }
  if (location.indexOf(CONSTANTS.DOMAINS.DEMO) > -1) {
    return 'DEMO';
  }
  if (location.indexOf(CONSTANTS.DOMAINS.DEV) > -1) {
    return 'DEVELOPMENT';
  }
  if (location.indexOf(CONSTANTS.DOMAINS.LOCAL) > -1) {
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
