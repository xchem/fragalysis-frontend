import configureStore from 'redux-mock-store';
import { thunk } from 'redux-thunk';
import { loadMoleculesAndTagsNew } from './dispatchActions';
import * as api from '../api/tagsApi';
import { getActivityColumns, getActivityData } from '../../molecule/observationUnifiedView/api';
import {
  setAllMolLists,
  setLHSCompoundsList,
  setRHSCompoundsList,
  setMoleculeTags
} from '../../../../reducers/api/actions';

jest.mock('../../../../utils/djangoContext', () => ({ DJANGO_CONTEXT: {} }));
jest.mock('../api/tagsApi');
jest.mock('../../molecule/observationUnifiedView/api');

const mockStore = configureStore([thunk]);
const load = async ({ observations = [], tags = [], poses = [], identifiers = [], mappings = [], activities = [] }) => {
  api.getTags.mockResolvedValue(tags);
  api.getComputedSetInspirationMappings.mockResolvedValue(mappings);
  api.getCompoundIdentifiers.mockResolvedValue(identifiers);
  api.getTagCategories.mockResolvedValue([]);
  api.getAllDataNew.mockResolvedValue({ results: observations });
  api.getPoses.mockResolvedValue(poses);
  getActivityColumns.mockResolvedValue([]);
  getActivityData.mockResolvedValue(activities);
  const store = mockStore({});
  await store.dispatch(loadMoleculesAndTagsNew(1));
  const payload = creator => {
    const sample = creator([]);
    const action = store.getActions().find(item => item.type === sample.type);
    return action[Object.keys(sample).find(key => key !== 'type')];
  };
  return {
    observations: payload(setAllMolLists),
    lhs: payload(setLHSCompoundsList),
    rhs: payload(setRHSCompoundsList),
    tags: payload(setMoleculeTags)
  };
};

describe('preview target preparation', () => {
  it('preserves strict IDs, observation order, owned arrays, orphan poses and RHS tag fallback', async () => {
    expect.hasAssertions();
    const observations = [
      { id: 2, code: 'b', cmpd: 10, smiles: 'second', experiment: 1, ligand_mol_file: 'unused' },
      { id: 1, code: 'a', cmpd: 10, smiles: 'first', experiment: 1 },
      { id: '1', code: 'c', cmpd: '10', experiment: null },
      { id: 3, code: 'd', cmpd: 30, experiment: null },
      { id: 4, code: 'e', cmpd: 40, experiment: null }
    ];
    const tags = [
      { id: 8, tag: 'Z', category: 1, site_observations: [1, 1, 2] },
      { id: 7, tag: 'A', category: 1, site_observations: [1] },
      { id: 9, tag: 'R', category: 1, meta_category: 'rhs', site_observations: ['1'] },
      { id: 10, tag: 'S', category: 1, meta_category: 'rhs', site_observations: [3, 4] },
      { id: 11, tag: 'T', category: 1, meta_category: 'rhs', site_observations: [4] },
      { id: 12, tag: 'U', category: 1, meta_category: 'rhs', site_observations: [99] }
    ];
    const identifiers = [
      { compound: 10, name: 'alias' },
      { compound: '10', name: 'string alias' }
    ];
    const activities = [{ compound: 10 }, { compound: 'null', site_observation: 2 }, { site_observation: 1 }];
    const result = await load({
      observations,
      tags,
      identifiers,
      activities,
      mappings: [{ site_observation: 1, computed_set: 5, computed_inspiration: 3 }],
      poses: [
        { id: 20, display_name: 'lhs', compound: 10, site_observations: [2, 1, 1] },
        { id: 21, display_name: 'rhs', compound: '10', site_observations: ['1'] },
        { id: 22, display_name: 'orphan', compound: 99, site_observations: [99] }
      ]
    });
    const [first, second, third] = result.observations;
    expect(result.observations.map(item => item.id)).toStrictEqual([1, 2, '1', 3, 4]);
    expect(first.tags_set).toStrictEqual([8, 7]);
    expect(first.computed_inspirations_by_set).toStrictEqual({ 5: [3] });
    expect(first.identifiers).toStrictEqual([identifiers[0]]);
    expect(second.identifiers).toStrictEqual(first.identifiers);
    expect(second.identifiers).not.toBe(first.identifiers);
    expect(third.identifiers).toStrictEqual([identifiers[1]]);
    expect(second).not.toHaveProperty('ligand_mol_file');
    expect(observations[0]).toHaveProperty('ligand_mol_file');
    expect(result.lhs.map(item => item.id)).toStrictEqual([20, 22]);
    expect(result.lhs[0].associatedObs).toStrictEqual([first, second]);
    expect(result.lhs[0].associatedObs[0]).toBe(first);
    expect(result.lhs[0].smiles).toBe('first');
    expect(result.lhs[0].activityData).toStrictEqual([...activities, activities[2]]);
    expect(result.lhs[1].associatedObs).toStrictEqual([]);
    expect(result.rhs.map(item => item.id)).toStrictEqual(['rhs-tag-10', 21]);
    expect(result.rhs[0].site_observations).toStrictEqual([3, 4]);
    expect(result.tags.map(item => item.id)).toStrictEqual([7, 9, 10, 11, 12, 8]);
  });

  it('indexes target relationships instead of scanning observations and identifiers for every pose', async () => {
    expect.hasAssertions();
    const count = 930;
    let observationReads = 0;
    let identifierReads = 0;
    let membershipReads = 0;
    const observations = Array.from({ length: count }, (_, id) => ({
      get id() {
        observationReads++;
        return id;
      },
      code: String(id).padStart(4, '0'),
      cmpd: id,
      experiment: 1
    }));
    const identifiers = Array.from({ length: count }, (_, id) => ({
      get compound() {
        identifierReads++;
        return id;
      }
    }));
    const result = await load({
      observations,
      identifiers,
      tags: [{ id: 1, category: 1, tag: 'all', site_observations: observations.map((_, id) => id) }],
      poses: observations.map((_, id) => ({
        id,
        display_name: String(id),
        compound: id,
        site_observations: Object.defineProperty([id], 0, {
          get: () => {
            membershipReads++;
            return id;
          }
        })
      }))
    });
    expect(result.observations).toHaveLength(count);
    expect(result.lhs).toHaveLength(count);
    expect(observationReads).toBeLessThan(count * 8);
    expect(identifierReads).toBeLessThan(count * 3);
    expect(membershipReads).toBeLessThan(count * 8);
  });
});
