import {prettyDate} from '../../utils/date-utils';
import {LitElement} from 'lit-element';
import {AnyObject, Constructor} from '@unicef-polymer/etools-types';
import {get} from 'lit-translate';

function CommonMixin<T extends Constructor<LitElement>>(baseClass: T) {
  class CommonClass extends baseClass {
    /**
     * Prepare and return the string value we have to display on the interface.
     * Ex: partners and agreements lists data values.
     */
    // TODO - apply single responsability
    getDisplayValue(value: any, separator: string, skipSpaces: boolean) {
      if (typeof value === 'string' && value !== '') {
        return value;
      } else if (Array.isArray(value) && value.length > 0) {
        if (!separator) {
          separator = ', ';
        }
        if (skipSpaces) {
          return value.filter((v) => v !== undefined && v !== '' && v !== null).join(separator);
        }
        return value.join(separator);
      } else if (typeof value === 'number') {
        return value;
      }
      return '-';
    }
    /**
     * Prepare date string and return it in a user readable format
     */
    getDateDisplayValue(dateString: string) {
      const formatedDate = prettyDate(dateString);
      return formatedDate ? formatedDate : '-';
    }

    prepareEtoolsFileDataFromUrl(fileUrl: string) {
      let files: AnyObject[] = [];
      if (typeof fileUrl === 'string' && fileUrl !== '') {
        const fileName = this.getFileNameFromURL(fileUrl);
        files = [
          {
            id: null,
            file_name: fileName,
            path: fileUrl
          }
        ];
      }
      return files;
    }

    getFileNameFromURL(url: string) {
      if (!url) {
        return '';
      }
      return url.split('?').shift()!.split('/').pop();
    }

    _translate(textKey: string) {
      return get(textKey);
    }
  }

  return CommonClass;
}

export default CommonMixin;
