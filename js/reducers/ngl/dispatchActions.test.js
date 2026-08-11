import configureStore from 'redux-mock-store';
import { thunk } from 'redux-thunk';
import {
  centerOnLigandsByMoleculeIDs,
  deleteObject,
  loadObject,
  setOrientation
} from './dispatchActions';
import { getAction } from '../../utils/testUtils';
import {
  decrementCountOfPendingNglObjects,
  deleteNglObject,
  incrementCountOfPendingNglObjects,
  loadNglObject,
  setNglOrientation
} from './actions';
import { OBJECT_TYPE, SELECTION_TYPE } from '../../components/nglView/constants';
import {
  removeFromArtefactsChainList,
  removeFromComplexList,
  removeFromFragmentDisplayList,
  removeFromVectorOnList
} from '../selection/actions';
import { VIEWS } from '../../constants/constants';
const { fn } = jest;

const createVector = (x, y, z) => ({
  x,
  y,
  z,
  add(value) {
    this.x += value.x;
    this.y += value.y;
    this.z += value.z;
    return this;
  },
  clone() {
    return createVector(this.x, this.y, this.z);
  },
  divideScalar(value) {
    this.x /= value;
    this.y /= value;
    this.z /= value;
    return this;
  },
  set(nextX, nextY, nextZ) {
    this.x = nextX;
    this.y = nextY;
    this.z = nextZ;
    return this;
  }
});

const createBox = (minX, maxX) => ({
  min: createVector(minX, -1, -1),
  max: createVector(maxX, 1, 1),
  clone() {
    return createBox(this.min.x, this.max.x);
  },
  union(value) {
    this.min.x = Math.min(this.min.x, value.min.x);
    this.max.x = Math.max(this.max.x, value.max.x);
    return this;
  }
});

describe("testing ngl reducer's async actions", () => {
  const middlewares = [thunk]; // add your middlewares like `redux-thunk`
  const mockStore = configureStore(middlewares);

  it('should load object', () => {
    expect.hasAssertions();
    let store = mockStore({
      nglReducers: {
        objectsInViewStash: {}
      }
    });
    const target = {
      name: 'My protein',
      OBJECT_TYPE: OBJECT_TYPE.PROTEIN,
      display_div: VIEWS.MAJOR_VIEW,
      property: { a: 'sdff' }
    };

    const stage = {
      loadFile: fn(() =>
        Promise.resolve({
          addRepresentation: fn(() => ({
            uuid: null,
            getParameters: fn(() => {}),
            repr: { parameters: {} }
          })),
          autoView: fn()
        })
      )
    };

    // eslint-disable-next-line jest/no-test-return-statement
    return store
      .dispatch(loadObject({ target, stage }))
      .then(async () => {
        const loadAction = await getAction(store, loadNglObject);
        expect(loadAction).not.toBeNull();
        expect(loadAction.target).toStrictEqual(target);
        expect(loadAction.representations.length).toBeGreaterThan(0);
      })
      .finally(async () => {
        expect(await getAction(store, incrementCountOfPendingNglObjects)).not.toBeNull();
        expect(await getAction(store, decrementCountOfPendingNglObjects)).not.toBeNull();
      });
  });

  it('should delete object', async () => {
    expect.hasAssertions();
    let store = mockStore();
    const targetLigand = {
      selectionType: SELECTION_TYPE.LIGAND,
      moleculeId: 1
    };
    const targetComplex = {
      selectionType: SELECTION_TYPE.COMPLEX,
      moleculeId: 2
    };
    const targetVector = {
      selectionType: SELECTION_TYPE.VECTOR,
      moleculeId: 3
    };
    const targetArtefact = {
      selectionType: SELECTION_TYPE.ARTEFACTS,
      moleculeId: 4
    };

    const stage = {
      loadFile: fn(() =>
        Promise.resolve({
          addRepresentation: fn(() => ({
            uuid: null,
            getParameters: fn(() => {}),
            repr: { parameters: {} }
          })),
          autoView: fn()
        })
      ),
      getComponentsByName: fn(() => ({
        list: [1, 2, 3]
      })),
      removeComponent: fn(() => {})
    };

    await store.dispatch(deleteObject(targetLigand, stage, true));
    expect(await getAction(store, removeFromFragmentDisplayList)).not.toBeNull();
    store.clearActions();

    await store.dispatch(deleteObject(targetComplex, stage, true));
    expect(await getAction(store, removeFromComplexList)).not.toBeNull();
    store.clearActions();

    await store.dispatch(deleteObject(targetVector, stage, true));
    expect(await getAction(store, removeFromVectorOnList)).not.toBeNull();
    store.clearActions();

    await store.dispatch(deleteObject(targetArtefact, stage, true));
    expect(await getAction(store, removeFromArtefactsChainList)).not.toBeNull();
    store.clearActions();

    await store.dispatch(deleteObject(targetLigand, stage, false));
    expect(await getAction(store, deleteNglObject)).not.toBeNull();
  });

  it('should set orientation', async () => {
    expect.hasAssertions();
    const orientation = {
      elements: [1, 2, 3, 'df']
    };

    const div_id = 'MAJOR_VIEW';

    let store = mockStore({
      nglReducers: {
        nglOrientations: {
          first: { elements: [35, 'g'] },
          [div_id]: orientation,
          third: { elements: [235, 'g3'] }
        }
      }
    });

    await store.dispatch(setOrientation(div_id, orientation));
    expect(await store.getActions()).toHaveLength(0);

    let storeWithAnotherOrientationElem = mockStore({
      nglReducers: {
        nglOrientations: {
          first: { elements: [35, 'g'] },
          [div_id]: { elements: [3534, 'wfsweg'] },
          third: { elements: [235, 'g3'] }
        }
      }
    });

    await storeWithAnotherOrientationElem.dispatch(setOrientation(div_id, orientation));
    expect(await getAction(storeWithAnotherOrientationElem, setNglOrientation)).not.toBeNull();

    let storeWithoutOrientations = mockStore({
      nglReducers: {
        nglOrientations: undefined
      }
    });

    await storeWithoutOrientations.dispatch(setOrientation(div_id, orientation));
    expect(await getAction(storeWithoutOrientations, setNglOrientation)).not.toBeNull();

    let storeWithNotAllOrientations = mockStore({
      nglReducers: {
        nglOrientations: {
          first: { elements: [35, 'g'] },
          second: { elements: [235, 'g3'] }
        }
      }
    });
    await storeWithNotAllOrientations.dispatch(setOrientation(div_id, orientation));
    expect(await getAction(storeWithNotAllOrientations, setNglOrientation)).not.toBeNull();
  });

  it('centers on unique displayed ligand objects selected by molecule id', async () => {
    expect.hasAssertions();
    const designComponent = {
      getCenter: fn(() => createVector(0, 0, 0)),
      getBox: fn(() => createBox(-1, 1))
    };
    const inspirationComponent = {
      getCenter: fn(() => createVector(10, 0, 0)),
      getBox: fn(() => createBox(9, 11))
    };
    const components = {
      design_ligand: designComponent,
      inspiration_ligand: inspirationComponent
    };
    const orientation = { elements: [1, 0, 0, 1] };
    const stage = {
      animationControls: { zoomMove: fn() },
      getComponentsByName: fn(name => ({ first: components[name], list: [] })),
      getZoomForBox: fn(() => -25),
      viewerControls: { getOrientation: fn(() => orientation) }
    };
    const store = mockStore({
      selectionReducers: { fragmentDisplayList: [1, 2, 3] },
      nglReducers: {
        objectsInView: {
          design_ligand: { moleculeId: 1, OBJECT_TYPE: OBJECT_TYPE.LIGAND },
          inspiration_ligand: { moleculeId: 2, OBJECT_TYPE: OBJECT_TYPE.LIGAND },
          unrelated_ligand: { moleculeId: 3, OBJECT_TYPE: OBJECT_TYPE.LIGAND }
        }
      }
    });

    expect(await store.dispatch(centerOnLigandsByMoleculeIDs(stage, [1, 2, 2]))).toBe(true);

    const centeredPosition = stage.animationControls.zoomMove.mock.calls[0][0];
    expect(centeredPosition).toStrictEqual(expect.objectContaining({ x: 5, y: 0, z: 0 }));
    expect(stage.getComponentsByName).toHaveBeenCalledTimes(2);
    expect(await getAction(store, setNglOrientation)).toStrictEqual(
      expect.objectContaining({ orientation, div_id: VIEWS.MAJOR_VIEW })
    );
  });

});
