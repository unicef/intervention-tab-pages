import {AnyObject} from '@unicef-polymer/etools-types';

export const handleItemsNoLongerAssignedToCurrentCountry = (availableItems: AnyObject[], savedItems?: AnyObject[]) => {
  if (savedItems && savedItems.length > 0 && availableItems && availableItems.length > 0) {
    let changed = false;
    savedItems.forEach((savedItem) => {
      if (availableItems.findIndex((x) => x.id === savedItem.id) < 0) {
        availableItems.push(savedItem);
        changed = true;
      }
    });
    if (changed) {
      availableItems.sort((a, b) => (a.name < b.name ? -1 : 1));
    }
  }
};

export const pageIsNotCurrentlyActive = (
  routeDetails: any,
  routeName: string,
  subRouteName: string,
  subSubRouteName?: string
) => {
  return !(
    routeDetails &&
    routeDetails.routeName === routeName &&
    routeDetails.subRouteName === subRouteName &&
    (!subSubRouteName || routeDetails.subSubRouteName === subSubRouteName)
  );
};

export const callClickOnSpacePushListener = (htmlElement: any) => {
  if (htmlElement && htmlElement.addEventListener) {
    htmlElement.addEventListener('keyup', function (event: KeyboardEvent) {
      if (event.key === ' ' && !event.ctrlKey) {
        // Cancel the default action, if needed
        event.preventDefault();
        // Trigger the button element with a click
        htmlElement.click();
      }
    });
  }
};

export const callClickOnEnterPushListener = (htmlElement: any) => {
  if (htmlElement && htmlElement.addEventListener) {
    htmlElement.addEventListener('keyup', function (event: KeyboardEvent) {
      if (event.key === 'Enter' && !event.ctrlKey) {
        // Cancel the default action, if needed
        event.preventDefault();
        // Trigger the button element with a click
        htmlElement.click();
      }
    });
  }
};

export const detailsTextareaRowsCount = (editable: boolean) => {
  return editable ? 3 : 1;
};
