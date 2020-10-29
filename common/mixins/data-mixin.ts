import {LitElement, PropertyDeclarations} from 'lit-element';
import {cloneDeep} from '../../utils/utils';
import {GenericObject} from '@unicef-polymer/etools-types';

type Constructor<T> = new (...args: any[]) => T;

/* @polymerMixin */
export const DataMixin = <B extends Constructor<LitElement>>() => <T>(superclass: B) =>
  class extends superclass {
    /* eslint-enable @typescript-eslint/typedef,@typescript-eslint/explicit-function-return-type */
    editedData: Partial<T> = {};
    originalData!: T | null;
    errors: GenericObject = {};

    static get properties(): PropertyDeclarations {
      // @ts-ignore
      const superProps: PropertyDeclarations = super.properties;
      return {
        ...superProps,
        errors: {type: Object},
        editedData: {type: Object}
      };
    }

    set data(data: T | null) {
      this.editedData = !data ? {} : {...this.editedData, ...data};
      this.originalData = cloneDeep(data);
    }

    connectedCallback(): void {
      super.connectedCallback();
    }

    resetFieldError(fieldName: string): void {
      if (!this.errors) {
        return;
      }
      delete this.errors[fieldName];
      this.performUpdate();
    }

    updateModelValue(fieldName: keyof T, value: any): void {
      if (!this.editedData) {
        return;
      }
      const preparedValue: any = !Array.isArray(value) ? value : value.map((item: any) => item.id);
      const equals: boolean = this.checkEquality(this.editedData[fieldName], preparedValue);
      if (equals) {
        return;
      }
      // sets values from inputs to model, refactor arrays with objects to ids arrays
      this.editedData[fieldName] = preparedValue;
      this.requestUpdate();
    }

    /**
     *  When valueA or B are objects the equality that is being performed looks like this:
     * '[object Object]' === '[object Object]'.Recomandation to use areEqual from utils
     */
    private checkEquality(valueA: any, valueB: any): boolean {
      const baseValue: any[] = [valueA].flat();
      const valueToMatch: any[] = [valueB].flat();
      return (
        baseValue.length === valueToMatch.length &&
        baseValue.flat().every((value: any, index: number) => `${value}` === `${valueToMatch[index]}`)
      );
    }
  };
