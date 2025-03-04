import { addQualityStatus, setQualityStatuses } from "../../../../../../reducers/api/actions";
import { DJANGO_CONTEXT } from "../../../../../../utils/djangoContext";
import { postQualityStatuse } from "./api";

/**
 * Set quality statuses sorted by timestamp descending
 * @param {Array} statuses
 */
export const setQualityStatusesAction = statuses => (dispatch, getState) => {
  statuses.sort((a, b) => a.timestamp < b.timestamp ? 1 : -1);
  dispatch(setQualityStatuses(statuses));
};

export const addQualityStatusAction = status => (dispatch, getState) => {
  dispatch(addQualityStatus(status));
};

export const addMainStatus = data => async (dispatch, getState) => {
  const dataWithMainStatus = { ...data, user: DJANGO_CONTEXT.pk, main_status: true, comment: 'Main status change' };
  const status = await postQualityStatuse(dataWithMainStatus);
  dispatch(addQualityStatusAction(status));
  return status;
};

export const addPeerReviewStatus = data => async (dispatch, getState) => {
  const dataWithPeerReviewStatus = { ...data, user: DJANGO_CONTEXT.pk, main_status: false };
  const status = await postQualityStatuse(dataWithPeerReviewStatus);
  dispatch(addQualityStatusAction(status));
  return status;
}
