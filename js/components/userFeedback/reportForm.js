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
import { Formik, Form } from 'formik';
import { TextField } from 'formik-material-ui';
import { createIssue } from './githubApi';
import { canCaptureScreen, captureScreen, isFirefox, isChrome } from './browserApi';
import { resetForm, setName, setEmail, setTitle, setDescription, setImageSource } from './redux/actions';
import { useDispatch, useSelector } from 'react-redux';
import { snackbarColors } from '../header/constants';
import CanvasDraw from 'react-canvas-draw';
import { SketchPicker } from 'react-color';

const CANVAS_MAX_WIDTH = 605;
const CANVAS_MAX_HEIGHT = 305;

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
  formMinWidth: {
    minWidth: '900px'
  },
  canvasDrawWrapper: {
    overflow: 'auto',
    maxWidth: CANVAS_MAX_WIDTH + 'px',
    maxHeight: CANVAS_MAX_HEIGHT + 'px',
    position: 'absolute'
  }
}));

export const FORM_TYPE = { ISSUE: 'ISSUE', IDEA: 'IDEA' };

export const ReportForm = memo(({ formType }) => {
  const classes = useStyles();

  const dispatch = useDispatch();
  const formState = useSelector(state => state.issueReducers);
  const { setSnackBarTitle, setSnackBarColor } = useContext(HeaderContext);

  /* Specific form type functions */
  const isValidType = () => {
    let valid = false;
    for (let [key, value] of Object.entries(FORM_TYPE)) {
      if (value === formType) {
        valid = true;
        break;
      }
    }
    return valid;
  };
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
  const [openForm, setOpenForm] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const canvasDraw = useRef();
  const colorPicker = useRef();
  const [openBrushColor, setOpenBrushColor] = useState(false);
  const [brushRadius, setBrushRadius] = useState(2);
  const [brushColor, setBrushColor] = useState('#444');

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
    if (canvasDraw && canvasDraw.current.canvasContainer.children.length > 0) {
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
    return openForm && formState.response.length > 0;
  };

  const handleOpenForm = async () => {
    await dispatch(captureScreen());
    setOpenForm(true);
  };

  const handleCloseForm = () => {
    setOpenForm(false);
    dispatch(resetForm());
  };

  const handleOpenDialog = () => {
    if (canCaptureScreen()) {
      setOpenDialog(true);
    } else {
      handleOpenForm(true);
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

  return (
    <div>
      <Button
        startIcon={getButtonIcon()}
        variant="text"
        size="small"
        className={getButtonStyle()}
        onClick={handleOpenDialog}
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
      <Modal open={openForm}>
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
              errors.title = 'Title has limit of 256 characters: ' + Math.abs(256 - values.title.length) + ' exceeded.';
            }
            if (!values.description) {
              errors.description = 'Required field.';
            }
            if (values.email && !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(values.email)) {
              errors.email = 'Invalid email address.';
            }
            return errors;
          }}
          onSubmit={async (values, { setSubmitting }) => {
            // dispatch(setImageSource(getCanvasDrawDataUrl(canvasDraw))); // does not update in time
            // set new image from drawing before creating issue
            const imageSource = getCanvasDrawDataUrl(canvasDraw);
            await dispatch(
              createIssue(formState, imageSource, formType.toLowerCase(), getLabels(), afterCreateIssueCallback)
            );
            setSubmitting(false);
          }}
        >
          {({ submitForm, isSubmitting }) => (
            <Form className={classes.formMinWidth}>
              <Grid container direction="column" className={classes.body}>
                {isResponse() && <Alert severity="error">{formState.response}</Alert>}

                <Grid item xs={12} container direction="row" spacing={2}>
                  <Grid item xs={4}>
                    <Grid container direction="column">
                      <Grid item xs>
                        <Typography variant="h3">{getTitle()}</Typography>
                        <TextField
                          name="name"
                          label="Name"
                          value={formState.name}
                          onInput={e => dispatch(setName(e.target.value))}
                          disabled={isSubmitting}
                          className={classes.input}
                        />
                      </Grid>
                      <Grid item xs>
                        <TextField
                          name="email"
                          label="Email"
                          value={formState.email}
                          onInput={e => dispatch(setEmail(e.target.value))}
                          disabled={isSubmitting}
                          className={classes.input}
                        />
                      </Grid>
                      <Grid item xs>
                        <TextField
                          required
                          name="title"
                          label="Subject"
                          multiline
                          rows="2"
                          value={formState.title}
                          onInput={e => dispatch(setTitle(e.target.value))}
                          disabled={isSubmitting}
                          className={classes.input}
                        />
                      </Grid>
                      <Grid item xs>
                        <TextField
                          required
                          name="description"
                          label="Description"
                          placeholder="Describe your problem in a detail."
                          multiline
                          rows="6"
                          value={formState.description}
                          onInput={e => dispatch(setDescription(e.target.value))}
                          disabled={isSubmitting}
                          className={classes.input}
                        />
                      </Grid>
                    </Grid>
                  </Grid>

                  <Grid item xs={8}>
                    <Grid item container justify="flex-end" direction="column">
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
                              <SketchPicker
                                color={brushColor}
                                disableAlpha={true}
                                onChangeComplete={handleColorChange}
                              />
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
                                disabled={isSubmitting}
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
                                disabled={isSubmitting}
                              >
                                Clear
                              </Button>
                            </Tooltip>
                          </Grid>
                        </Grid>
                      </Grid>
                      <Grid item xs>
                        <div className={classes.canvasDrawWrapper}>
                          {/* lazyRadius - how far is cursor from drawing point */}
                          <CanvasDraw
                            ref={canvasDraw}
                            imgSrc={formState.imageSource ? formState.imageSource.toDataURL() : ''}
                            canvasWidth={formState.imageSource ? formState.imageSource.width : CANVAS_MAX_WIDTH}
                            canvasHeight={formState.imageSource ? formState.imageSource.height : CANVAS_MAX_HEIGHT}
                            hideGrid={true}
                            lazyRadius={0}
                            brushRadius={brushRadius}
                            brushColor={brushColor}
                            disabled={isSubmitting}
                          />
                        </div>
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>

                <Grid item xs={12} container justify="flex-end" direction="row">
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
      </Modal>
    </div>
  );
});
