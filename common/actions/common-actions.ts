export const UPDATE_SMALLMENU_STATE = 'UPDATE_SMALLMENU_STATE';
export const updateSmallMenu: any = (smallMenu: boolean) => {
  return {
    type: UPDATE_SMALLMENU_STATE,
    smallMenu
  };
};
