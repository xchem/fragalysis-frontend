/**
 * Created by abradley on 06/03/2018.
 */
import * as actions from '../reducers/api/apiActions';
import * as types from '../reducers/actonTypes';

describe('Molecular actions', () => {
  it('Should load all the targets for a project id', () => {
    const expectedAction = {
      type: types.LOAD_TARGETS,
      project_id: undefined
    };
    expect(actions.loadTargets()).toEqual(expectedAction);
  });
  it('Should load all the targets for a project id', () => {
    const expectedAction = {
      type: types.LOAD_TARGETS,
      project_id: 1
    };
    expect(actions.loadTargets(1)).toEqual(expectedAction);
  });
  it('Should load all the molecules for a target or project_id', () => {
    const expectedAction = {
      type: types.LOAD_MOLECULES,
      target_id: 1,
      group_id: 12
    };
    expect(actions.loadMolecules(1, 12)).toEqual(expectedAction);
  });
  it('Should load all the molecule groups for a target_id and group_type', () => {
    const expectedAction = {
      type: types.LOAD_MOL_GROUPS,
      target_id: 1,
      group_type: 'MC'
    };
    expect(actions.loadMolGroups(1)).toEqual(expectedAction);
  });
  it('Should load all the molecule groups for a target_id and group_type', () => {
    const expectedAction = {
      type: types.LOAD_MOL_GROUPS,
      target_id: 1,
      group_type: 'PC'
    };
    expect(actions.loadMolGroups(1, 'PC')).toEqual(expectedAction);
  });
});
