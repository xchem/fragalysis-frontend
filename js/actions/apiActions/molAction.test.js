/**
 * Created by abradley on 06/03/2018.
 */
import * as actions from './molActions'
import * as types from '../actonTypes'
 
describe('Molecular actions', () => {
    it('Should load all the targets for a project id', () => {
        const expectedAction = {
            type: types.LOAD_TARGETS,
            project_id: undefined
        }
        expect(actions.loadTargets()).toEqual(expectedAction)
    })
    it('Should load all the targets for a project id', () => {
        const expectedAction = {
            type: types.LOAD_TARGETS,
            project_id: 1
        }
        expect(actions.loadTargets(1)).toEqual(expectedAction)
    })
    it('Should load all the molecules for a target or project_id', () => {
        const expectedAction = {
            type: types.LOAD_MOLECULES,
            target_id: 1,
            group_id: 12,
        }
        expect(actions.loadMolecules(1,12)).toEqual(expectedAction)
    })
})