/**
 * Created by abradley on 07/03/2018.
 */
import * as actions from '../actions/nglLoadActions';
import * as types from '../actions/actonTypes';

const TEST_GROUP_CONST = 'GROUP';

describe('Loading action', () => {
  it('Should load a given NGL object', () => {
    const expectedAction = {
      type: types.LOAD_OBJECT,
      group: TEST_GROUP_CONST
    };
    expect(actions.loadObject(TEST_GROUP_CONST)).toEqual(expectedAction);
  });

  it('Should fire when an NGL object has loaded', () => {
    const expectedAction = {
      type: types.LOAD_OBJECT_SUCCESS,
      group: TEST_GROUP_CONST,
      success: true
    };
    expect(actions.loadObjectSuccess(TEST_GROUP_CONST)).toEqual(expectedAction);
  });

  it('Should fire when an NGL object has failed', () => {
    const expectedAction = {
      type: types.LOAD_OBJECT_FAILURE,
      group: TEST_GROUP_CONST,
      success: false
    };
    expect(actions.loadObjectFailure(TEST_GROUP_CONST)).toEqual(expectedAction);
  });
});
describe('Loading action', () => {
  it('Should delete a given NGL object', () => {
    const expectedAction = {
      type: types.DELETE_OBJECT,
      group: TEST_GROUP_CONST
    };
    expect(actions.deleteObject(TEST_GROUP_CONST)).toEqual(expectedAction);
  });

  it('Should fire when an NGL object has been deleted', () => {
    const expectedAction = {
      type: types.DELETE_OBJECT_SUCCESS,
      group: TEST_GROUP_CONST,
      success: true
    };
    expect(actions.deleteObjectSuccess(TEST_GROUP_CONST)).toEqual(expectedAction);
  });

  it('Should fire when an NGL object has failed to be deleted', () => {
    const expectedAction = {
      type: types.DELETE_OBJECT_FAILURE,
      group: TEST_GROUP_CONST,
      success: false
    };
    expect(actions.deleteObjectFailure(TEST_GROUP_CONST)).toEqual(expectedAction);
  });
});
