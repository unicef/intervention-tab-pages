export interface IDialog<D> {
  dialog: string;
  dialogData?: D;
  readonly?: boolean;
}

export interface IEtoolsDialogResponse {
  confirmed: boolean;
}

export interface IDialogResponse<R> extends IEtoolsDialogResponse {
  response?: R;
}

export type InterventionComment = {
  id: number;
  related_to: string;
  related_to_description: string;
  state: string;
  text: string;
  user: {
    id: number;
    name: string;
    first_name: string;
    middle_name: string;
    last_name: string;
  };
  users_related: [];
};
