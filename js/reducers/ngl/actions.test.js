import nglReducers, { INITIAL_STATE } from './nglReducers';
import * as actions from './actions';
import { NGL_PARAMS } from '../../components/nglView/constants';
import { VIEWS } from '../../constants/constants';

describe("testing ngl reducer's actions", () => {
  let initialState = nglReducers(INITIAL_STATE, {});

  it.each([
    ['load', representation => actions.loadNglObject({ name: 'ligand' }, [representation])],
    ['add', representation => actions.addComponentRepresentation('ligand', representation)],
    ['update', representation => actions.updateComponentRepresentation('ligand', 'rep', representation)],
    ['visibility', representation => actions.updateComponentRepresentationVisibility('ligand', 'rep', representation, false)],
    ['remove', representation => actions.removeComponentRepresentation('ligand', representation)],
    ['change', representation => actions.changeComponentRepresentation('ligand', representation, representation)]
  ])('does not expose native runtime data to Redux or tracking in %s actions', (name, createAction) => {
    const representation = {
      uuid: 'rep', lastKnownID: 'previous-rep', type: 'cartoon',
      params: { colorValue: 0x123456, opacity: 0.6 },
      templateParams: { opacity: { type: 'range', min: 0, max: 1 } }
    };
    const readRuntime = jest.fn(() => { throw new Error('Action traversed the Moorhen runtime'); });
    for (const key of ['nativeRepresentation', 'parentObject', 'ready']) {
      Object.defineProperty(representation, key, { enumerable: true, get: readRuntime });
    }
    const action = createAction(representation);
    expect(() => JSON.stringify(action)).not.toThrow();
    expect(readRuntime).not.toHaveBeenCalled();
    const descriptor = action.representations?.[0] || action.newRepresentation || action.representation;
    expect(descriptor).toEqual({
      uuid: 'rep', lastKnownID: 'previous-rep', type: 'cartoon',
      params: { colorValue: 0x123456, opacity: 0.6 },
      templateParams: { opacity: { type: 'range', min: 0, max: 1 } }
    });
    expect(descriptor.params).not.toBe(representation.params);
  });

  it('should load ngl object', () => {
    expect.hasAssertions();
    const target = { name: 'My target', body: { a: 'aaaa' } };
    const representations = [{ uuid: 'adr', type: 'cartoon', params: { opacity: 0.6 } }];
    let result = nglReducers(initialState, actions.loadNglObject(target, representations));

    expect(result.objectsInView[target.name]).toStrictEqual({ ...target, representations });
  });

  it('should delete ngl object', () => {
    expect.hasAssertions();
    const target1 = { name: 'MyTarget_1', body: { a: 'aaaa' } };
    const target2 = { name: 'MyTarget_2', body: { b: 'bbbbbb' } };
    const representations1 = [{ uuid: 'adr', type: 'cartoon' }];
    const representations2 = [{ uuid: 'adrdf', type: 'licorice' }];
    let result = nglReducers(initialState, actions.loadNglObject(target1, representations1));
    result = nglReducers(result, actions.loadNglObject(target2, representations2));

    expect(result.objectsInView).toHaveProperty(target1.name);
    expect(result.objectsInView).toHaveProperty(target2.name);
  });

  it('stores display settings without retaining circular viewer handles in state or the stash', () => {
    expect.hasAssertions();
    const target = { name: 'Moorhen target' };
    const secondTarget = { name: 'Second target' };
    const representation = { uuid: 'moorhen-representation', type: 'cartoon', params: { opacity: 0.4 } };
    representation.nativeRepresentation = representation;

    let result = nglReducers(initialState, actions.loadNglObject(target, [representation]));
    result = nglReducers(result, actions.loadNglObject(secondTarget, []));

    expect(result.objectsInView[target.name].representations[0]).toStrictEqual({
      uuid: representation.uuid, type: 'cartoon', params: { opacity: 0.4 }
    });
    representation.params.opacity = 0.9;
    expect(result.objectsInView[target.name].representations[0].params.opacity).toBe(0.4);

    const replacement = { uuid: representation.uuid, params: { opacity: 0.7 } };
    replacement.parentObject = replacement;
    result = nglReducers(result, actions.updateComponentRepresentation(target.name, representation.uuid, replacement));

    expect(result.objectsInView[target.name].representations[0]).toStrictEqual({
      uuid: representation.uuid, params: { opacity: 0.7 }
    });

    result = nglReducers(result, actions.deleteNglObject(target));

    expect(result.objectsInViewStash[target.name].representations[0]).toStrictEqual({
      uuid: representation.uuid, params: { opacity: 0.7 }
    });
    expect(() => JSON.stringify(result)).not.toThrow();
  });

  it('should update component representation', () => {
    expect.hasAssertions();
    const objectInViewID = '88-ui-ab';
    const representationID = 68879;
    const oldRepresentations = [
      {
        uuid: 10002,
        params: { opacity: 0.1 }
      },
      {
        uuid: representationID,
        params: { opacity: 0.2 }
      },
      {
        uuid: 10003,
        params: { opacity: 0.3 }
      }
    ];
    const newRepresentation = {
      uuid: representationID,
      params: { opacity: 0.8 }
    };
    const target = { name: objectInViewID, body: { a: 'aaaa' } };

    let result = nglReducers(initialState, actions.loadNglObject(target, oldRepresentations));

    result = nglReducers(
      result,
      actions.updateComponentRepresentation(objectInViewID, representationID, newRepresentation)
    );

    let representationsResult = [];

    oldRepresentations.forEach(rep => {
      if (rep.uuid === newRepresentation.uuid) {
        representationsResult.push(newRepresentation);
      } else {
        representationsResult.push(rep);
      }
    });

    expect(result.objectsInView[objectInViewID].representations).toStrictEqual(
      expect.arrayContaining(representationsResult)
    );
  });

  it('should add component representation', () => {
    expect.hasAssertions();
    const objectInViewID = '88-ui-ab';
    const oldRepresentations = [
      {
        uuid: 10002,
        params: { opacity: 0.1 }
      },
      {
        uuid: 10003,
        params: { opacity: 0.3 }
      }
    ];
    const newRepresentation = {
      uuid: 68879,
      params: { opacity: 0.8 }
    };
    const target = { name: objectInViewID, body: { a: 'aaaa' } };

    let result = nglReducers(initialState, actions.loadNglObject(target, oldRepresentations));

    result = nglReducers(result, actions.addComponentRepresentation(objectInViewID, newRepresentation));

    expect(result.objectsInView[objectInViewID].representations).toStrictEqual(
      expect.arrayContaining([...oldRepresentations, newRepresentation])
    );
  });

  it('should remove component representation', () => {
    expect.hasAssertions();
    const objectInViewID = '88-ui-ab';
    const oldRepresentations = [
      {
        uuid: 10002,
        bodyOld1: 'this is old representation body'
      },
      {
        uuid: 10003,
        bodyOld2: 'this is third old representation body'
      },
      {
        uuid: 990,
        bodyOld2: 'this is third old reprcvchbmesentation body'
      },
      {
        uuid: 93490,
        bodyOld2: 'this is thirtrr6d old reprcvchbmesentation body'
      }
    ];
    const target = { name: objectInViewID, body: { a: 'aaaa' } };

    let result = nglReducers(initialState, actions.loadNglObject(target, oldRepresentations));

    for (let i = 0; i < oldRepresentations.length; i++) {
      result = nglReducers(result, actions.removeComponentRepresentation(objectInViewID, oldRepresentations[i]));
      expect(result.objectsInView[objectInViewID].representations).toHaveLength(oldRepresentations.length - 1 - i);
    }
  });

  it('should set ngl view params', () => {
    expect.hasAssertions();
    const key = NGL_PARAMS.clipFar;
    const value = 58;
    let result = nglReducers(initialState, actions.setNglViewParams(key, value));

    expect(result.viewParams[key]).toBe(value);
  });

  it('should set ngl view orientation', () => {
    expect.hasAssertions();
    const orientation = { a: 'dgfd' };
    const div_id = 'majorView';
    let result = nglReducers(initialState, actions.setNglOrientation(orientation, div_id));

    expect(result.nglOrientations[div_id]).toStrictEqual(orientation);
  });

  it('should set protein loading state', () => {
    expect.hasAssertions();
    let hasLoaded = true;
    let result = nglReducers(initialState, actions.setProteinLoadingState(hasLoaded));
    expect(result.proteinsHasLoaded).toBe(hasLoaded);
    hasLoaded = false;
    result = nglReducers(result, actions.setProteinLoadingState(hasLoaded));
    expect(result.proteinsHasLoaded).toBe(hasLoaded);
  });

  it('should remove all ngl view components', () => {
    expect.hasAssertions();
    let result = nglReducers(initialState, actions.removeAllNglComponents());
    expect(result).toStrictEqual(INITIAL_STATE);
  });

  it('should set and decrement count of remaining molecule groups', () => {
    expect.hasAssertions();
    const count = 5;
    let result = nglReducers(initialState, actions.setCountOfRemainingMoleculeGroups(count));
    expect(result.countOfRemainingMoleculeGroups).toBe(count);

    for (let i = 0; i < count; i++) {
      const decrementedCount = count - 1 - i;
      result = nglReducers(result, actions.decrementCountOfRemainingMoleculeGroups(decrementedCount));
      expect(result.countOfRemainingMoleculeGroups).toBe(decrementedCount);
    }
  });

  it('should increment and decrement count of pending ngl view objects', () => {
    expect.hasAssertions();
    let result = nglReducers(initialState, actions.incrementCountOfPendingNglObjects(VIEWS.MAJOR_VIEW));
    expect(result.countOfPendingNglObjects[VIEWS.MAJOR_VIEW]).toBe(1);

    result = nglReducers(result, actions.decrementCountOfPendingNglObjects(VIEWS.MAJOR_VIEW));
    expect(result.countOfPendingNglObjects[VIEWS.MAJOR_VIEW]).toBe(0);
  });
});
