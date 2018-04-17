/**
 * Created by abradley on 06/03/2018.
 */
import apiReducers from '../reducers/apiReducers'
import * as types from '../actions/actonTypes'
 

function getInitialState(){
   return {
    project_id: undefined,
    target_id: undefined,
    target_id_list: [],
    mol_group_list: [],
    molecule_list: [],
    mol_group_on: undefined,
    target_on: undefined,
    group_id: undefined,
    isFetching: false,
    group_type: "MC"
   }
}


describe('API Redcuer', () => {
  it('should return the initial state', () => {
    expect(apiReducers(undefined, {})).toEqual(
        getInitialState()
    )
  })
 
  it('should handle LOAD_TARGETS', () => {
    expect(apiReducers(undefined, {
        type: types.LOAD_TARGETS,
        project_id: 1
      })
    ).toEqual({
        project_id: 1,
        target_id: undefined,
        group_id: undefined,
        isFetching: false,
        group_type: "MC",
          target_id_list: [],
          mol_group_list: [],
          molecule_list: [],
          mol_group_on: undefined,
          target_on: undefined,
    }
    )
      expect(apiReducers(undefined, {
        type: types.LOAD_TARGETS
      })
    ).toEqual({
          project_id: undefined,
          target_id: undefined,
          group_id: undefined,
          isFetching: false,
          group_type: "MC",
          target_id_list: [],
          mol_group_list: [],
          molecule_list: [],
          mol_group_on: undefined,
          target_on: undefined,
    }
    )
  })
    it('should handle LOAD_MOL_GROUPS', () => {
    expect(apiReducers(undefined, {
        type: types.LOAD_MOL_GROUPS,
        group_id: 1
      })
    ).toEqual({
        project_id: undefined,
        target_id: undefined,
        group_id: 1,
        isFetching: false,
        group_type: "MC",
          target_id_list: [],
          mol_group_list: [],
          molecule_list: [],
          mol_group_on: undefined,
          target_on: undefined,
    }
    )
      expect(apiReducers(undefined, {
          type: types.LOAD_MOL_GROUPS,
          group_type: "PC",
          group_id: 1
      })
    ).toEqual({
          project_id: undefined,
          target_id: undefined,
          isFetching: false,
          group_id: 1,
            group_type: "PC",
          target_id_list: [],
          mol_group_list: [],
          molecule_list: [],
          mol_group_on: undefined,
          target_on: undefined,
    }
    )
  })
        it('should handle LOAD_MOLECULES', () => {
    expect(apiReducers(undefined, {
        type: types.LOAD_MOLECULES,
        target_id: 1,
        group_id: 1
      })
    ).toEqual({
        project_id: undefined,
        target_id: 1,
        group_id: 1,
        isFetching: false,
        group_type: "MC",
          target_id_list: [],
          mol_group_list: [],
          molecule_list: [],
          mol_group_on: undefined,
          target_on: undefined,
    }
    )
      expect(apiReducers(undefined, {
        type: types.LOAD_MOLECULES,
        target_id: 1
      })
    ).toEqual({
          project_id: undefined,
          target_id: 1,
          isFetching: false,
          group_id: undefined,
          group_type: "MC",
          target_id_list: [],
          mol_group_list: [],
          molecule_list: [],
          mol_group_on: undefined,
          target_on: undefined,
    }
    )
  })
})