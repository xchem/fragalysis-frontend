/**
 * This component creates a button for reporting new issues and handling them.
 */

import React, { memo, useState, useContext, useRef } from 'react';
import { Grid, makeStyles, Typography, Popover, Box, Slider, Tooltip } from '@material-ui/core';
import Alert from '@material-ui/lab/Alert';
import { ReportProblem, EmojiObjects, Delete } from '@material-ui/icons';
import { Button } from '../common/Inputs/Button';
import Modal from '../common/Modal';
import { HeaderContext } from '../header/headerContext';
import { Formik, Form, Field } from 'formik';
import { createIssue } from './githubApi';
import { canCaptureScreen, captureScreen, isFirefox, isChrome } from './browserApi';
import { resetForm, setName, setEmail, setTitle, setDescription } from './redux/actions';
import { useDispatch, useSelector } from 'react-redux';
import { snackbarColors } from '../header/constants';
import CanvasDraw from 'react-canvas-draw';
import { SketchPicker } from 'react-color';
import { TextField } from 'formik-material-ui';

/* Min resolution is 960 x 540 */
const FORM_MIN_WIDTH = 960;
const FORM_MIN_HEIGHT = 540;
const CANVAS_MAX_WIDTH = 605;
const CANVAS_MAX_HEIGHT = 400;

const useStyles = makeStyles(theme => ({
  buttonGreen: {
    margin: theme.spacing(1),
    color: 'green'
  },
  buttonRed: {
    margin: theme.spacing(1),
    color: 'red'
  },
  input: {
    width: '100%',
    minWidth: '256px'
  },
  description: {
    minHeight: '245px'
  },
  body: {
    width: '100%',
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1)
  },
  pt: {
    paddingTop: theme.spacing(2)
  },
  link: {
    color: theme.palette.primary.contrastText,
    '&:visited': {
      color: theme.palette.primary.contrastText
    },
    '&:active': {
      color: theme.palette.primary.contrastText
    },
    '&:hover': {
      backgroundColor: theme.palette.primary.main,
      color: theme.palette.primary.contrastText
    }
  },
  canvasDrawOptions: {
    marginTop: '6px',
    marginBottom: '2px'
  },
  formModal: {
    minWidth: FORM_MIN_WIDTH + 'px',
    minHeight: FORM_MIN_HEIGHT + 'px'
  },
  canvasDrawWrapper: {
    overflow: 'auto',
    width: CANVAS_MAX_WIDTH + 'px',
    height: CANVAS_MAX_HEIGHT + 'px',
    position: 'absolute'
  },
  canvasNoImage: {
    paddingTop: '200px'
  }
}));

export const FORM_TYPE = { ISSUE: 'ISSUE', IDEA: 'IDEA' };

export const ReportForm = memo(({ formType }) => {
  const classes = useStyles();

  const dispatch = useDispatch();
  const formState = useSelector(state => state.issueReducers);
  const { setSnackBarTitle, setSnackBarColor } = useContext(HeaderContext);

  const getTitle = () => {
    switch (formType) {
      case FORM_TYPE.ISSUE:
        return 'Report issue';
      case FORM_TYPE.IDEA:
        return 'Submit idea';

      default:
        return 'Unknown report';
    }
  };
  const getCreatedText = () => {
    switch (formType) {
      case FORM_TYPE.IDEA:
        return 'New idea was created: ';
      case FORM_TYPE.ISSUE:

      default:
        return 'New issue was created: ';
    }
  };
  const getLabels = () => {
    switch (formType) {
      case FORM_TYPE.ISSUE:
        return ['issue'];
      case FORM_TYPE.IDEA:
        return ['idea'];

      default:
        return [];
    }
  };
  const getButtonIcon = () => {
    switch (formType) {
      case FORM_TYPE.ISSUE:
        return <ReportProblem />;
      case FORM_TYPE.IDEA:
        return <EmojiObjects />;

      default:
        return <ReportProblem />;
    }
  };
  const getButtonStyle = () => {
    switch (formType) {
      case FORM_TYPE.IDEA:
        return classes.buttonGreen;
      case FORM_TYPE.ISSUE:

      default:
        return classes.buttonRed;
    }
  };

  const afterCreateIssueCallback = url => {
    setSnackBarTitle(
      <>
        {getCreatedText()}
        <a href={url} target="_blank" className={classes.link}>
          {url}
        </a>
      </>
    );
    setSnackBarColor(snackbarColors.default);
    handleCloseForm();
  };

  /* Modal handlers */
  //  const [openForm, setOpenForm] = useState(false);
  const isOpenForm = useSelector(state => state.issueReducers.isOpenForm);
  const [openDialog, setOpenDialog] = useState(false);
  const [disablePictureModification, setDisablePictureModification] = useState(false);
  const [modalWidth, setModalWidth] = useState(0);
  const [modalHeight, setModalHeight] = useState(0);
  const canvasWrapperGridItem = useRef();
  const canvasWrapper = useRef();
  const canvasDraw = useRef();
  const colorPicker = useRef();
  const [wrapperWidth, setWrapperWidth] = useState(CANVAS_MAX_WIDTH);
  const [wrapperHeight, setWrapperHeight] = useState(CANVAS_MAX_HEIGHT);
  const [openBrushColor, setOpenBrushColor] = useState(false);
  const [brushRadius, setBrushRadius] = useState(2);
  const [brushColor, setBrushColor] = useState('#444');

  const modalOnResize = (entry, node) => {
    // initialize modal width and height
    if (node && !modalWidth && !modalHeight) {
      setModalWidth(node.offsetWidth);
      setModalHeight(node.offsetHeight);
    }
    if (canvasWrapper && canvasWrapper.current) {
      const changedWidth = entry.target.offsetWidth;
      if (modalWidth && modalWidth < changedWidth) {
        // set new width from its flex div container
        let newWidth = canvasWrapperGridItem.current.offsetWidth;
        if (newWidth > formState.imageSource.width) {
          // 17 is for scroll
          newWidth = formState.imageSource.width + 17;
        }
        canvasWrapper.current.style.width = newWidth + 'px';
      }
      const changedHeight = entry.target.offsetHeight;
      if (modalHeight && modalHeight < changedHeight) {
        // compute new height
        let newHeight = wrapperHeight + changedHeight - modalHeight;
        if (newHeight > formState.imageSource.height) {
          newHeight = formState.imageSource.height;
        }
        canvasWrapperGridItem.current.style.flexBasis = newHeight + 'px';
        canvasWrapper.current.style.height = canvasWrapperGridItem.current.offsetHeight + 'px';
      }
    }
  };

  const handleColorChange = color => {
    setBrushColor(color.hex);
  };

  /**
   * Clear drawing, i.e. second canvas of CanvasDraw
   */
  const handleClearDrawing = () => {
    if (canvasDraw && canvasDraw.current.canvasContainer.children.length > 0) {
      // cursor, drawing, interface, backgroundImage
      let rootCanvas = canvasDraw.current.canvasContainer.children[1];
      let rootCanvasContex = rootCanvas.getContext('2d');
      rootCanvasContex.clearRect(0, 0, rootCanvas.width, rootCanvas.height);
    }
  };

  /**
   * Merge canvas layers into one and then get its data URL
   * @param ref - ref of CanvasDraw
   * @return string - toDataURL|''
   */
  const getCanvasDrawDataUrl = canvasDraw => {
    if (canvasDraw && canvasDraw.current?.canvasContainer.children.length > 0) {
      // cursor, drawing, interface, backgroundImage
      let rootCanvas = canvasDraw.current.canvasContainer.children[3];
      let rootCanvasContex = rootCanvas.getContext('2d');
      rootCanvasContex.drawImage(canvasDraw.current.canvasContainer.children[1], 0, 0);
      return rootCanvas.toDataURL();
    } else {
      return '';
    }
  };

  const isResponse = () => {
    return isOpenForm && formState.response.length > 0;
  };

  const handleOpenForm = () => {
    dispatch(captureScreen());
  };

  const handleCloseForm = () => {
    dispatch(resetForm());
  };

  const handleOpenDialog = () => {
    if (canCaptureScreen()) {
      setOpenDialog(true);
    } else {
      handleOpenForm();
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };
  const handleSubmitDialog = () => {
    handleCloseDialog();
    handleOpenForm();
  };

  const getHintText = () => {
    let text = 'please choose your window or screen to share';
    if (isFirefox()) {
      text += ' (ideally enter fullscreen - F11) and "Allow" it';
    } else if (isChrome()) {
      text += ', ideally "Chrome tab" and your current tab';
    }
    return text;
  };

  const getTextAreaRows = rows => {
    return isFirefox() ? rows - 1 : rows;
  };

  return (
    <div>
      <Button
        startIcon={getButtonIcon()}
        variant="text"
        size="small"
        className={getButtonStyle()}
        onClick={handleOpenDialog}
        disabled={true}
      >
        {getTitle()}
      </Button>
      <Modal open={openDialog}>
        <Grid container direction="column" className={classes.pt}>
          <Grid item>
            <Typography variant="body1">
              It is helpful to provide a screenshot of your current state, therefore you are going to be prompted by
              browser to do so.
            </Typography>
            <Typography variant="body1">After you proceed, {getHintText()}.</Typography>
          </Grid>
          <Grid container justify="flex-end" direction="row">
            <Grid item>
              <Button onClick={handleCloseDialog}>Cancel</Button>
            </Grid>
            <Grid item>
              <Button color="primary" onClick={handleSubmitDialog}>
                Proceed
              </Button>
            </Grid>
          </Grid>
        </Grid>
      </Modal>
      <Modal open={isOpenForm} otherClasses={[classes.formModal]} resizable={true} onResize={modalOnResize}>
        <Grid container direction="row" className={classes.body} spacing={1}>
          <Grid item xs={4}>
            <Formik
              initialValues={{
                name: formState.name,
                email: formState.email,
                title: formState.title,
                description: formState.description
              }}
              validate={values => {
                const errors = {};
                if (!values.title) {
                  errors.title = 'Required field.';
                } else if (values.title.length > 256) {
                  errors.title =
                    'Title has limit of 256 characters: ' + Math.abs(256 - values.title.length) + ' exceeded.';
                }
                if (!values.description) {
                  errors.description = 'Required field.';
                }
                if (values.email && !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(values.email)) {
                  errors.email = 'Invalid email address.';
                }
                return errors;
              }}
              onSubmit={values => {
                // dispatch(setImageSource(getCanvasDrawDataUrl(canvasDraw))); // does not update in time
                // set new image from drawing before creating issue
                dispatch(setName(values.name));
                dispatch(setEmail(values.email));
                dispatch(setTitle(values.title));
                dispatch(setDescription(values.description));
                setDisablePictureModification(true);
                const imageSource = getCanvasDrawDataUrl(canvasDraw);
                dispatch(
                  createIssue({
                    imageSource,
                    formType: formType.toLowerCase(),
                    labels: getLabels(),
                    afterCreateIssueCallback,
                    name: values.name,
                    email: values.email,
                    title: values.title,
                    description: values.description
                  })
                );
              }}
            >
              {({ submitForm, isSubmitting }) => (
                <Form>
                  {isResponse() && <Alert severity="error">{formState.response}</Alert>}

                  <Grid container direction="column">
                    <Grid item xs={12}>
                      <Typography variant="h3">{getTitle()}</Typography>
                      <Field
                        component={TextField}
                        name="name"
                        label="Name"
                        disabled={isSubmitting}
                        className={classes.input}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Field
                        component={TextField}
                        name="email"
                        label="Email"
                        disabled={isSubmitting}
                        className={classes.input}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Field
                        component={TextField}
                        required
                        name="title"
                        label="Subject"
                        multiline
                        rows={getTextAreaRows(3)}
                        disabled={isSubmitting}
                        className={classes.input}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Field
                        component={TextField}
                        required
                        name="description"
                        label="Description"
                        placeholder="Describe your problem in a detail."
                        multiline
                        rows={getTextAreaRows(12)}
                        disabled={isSubmitting}
                        className={classes.input + ' ' + classes.description}
                      />
                    </Grid>

                    <Grid item xs={12} container justify="flex-start" direction="row">
                      <Grid item>
                        <Button disabled={isSubmitting} onClick={handleCloseForm}>
                          Close
                        </Button>
                      </Grid>
                      <Grid item>
                        <Button color="primary" loading={isSubmitting} onClick={submitForm}>
                          {getTitle()}
                        </Button>
                      </Grid>
                    </Grid>
                  </Grid>
                </Form>
              )}
            </Formik>
          </Grid>
          <Grid item xs={8}>
            <Grid container direction="column">
              {/* Canvas options */}
              <Grid
                item
                xs
                container
                justify="center"
                alignItems="center"
                direction="row"
                spacing={2}
                className={classes.canvasDrawOptions}
              >
                <Grid
                  item
                  xs={2}
                  align="center"
                  container
                  direction="row"
                  justify="space-between"
                  alignItems="center"
                  spacing={1}
                >
                  <Grid item xs={5}>
                    <Typography>Color</Typography>
                  </Grid>
                  <Grid item xs={5}>
                    <Tooltip title="Select color">
                      <Box
                        ref={colorPicker}
                        border="1px solid black"
                        bgcolor={brushColor}
                        width={24}
                        height={24}
                        spacing={1}
                        onClick={() => setOpenBrushColor(true)}
                      />
                    </Tooltip>
                    <Popover
                      anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'left'
                      }}
                      transformOrigin={{
                        vertical: 'top',
                        horizontal: 'right'
                      }}
                      anchorEl={colorPicker.current}
                      open={openBrushColor}
                      onClose={() => setOpenBrushColor(false)}
                    >
                      <SketchPicker color={brushColor} disableAlpha={true} onChangeComplete={handleColorChange} />
                    </Popover>
                  </Grid>
                </Grid>
                <Grid
                  item
                  xs={7}
                  align="center"
                  container
                  direction="row"
                  justify="space-between"
                  alignItems="center"
                  spacing={1}
                >
                  <Grid item xs={2}>
                    <Typography>Radius</Typography>
                  </Grid>
                  <Grid item xs={10}>
                    <Tooltip title="Select brush radius">
                      <Slider
                        value={brushRadius}
                        step={1}
                        marks
                        min={1}
                        max={6}
                        valueLabelDisplay="auto"
                        onChange={(event, newValue) => setBrushRadius(newValue)}
                        disabled={disablePictureModification}
                      />
                    </Tooltip>
                  </Grid>
                </Grid>
                <Grid
                  item
                  xs={3}
                  align="center"
                  container
                  direction="row"
                  justify="flex-end"
                  alignItems="center"
                  spacing={1}
                >
                  <Grid item xs>
                    <Tooltip title="Clear drawing">
                      <Button
                        startIcon={<Delete />}
                        variant="text"
                        size="small"
                        onClick={handleClearDrawing}
                        disabled={disablePictureModification}
                      >
                        Clear
                      </Button>
                    </Tooltip>
                  </Grid>
                </Grid>
              </Grid>
              {/* Canvas */}
              <Grid ref={canvasWrapperGridItem} item xs align="center">
                {formState.imageSource ? (
                  <div
                    ref={canvasWrapper}
                    // TODO remove width and height!
                    width={wrapperWidth}
                    height={wrapperHeight}
                    className={classes.canvasDrawWrapper}
                  >
                    {/* lazyRadius - how far is cursor from drawing point */}
                    <CanvasDraw
                      ref={canvasDraw}
                      imgSrc={formState.imageSource.toDataURL()}
                      canvasWidth={formState.imageSource.width}
                      canvasHeight={formState.imageSource.height}
                      hideGrid={true}
                      lazyRadius={0}
                      brushRadius={brushRadius}
                      brushColor={brushColor}
                      disabled={disablePictureModification}
                    />
                  </div>
                ) : (
                  <Typography className={classes.canvasNoImage}>No image source.</Typography>
                )}
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Modal>
    </div>
  );
});
