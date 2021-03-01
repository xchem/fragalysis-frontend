import nglReducers, { INITIAL_STATE } from './nglReducers';
import * as actions from './actions';
import { NGL_PARAMS } from '../../components/nglView/constants';
import { SCENES } from './constants';

describe("testing ngl reducer's actions", () => {
  let initialState = nglReducers(INITIAL_STATE, {});

  it('should load ngl object', () => {
    expect.hasAssertions();
    const target = { name: 'My target', body: { a: 'aaaa' } };
    const representations = ['adr', 69, { a: 'b' }];
    let result = nglReducers(initialState, actions.loadNglObject(target, representations));

    expect(result.objectsInView[target.name]).toStrictEqual({ ...target, representations });
  });

  it('should delete ngl object', () => {
    expect.hasAssertions();
    const target1 = { name: 'MyTarget_1', body: { a: 'aaaa' } };
    const target2 = { name: 'MyTarget_2', body: { b: 'bbbbbb' } };
    const representations1 = ['adr', 69, { a: 'b' }];
    const representations2 = ['adrdf', 269, { c: 'ccc' }];
    let result = nglReducers(initialState, actions.loadNglObject(target1, representations1));
    result = nglReducers(result, actions.loadNglObject(target2, representations2));

    expect(result.objectsInView).toHaveProperty(target1.name);
    expect(result.objectsInView).toHaveProperty(target2.name);
  });

  it('should update component representation', () => {
    expect.hasAssertions();
    const objectInViewID = '88-ui-ab';
    const representationID = 68879;
    const oldRepresentations = [
      {
        uuid: 10002,
        bodyOld1: 'this is old representation body'
      },
      {
        uuid: representationID,
        bodyOld2: 'this is second old representation body'
      },
      {
        uuid: 10003,
        bodyOld2: 'this is third old representation body'
      }
    ];
    const newRepresentation = {
      uuid: representationID,
      bodyNew: 'this is new representation body'
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
        bodyOld1: 'this is old representation body'
      },
      {
        uuid: 10003,
        bodyOld2: 'this is third old representation body'
      }
    ];
    const newRepresentation = {
      uuid: 68879,
      bodyNew: 'this is new representation body'
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
      result = nglReducers(result, actions.removeComponentRepresentation(objectInViewID, oldRepresentations[i].uuid));
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

  it('should save current state as default scene', () => {
    expect.hasAssertions();
    const currentState = {
      objectsInView: {
        molecule_1: {
          properties: [{ a: 'dfg' }],
          representations: [
            {
              lastKnownID: 78904,
              uuid: 9903,
              other: 'fdjsdj'
            },
            {
              lastKnownID: 178904,
              uuid: 19903,
              other: '1fdjsdj'
            }
          ]
        }
      },
      nglOrientations: { a: [24, 566] },
      countOfRemainingMoleculeGroups: 23,
      proteinsHasLoaded: false,
      countOfPendingNglObjects: 44
    };

    let result = nglReducers(Object.assign({}, initialState, currentState), actions.saveCurrentStateAsDefaultScene());
    // default scene contains current state
    expect(result[SCENES.defaultScene].nglOrientations).toStrictEqual(currentState.nglOrientations);
    // for each objectsInView
    Object.keys(result[SCENES.defaultScene].objectsInView).forEach(key => {
      expect(result[SCENES.defaultScene].objectsInView[key].properties).toStrictEqual(
        currentState.objectsInView[key].properties
      );
      // doesnt contains representation lastKnownID, uuid
      expect(result[SCENES.defaultScene].objectsInView[key].representations).toStrictEqual(
        expect.arrayContaining(
          currentState.objectsInView[key].representations.map(item => {
            delete item['lastKnownID'];
            delete item['uuid'];
            return item;
          })
        )
      );
    });
    // doesnt contains       ['countOfRemainingMoleculeGroups'];  ['proteinsHasLoaded']; ['countOfPendingNglObjects'];
    expect(result[SCENES.defaultScene].countOfRemainingMoleculeGroups).not.toBe(
      currentState.countOfRemainingMoleculeGroups
    );
    expect(result[SCENES.defaultScene].proteinsHasLoaded).not.toBe(currentState.proteinsHasLoaded);
    expect(result[SCENES.defaultScene].countOfPendingNglObjects).not.toBe(currentState.countOfPendingNglObjects);
  });

  it('should save current state as session scene', () => {
    expect.hasAssertions();
    const currentState = {
      objectsInView: {
        molecule_1: {
          properties: [{ a: 'dfg' }],
          representations: [
            {
              lastKnownID: 78904,
              uuid: 9903,
              other: 'fdjsdj'
            },
            {
              lastKnownID: 178904,
              uuid: 19903,
              other: '1fdjsdj'
            }
          ]
        }
      },
      nglOrientations: { a: [24, 566] },
      countOfRemainingMoleculeGroups: 23,
      proteinsHasLoaded: false,
      countOfPendingNglObjects: 44
    };

    let result = nglReducers(Object.assign({}, initialState, currentState), actions.saveCurrentStateAsSessionScene());
    // session scene contains current state
    expect(result[SCENES.sessionScene].nglOrientations).toStrictEqual(currentState.nglOrientations);
    // for each objectsInView
    Object.keys(result[SCENES.sessionScene].objectsInView).forEach(key => {
      expect(result[SCENES.sessionScene].objectsInView[key].properties).toStrictEqual(
        currentState.objectsInView[key].properties
      );
      // doesnt contains representation lastKnownID, uuid
      expect(result[SCENES.sessionScene].objectsInView[key].representations).toStrictEqual(
        expect.arrayContaining(
          currentState.objectsInView[key].representations.map(item => {
            delete item['lastKnownID'];
            delete item['uuid'];
            return item;
          })
        )
      );
    });
    // doesnt contains       ['countOfRemainingMoleculeGroups'];  ['proteinsHasLoaded']; ['countOfPendingNglObjects'];
    expect(result[SCENES.sessionScene].countOfRemainingMoleculeGroups).not.toBe(
      currentState.countOfRemainingMoleculeGroups
    );
    expect(result[SCENES.sessionScene].proteinsHasLoaded).not.toBe(currentState.proteinsHasLoaded);
    expect(result[SCENES.sessionScene].countOfPendingNglObjects).not.toBe(currentState.countOfPendingNglObjects);
  });

  it('should reset current state to default scene', () => {
    expect.hasAssertions();
    const defaultScene = {
      [SCENES.defaultScene]: {
        objectsInView: {
          molecule_1: {
            properties: [{ a: 'dfg' }],
            representations: [
              {
                lastKnownID: 78904,
                uuid: 9903,
                other: 'fdjsdj'
              },
              {
                lastKnownID: 178904,
                uuid: 19903,
                other: '1fdjsdj'
              }
            ]
          }
        },
        nglOrientations: { a: [24, 566] }
      }
    };

    let result = nglReducers(Object.assign({}, initialState, defaultScene), actions.resetStateToDefaultScene());
    expect(result.objectsInView).toStrictEqual(defaultScene[SCENES.defaultScene].objectsInView);
    expect(result.nglOrientations).toStrictEqual(defaultScene[SCENES.defaultScene].nglOrientations);
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
    let result = nglReducers(initialState, actions.incrementCountOfPendingNglObjects());
    expect(result.countOfPendingNglObjects).toBe(1);

    result = nglReducers(result, actions.decrementCountOfPendingNglObjects());
    expect(result.countOfPendingNglObjects).toBe(0);
  });
});
