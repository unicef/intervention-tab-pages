import {LitElement, property} from 'lit-element';
import CONSTANTS from '../../common/constants';
import {Constructor} from '@unicef-polymer/etools-types';

class Paginator {
  page = 1;
  page_size = 10;
  count = 0;
  visible_range: string[] | number[] = [];
}

function PaginationMixin<T extends Constructor<LitElement>>(baseClass: T) {
  class PaginationClass extends baseClass {
    @property({type: Object})
    paginator = new Paginator();

    // TODO: check if the setter is still needed or pageSizeChanged will suffice
    set pageSize(pageSize: number) {
      this.resetPageNumber();
      Object.assign({}, this.paginator, {page_size: pageSize});
    }

    pageSizeChanged(e: CustomEvent) {
      this.resetPageNumber();
      this.setPageSize(parseInt(e.detail.value, 10));
    }

    pageNumberChanged(e: CustomEvent) {
      this.setPageNumber(parseInt(e.detail.value, 10));
    }

    getRequestPaginationParams() {
      return {
        page: this.paginator.page,
        page_size: this.paginator.page_size
      };
    }

    updatePaginatorTotalResults(reqResponse: any) {
      if (reqResponse && reqResponse.count) {
        const count = parseInt(reqResponse.count, 10);
        if (!isNaN(count)) {
          Object.assign({}, this.paginator, {count: count});
          return;
        }
        this._pageInsidePaginationRange(this.paginator.page, this.paginator.count);
      }
      Object.assign({}, this.paginator, {count: 0});
    }

    setPageSize(size: number) {
      Object.assign({}, this.paginator, {page_size: size});
    }

    setPageNumber(page: number) {
      Object.assign({}, this.paginator, {page: page});
      this._pageInsidePaginationRange(this.paginator.page, this.paginator.count);
    }

    resetPageNumber() {
      this.setPageNumber(1);
    }

    setPaginationDataFromUrlParams(urlParams: any) {
      this.setPageNumber(urlParams.page ? parseInt(urlParams.page) : 1);
      this.setPageSize(urlParams.size ? parseInt(urlParams.size) : CONSTANTS.DEFAULT_LIST_SIZE);
    }

    _pageInsidePaginationRange(page: number, totalResults: number) {
      if (page < 1) {
        this.resetPageNumber();
      }
      if (isNaN(totalResults)) {
        return;
      }

      const lastPageNr = this._getLastPageNr(this.paginator.page_size, totalResults);
      if (page > lastPageNr) {
        // page is bigger than last page number (possible by modifying url page param)
        // set page to last available page
        this.setPageNumber(lastPageNr);
      }
    }

    _getLastPageNr(pageSize: number, total: number) {
      return pageSize < total ? Math.ceil(total / pageSize) : 1;
    }
  }

  return PaginationClass;
}

export default PaginationMixin;
