/**
 * This component creates a button for reporting new issues and handling them.
 */

import React, { memo, useContext } from 'react';
import { ButtonBase, Grid, makeStyles, Typography } from '@material-ui/core';
import Alert from '@material-ui/lab/Alert';
import { ReportProblem } from '@material-ui/icons'; // EmojiObjects for new idea
import { Button } from '../common/Inputs/Button';
import Modal from '../common/Modal';
import axios from 'axios';
import { HeaderContext } from '../header/headerContext';
import { DJANGO_CONTEXT } from '../../utils/djangoContext';
import { Formik, Form } from 'formik';
import { TextField } from 'formik-material-ui';

import './css/styles.css';

const useStyles = makeStyles(theme => ({
  button: {
    margin: theme.spacing(1),
    color: 'red'
  },
  input: {
    width: '100%'
  },
  body: {
    width: '100%',
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1)
  },
  pt: {
    paddingTop: theme.spacing(2)
  },
  // https://material-ui.com/components/grid/
  image: {
    width: 256,
    height: 256
  },
  img: {
    margin: 'auto',
    display: 'block',
    maxWidth: '100%',
    maxHeight: '100%'
  }
}));

// TODO change axios to api, move logic into ./redux/

export const IssueReport = memo(() => {
  const classes = useStyles();
  const { setSnackBarTitle } = useContext(HeaderContext);

  /* Form handlers */
  const [name, setName] = React.useState(DJANGO_CONTEXT['name'] || '');
  const [email, setEmail] = React.useState(DJANGO_CONTEXT['email'] || '');
  const [title, setTitle] = React.useState('');
  const [description, setDescrition] = React.useState('');
  const [response, setResponse] = React.useState('');

  const resetForm = () => {
    setTitle('');
    setDescrition('');
    setImageSource('');
    setResponse('');
  };

  /* Getting image from screen capture */
  const [imageSource, setImageSource] = React.useState('');

  const canCaptureScreen = () => {
    // TODO edge  Available as a member of Navigator instead of MediaDevices.
    return window.isSecureContext && typeof navigator.mediaDevices !== 'undefined' && typeof navigator.mediaDevices.getDisplayMedia !== 'undefined';
  }

  const takeScreenshot = async () => {
    let canvas = null;
    // https://jsfiddle.net/8dz98u4r/
    const stream = await navigator.mediaDevices.getDisplayMedia({ video: { cursor: 'never', displaySurface: 'browser' } });
    if (stream != null) {
      const vid = document.createElement('video');
      vid.srcObject = stream;
      await vid.play();
      canvas = document.createElement('canvas');
      canvas.width = vid.videoWidth;
      canvas.height = vid.videoHeight;
      canvas.getContext('2d').drawImage(vid, 0, 0);
      stream.getTracks().forEach(t => t.stop());
    }
    return canvas;
    /*return new Promise((res, rej) => {
    	canvas.toBlob(res);
    });*/
  };

  const captureScreen = async () => {
    let image = '';

    if (canCaptureScreen()) {
      console.log('capturing screen');
      const canvas = await takeScreenshot();
      if (canvas != null) {
        image = canvas.toDataURL();
      }
      /*navigator.mediaDevices.getDisplayMedia()
      .then(mediaStream => {
        // https://stackoverflow.com/questions/6150289/how-to-convert-image-into-base64-string-using-javascript
        const img = new Image();
        img.src = URL.createObjectURL(mediaStream);
      })
      .catch( err => console.log(`${err.name}: ${err.message}`));*/
    } else {
      console.log('capturing canvas');
      const canvas = document.getElementById('major_view');
      if (canvas != null) {
        canvas = canvas.getElementsByTagName('canvas')[0];
        image = canvas.toDataURL();
      } else {
        console.log('canvas not found');
      }
    }

    setImageSource(image);

    return image;
  };

  /* API handlers */
  const apiLink = 'https://api.github.com';
  const repositoryIssues = 'm2ms/fragalysis-frontend';
  const repositoryContent = 'm2ms/fragalysis-assets';

  const getIssuesLink = () => {
    return apiLink + '/repos/' + repositoryIssues + '/issues';
  };
  const getContentLink = () => {
    return apiLink + '/repos/' + repositoryContent + '/contents';
  };
  const getAssetLink = assetName => {
    return getContentLink() + '/' + assetName;
  };

  const getHeaders = () => {
    return {
      Authorization: 'token ' + process.env.GITHUB_API_TOKEN
    };
  };

  const uploadFile = async () => {
    console.log('uploading new file');

    let screenshotUrl = '';
    console.log('image source', imageSource);
    const image = imageSource; // await captureScreen();
    if (image.length > 0) {
      // https://gist.github.com/maxisam/5c6ec10cc4146adce05d62f553c5062f
      const imgBase64 = image.split(',')[1];
      const uid = new Date().getTime() + parseInt(Math.random() * 1e6).toString();
      const fileName = 'screenshot-' + uid + '.png';

      const payload = {
        message: 'auto upload from issue form',
        branch: 'master',
        content: imgBase64
      };

      const result = await axios
        .put(getAssetLink(fileName), JSON.stringify(payload), { headers: getHeaders() })
        .catch(error => {
          console.log(error);
          setResponse('Error occured: ' + error.message);
          // TODO sentry?
        });
      console.log(result);
      screenshotUrl = result.data.content.html_url + '?raw=true';
    }

    return screenshotUrl;
  };

  const createIssue = async () => {
    setResponse('');

    const screenshotUrl = await uploadFile();
    console.log('url', screenshotUrl);

    console.log('creating new issue');
    console.log(name, email, title, description);

    let body = [
      // "- Version: " + browser.appVersion,
      '- Name: ' + name,
      '- Description: ' + description
    ];

    if (screenshotUrl.length > 0) {
      body.push('', '![screenshot](' + screenshotUrl + ')');
    }

    body = body.join('\n');

    // check if same title exists
    /*var createIssue = true;
    var issues = null;
    axios.get(getIssuesLink(), { 'headers': getHeaders() }).then(result => {
      console.log(result);
      var create = true;
      if (result.data.length > 0) {
        result.data.some(item => {
          console.log(item.title);
          if (item.title == title) {
            create = false;
            console.log('found!');
            setResponse(title + ' already exists!');
            return true;
          }
        });
      }

      if (create) {
        // https://developer.github.com/v3/issues/#create-an-issue
        var issue = {
          "title": title,
          "body": body,
          "labels": ["issue"]
        };
        // headers['Content-Type'] = 'application/json';
        axios.post(getIssuesLink(), issue, { 'headers': getHeaders() }).then(result => {
          console.log(result);
          setResponse('Issue created: ' + result.data.html_url);
          handleCloseForm();
        }).catch((error, result) => {
          console.log(error);
          setResponse('Error occured: ' + error.message);
        });
      }
    });*/

    var issue = {
      title: title,
      body: body,
      labels: ['issue']
    };

    axios
      .post(getIssuesLink(), issue, { headers: getHeaders() })
      .then(result => {
        console.log(result);
        setSnackBarTitle(<>
          {'Issue was created: '}<a href={result.data.html_url} target='_blank'>{result.data.html_url}</a>
        </>);
        handleCloseForm();
      })
      .catch(error => {
        console.log(error);
        setResponse('Error occured: ' + error.message);
        // TODO sentry?
      });
  };

  /* Modal handlers */
  const [openForm, setOpenForm] = React.useState(false);
  const [openDialog, setOpenDialog] = React.useState(false);

  const isResponse = () => {
    return openForm && response.length > 0;
  };

  const handleOpenForm = async () => {
    await captureScreen();
    setOpenForm(true);
  };

  const handleCloseForm = () => {
    setOpenForm(false);
    resetForm();
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
    handleOpenForm();
  };

  const getHintText = () => {
    // https://stackoverflow.com/questions/9847580/how-to-detect-safari-chrome-ie-firefox-and-opera-browser
    let text = 'please choose your window or screen to share';
    if (typeof InstallTrigger !== 'undefined') {
      console.log('firefox');
      // firefox
      text += ' and "Allow" it';
    } else if (!!window.chrome) {
      console.log('chrome');
      // chrome
      text += ', ideally "Chrome tab" and your current tab';
    }
    return text;
  };

  return (
    <div>
      <Button startIcon={<ReportProblem />} variant="text" size="small" className={classes.button} onClick={handleOpenDialog}>
        Report issue
      </Button>
      <Modal open={openDialog} onClose={handleCloseDialog}>
        <Grid container direction="column" className={classes.pt}>
          <Grid item>
            <Typography variant="body1">It is helpful to provide a screenshot of your current state, therefore you are going to be prompted by browser to do so.</Typography>
            <Typography variant="body1">After you proceed, {getHintText()}.</Typography>
          </Grid>
          <Grid container justify="flex-end" direction="row">
            <Grid item>
              <Button color="primary" onClick={handleCloseDialog}>
                Proceed
              </Button>
            </Grid>
          </Grid>
        </Grid>
      </Modal>
      <Modal open={openForm} onClose={handleCloseForm}>
        <Formik
          initialValues={{
            name: name,
            email: email,
            title: title,
            description: description
          }}
          validate={values => {
            const errors = {};
            if (!values.title) {
              errors.title = 'Required field.';
            }
            if (!values.description) {
              errors.description = 'Required field.';
            }
            if (values.email &&
              !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(values.email)
            ) {
              errors.email = 'Invalid email address.';
            }
            return errors;
          }}
          onSubmit={async (values, { setSubmitting }) => {
            await createIssue();
            setSubmitting(false);
          }}
        >

          {({ submitForm, isSubmitting }) => (
            <Form>
              <Grid container direction="column" className={classes.body}>
                <Typography variant="h3">Report issue</Typography>
                {isResponse() && <Alert severity="error">{response}</Alert>}

                <Grid container direction="row" spacing={2} className={classes.input}>
                  <Grid item xs={12} sm container>
                    <Grid item xs container direction="column" className={classes.input}>
                      <Grid item xs>
                        <TextField
                          name="name"
                          label="Name"
                          value={name}
                          onInput={e => setName(e.target.value)}
                          disabled={isSubmitting}
                        />
                      </Grid>
                      <Grid item xs>
                        <TextField
                          name="email"
                          label="Email"
                          value={email}
                          onInput={e => setEmail(e.target.value)}
                          disabled={isSubmitting}
                        />
                      </Grid>
                      <Grid item xs>
                        <TextField
                          required
                          name="title"
                          label="Title"
                          value={title}
                          onInput={e => setTitle(e.target.value)}
                          disabled={isSubmitting}
                        />
                      </Grid>
                      <Grid item xs>
                        <TextField
                          required
                          name="description"
                          label="Description"
                          placeholder="Describe your problem in a detail."
                          multiline
                          rows="4"
                          value={description}
                          onInput={e => setDescrition(e.target.value)}
                          disabled={isSubmitting}
                        />
                      </Grid>
                    </Grid>
                  </Grid>

                  <Grid item>
                    <ButtonBase className={classes.image}>
                      <img className={classes.img} alt="complex" src={imageSource} />
                    </ButtonBase>
                  </Grid>
                </Grid>

                <Grid container justify="flex-end" direction="row">
                  <Grid item>
                    <Button disabled={isSubmitting} onClick={handleCloseForm}>Close</Button>
                  </Grid>
                  <Grid item>
                    <Button color="primary" disabled={isSubmitting} onClick={submitForm}>
                      Report issue
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
