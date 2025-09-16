/**
 * Created by abradley on 01/03/2018.
 */

import { Stage, Shape } from 'ngl';
import React, { memo, useEffect, useCallback, useContext, useState, useRef } from 'react';
import { connect } from 'react-redux';
import * as nglActions from '../../reducers/ngl/actions';
import * as nglDispatchActions from '../../reducers/ngl/dispatchActions';
import * as selectionActions from '../../reducers/selection/actions';
import { NglContext } from './nglProvider';
import { handleNglViewPick } from './redux/dispatchActions';
import { debounce } from 'lodash';
import { NGL_PARAMS } from './constants';
import { makeStyles, Popover, TextField, Button, Typography } from '@material-ui/core';
import { VIEWS } from '../../constants/constants';
import { INITIAL_STATE as NGL_INITIAL } from '../../reducers/ngl/nglReducers';

const useStyles = makeStyles(theme => ({
  paper: {
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.spacing(1) / 2,
    boxShadow: [
      '0px 2px 1px -1px rgba(0,0,0,0.2)',
      '0px 1px 1px 0px rgba(0,0,0,0.14)',
      '0px 1px 3px 0px rgba(0,0,0,0.12)'
    ],
    width: '100%',
    height: '100%'
  }
}));

const NglView = memo(
  ({
    div_id,
    height,
    setOrientation,
    removeAllNglComponents,
    handleNglViewPick,
    defaultRadius = 5,
    apiEndpoint = '/api/radius-selection'
  }) => {
    // connect to NGL Stage object
    const { registerNglView, unregisterNglView, getNglView } = useContext(NglContext);
    const [stage, setStage] = useState();
    const classes = useStyles();
    const [ready, setReady] = useState(false);

    const ref = useRef();

    const [popoverOpen, setPopoverOpen] = useState(false);
    const [anchorPos, setAnchorPos] = useState({ top: 0, left: 0 });
    const [radius, setRadius] = useState(String(defaultRadius)); // keep as string to allow empty
    const sphereCompRef = useRef(null);
    const lastOriginRef = useRef(null);

    const parseRadius = useCallback(
      val => {
        const n = parseFloat(val);
        return Number.isFinite(n) && n > 0 ? n : defaultRadius;
      },
      [defaultRadius]
    );

    const ensureSphereAt = useCallback(
      (originVec3, r) => {
        if (!stage || !originVec3 || !r) return;
        if (sphereCompRef.current) {
          try {
            stage.removeComponent(sphereCompRef.current);
          } catch (e) {}
          sphereCompRef.current = null;
        }
        const shape = new Shape('radius-sphere');
        shape.addSphere([originVec3.x, originVec3.y, originVec3.z], [0, 1, 0], r);
        const comp = stage.addComponentFromObject(shape);
        comp.addRepresentation('buffer', {
          opacity: 0.75,
          wireframe: false,
          depthWrite: true,
          depthTest: true,
          side: 'double',
          disableImpostor: true
        });
        sphereCompRef.current = comp;
      },
      [stage]
    );

    const submitRadius = useCallback(async () => {
      const origin = lastOriginRef.current;
      if (!origin) return;
      const value = parseRadius(radius);
      const payload = { origin: [origin.x, origin.y, origin.z], radius: value };
      try {
        await fetch(apiEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } catch (e) {}
      setPopoverOpen(false);
    }, [apiEndpoint, radius, parseRadius]);

    useEffect(() => {
      const monitor = () => {
        if (!ref.current?.isConnected) {
          setTimeout(monitor, 100);
        } else {
          setReady(true);
        }
      };

      monitor();
    }, []);

    const handleOrientationChanged = useCallback(
      debounce(() => {
        const newStage = getNglView(div_id);
        if (newStage) {
          const currentOrientation = newStage.stage.viewerControls.getOrientation();
          setOrientation(div_id, currentOrientation);
        }
      }, 250),
      [div_id, getNglView, setOrientation]
    );

    // Initialization of NGL View component
    const handleResize = useCallback(() => {
      const newStage = getNglView(div_id);
      if (newStage) {
        newStage.stage.handleResize();
      }
    }, [div_id, getNglView]);

    const handleStageClicked = useCallback(
      pickingProxy => {
        if (!pickingProxy) return;
        if (!(pickingProxy.atom || pickingProxy.bond)) return;
        const pos = pickingProxy.position?.clone?.();
        if (!pos) return;

        lastOriginRef.current = pos;
        ensureSphereAt(pos, parseRadius(radius));

        // Anchor popover to mouse cursor using NGL's mouseObserver
        const canvas = stage?.viewer?.renderer?.domElement;
        if (canvas && stage?.mouseObserver?.position) {
          const rect = canvas.getBoundingClientRect();
          const m = stage.mouseObserver.position;
          setAnchorPos({
            top: Math.round(rect.top + m.y),
            left: Math.round(rect.left + m.x)
          });
        }
        setPopoverOpen(true);
      },
      [ensureSphereAt, parseRadius, radius, stage]
    );

    const registerStageEvents = useCallback(
      (newStage, getNglView) => {
        if (newStage) {
          window.addEventListener('resize', handleResize);
          newStage.mouseControls.add('clickPick-left', (st, pickingProxy) =>
            handleNglViewPick(st, pickingProxy, getNglView)
          );

          newStage.mouseObserver.signals.scrolled.add(handleOrientationChanged);
          newStage.mouseObserver.signals.dropped.add(handleOrientationChanged);
          newStage.mouseObserver.signals.dragged.add(handleOrientationChanged);

          newStage.signals.clicked.add(handleStageClicked);
        }
      },
      [handleResize, handleOrientationChanged, handleNglViewPick, handleStageClicked]
    );

    const unregisterStageEvents = useCallback(
      (newStage, getNglView) => {
        if (newStage) {
          window.removeEventListener('resize', handleResize);
          newStage.mouseControls.remove('clickPick-left', (st, pickingProxy) =>
            handleNglViewPick(st, pickingProxy, getNglView)
          );
          newStage.mouseObserver.signals.scrolled.remove(handleOrientationChanged);
          newStage.mouseObserver.signals.dropped.remove(handleOrientationChanged);
          newStage.mouseObserver.signals.dragged.remove(handleOrientationChanged);
          newStage.signals.clicked.remove(handleStageClicked);
        }
      },
      [handleResize, handleOrientationChanged, handleNglViewPick, handleStageClicked]
    );

    useEffect(() => {
      if (ready) {
        const nglViewFromContext = getNglView(div_id);
        if (stage === undefined && !nglViewFromContext) {
          const newStage = new Stage(div_id);
          if (div_id === VIEWS.MAJOR_VIEW) {
            for (const [key, value] of Object.entries(NGL_INITIAL.viewParams)) {
              newStage.setParameters({ [key]: value });
            }
          } else {
            newStage.setParameters({
              [NGL_PARAMS.backgroundColor]: NGL_INITIAL.viewParams[NGL_PARAMS.backgroundColor]
            });
          }
          registerNglView(div_id, newStage);
          registerStageEvents(newStage, getNglView);
          setStage(newStage);
        } else if (stage === undefined && nglViewFromContext && nglViewFromContext.stage) {
          registerStageEvents(nglViewFromContext.stage, getNglView);
          setStage(nglViewFromContext.stage);
        } else if (stage) {
          registerStageEvents(stage, getNglView);
        }
      }

      return () => {
        if (stage) {
          unregisterStageEvents(stage, getNglView);
          unregisterNglView(div_id);
        }
      };
    }, [
      div_id,
      handleResize,
      registerNglView,
      unregisterNglView,
      handleOrientationChanged,
      removeAllNglComponents,
      registerStageEvents,
      unregisterStageEvents,
      stage,
      getNglView,
      ready
    ]);

    useEffect(() => {
      const node = ref.current;
      const resizeObserver = new ResizeObserver(() => {
        handleResize();
      });

      resizeObserver.observe(node);

      return () => {
        resizeObserver.unobserve(node);
      };
    }, [handleResize]);

    useEffect(() => {
      if (lastOriginRef.current && stage) {
        ensureSphereAt(lastOriginRef.current, parseRadius(radius));
      }
    }, [radius, parseRadius, stage, ensureSphereAt]);

    return (
      <>
        <div ref={ref} id={div_id} className={div_id === VIEWS.MAJOR_VIEW ? classes.paper : {}} />

        <Popover
          open={popoverOpen}
          onClose={() => setPopoverOpen(false)}
          anchorReference="anchorPosition"
          anchorPosition={anchorPos}
          transformOrigin={{ vertical: 'top', horizontal: 'left' }}
          PaperProps={{ style: { padding: 12, minWidth: 260 } }}
        >
          <Typography variant="subtitle1" style={{ fontWeight: 600, marginBottom: 8 }}>
            Radius selection
          </Typography>
          <TextField
            label="Radius (Å)"
            type="number"
            inputProps={{ min: 0, step: 0.5 }}
            value={radius}
            onChange={e => setRadius(e.target.value)}
            fullWidth
          />
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 12 }}>
            <Button onClick={() => setPopoverOpen(false)}>Cancel</Button>
            <Button variant="contained" color="primary" onClick={submitRadius}>
              Apply
            </Button>
          </div>
        </Popover>
      </>
    );
  }
);

function mapStateToProps(state) {
  return {};
}
const mapDispatchToProps = {
  setMolGroupSelection: selectionActions.setMolGroupSelection,
  setOrientation: nglDispatchActions.setOrientationByInteraction,
  removeAllNglComponents: nglActions.removeAllNglComponents,
  handleNglViewPick
};

NglView.displayName = 'NglView';

export default connect(mapStateToProps, mapDispatchToProps)(NglView);
