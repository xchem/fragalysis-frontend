/**
 * Created by abradley on 06/03/2018.
 */
import nglReducers from  './nglReducers'
import * as types from '../actions/actonTypes'
 

function getInitialState(){
    return  {
        project_id: null, 
        target_id: null, 
        group_id: null,
        group_type: "MC"}
}

describe('NGL reducer', () => {
  it('should return the initial state', () => {
    expect(nglReducers(undefined, {})).toEqual(
        getInitialState()
    )
  })
 
  it('should handle LOAD_TARGETS', () => {
    expect(nglReducers(undefined, {
        type: types.LOAD_TARGETS,
        project_id: 1
      })
    ).toEqual({
        project_id: 1,
        target_id: null,
        group_id: null,
        group_type: "MC"
    }
    )
      expect(nglReducers(undefined, {
        type: types.LOAD_TARGETS
      })
    ).toEqual({
        project_id: null,
        target_id: null,
        group_id: null,
        group_type: "MC"
    }
    )
  })
    it('should handle LOAD_MOL_GROUPS', () => {
    expect(nglReducers(undefined, {
        type: types.LOAD_MOL_GROUPS,
        group_id: 1
      })
    ).toEqual({
        project_id: null,
        target_id: null,
        group_id: 1,
        group_type: "MC"
    }
    )
      expect(nglReducers(undefined, {
        type: types.LOAD_MOL_GROUPS,
          group_type: "PC",
        group_id: 1
      })
    ).toEqual({
        project_id: null,
        target_id: null,
        group_id: 1,
        group_type: "PC"
    }
    )
  })
        it('should handle LOAD_MOLECULES', () => {
    expect(nglReducers(undefined, {
        type: types.LOAD_MOLECULES,
        target_id: 1,
        group_id: 1
      })
    ).toEqual({
        project_id: null,
        target_id: 1,
        group_id: 1,
        group_type: "MC"
    }
    )
      expect(nglReducers(undefined, {
        type: types.LOAD_MOLECULES,
        target_id: 1
      })
    ).toEqual({
        project_id: null,
        target_id: 1,
        group_id: null,
        group_type: "MC"
    }
    )
  })
})