/**
 * Created by abradley on 06/03/2018.
 */
import apiReducers from './apiReducers'
import * as types from '../actions/actonTypes'
 

function getInitialState(){
   return {
    project_id: undefined,
    target_id: undefined,
    group_id: undefined,
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
        group_type: "MC"
    }
    )
      expect(apiReducers(undefined, {
        type: types.LOAD_TARGETS
      })
    ).toEqual({
        project_id: undefined,
        target_id: undefined,
        group_id: undefined,
        group_type: "MC"
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
        group_type: "MC"
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
        group_id: 1,
        group_type: "PC"
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
        group_type: "MC"
    }
    )
      expect(apiReducers(undefined, {
        type: types.LOAD_MOLECULES,
        target_id: 1
      })
    ).toEqual({
        project_id: undefined,
        target_id: 1,
        group_id: undefined,
        group_type: "MC"
    }
    )
  })
})