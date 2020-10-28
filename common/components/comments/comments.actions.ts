import {_sendRequest} from '../../../utils/request-helper';
import {getEndpoint} from '../../../utils/endpoint-helper';
import {interventionEndpoints} from '../../../utils/intervention-endpoints';
import {InterventionComment, GenericObject} from '@unicef-polymer/etools-types';

export const SET_COMMENTS = 'SET_COMMENTS';
export const ADD_COMMENT = 'ADD_COMMENT';
export const UPDATE_COMMENT = 'UPDATE_COMMENT';
export const ENABLE_COMMENT_MODE = 'ENABLE_COMMENT_MODE';

export const enableCommentMode = (state: boolean) => {
  return {
    type: ENABLE_COMMENT_MODE,
    state
  };
};

export const addComment = (relatedTo: string, comment: InterventionComment, interventionId: number) => {
  return {
    type: ADD_COMMENT,
    data: comment,
    relatedTo,
    interventionId
  };
};

export const updateComment = (relatedTo: string, comment: InterventionComment, interventionId: number) => {
  return {
    type: UPDATE_COMMENT,
    data: comment,
    relatedTo,
    interventionId
  };
};

export const setComments = (comments: GenericObject<InterventionComment[]>, interventionId: number) => {
  return {
    type: SET_COMMENTS,
    data: comments,
    interventionId
  };
};

export const getComments = (interventionId: number) => (dispatch: any) => {
  return _sendRequest({
    endpoint: getEndpoint(interventionEndpoints.comments, {interventionId: interventionId})
  }).then((comments: InterventionComment[]) => {
    dispatch(setComments(mapComments(comments), interventionId));
  });
};

function mapComments(comments: InterventionComment[]): GenericObject<InterventionComment[]> {
  return comments.reduce((commentsMap: GenericObject<InterventionComment[]>, comment: InterventionComment) => {
    if (!commentsMap[comment.related_to]) {
      commentsMap[comment.related_to] = [];
    }
    commentsMap[comment.related_to].push(comment);
    return commentsMap;
  }, {});
}
