import { api, METHOD } from '../../utils/api';
import { setResponse } from './redux/actions';
import { version } from '../../../package.json';
import { Base64 } from 'js-base64';

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
    Authorization: 'token ' + Base64.decode(process.env.GITHUB_API_TOKEN)
  };
};

/**
 * Upload an image from form state
 */
const uploadFile = (formState, formType) => async dispatch => {
  console.log('uploading new file');

  let screenshotUrl = '';
  if (formState.imageSource.length > 0) {
    // https://gist.github.com/maxisam/5c6ec10cc4146adce05d62f553c5062f
    const imgBase64 = formState.imageSource.split(',')[1];
    const uid = new Date().getTime() + parseInt(Math.random() * 1e6).toString();
    const fileName = 'screenshot-' + uid + '.png';

    const payload = {
      message: 'auto upload from ' + formType + ' form',
      branch: 'master',
      content: imgBase64
    };

    const result = await api({
      method: METHOD.PUT,
      url: getAssetLink(fileName),
      headers: getHeaders(),
      data: JSON.stringify(payload)
    }).catch(error => {
      console.log(error);
      dispatch(setResponse('Error occured: ' + error.message));
      // TODO sentry?
    });
    console.log(result);
    screenshotUrl = result.data.content.html_url + '?raw=true';
  }

  return screenshotUrl;
};

/**
 * Create issue in GitHub (thunk actions are used to stored in dispatchActions.js)
 */
export const createIssue = (formState, formType, labels, afterCreateIssueCallback) => async dispatch => {
  dispatch(setResponse(''));

  const screenshotUrl = await dispatch(uploadFile(formState, formType));
  let body = ['- Version: ' + version, '- Name: ' + formState.name, '- Description: ' + formState.description];

  if (screenshotUrl.length > 0) {
    body.push('', '![screenshot](' + screenshotUrl + ')');
  }
  body = body.join('\n');

  // https://developer.github.com/v3/issues/#create-an-issue
  var issue = {
    title: formState.title,
    body: body,
    labels: labels
  };

  api({
    method: METHOD.POST,
    url: getIssuesLink(),
    headers: getHeaders(),
    data: JSON.stringify(issue)
  })
    .then(result => {
      console.log(result);
      afterCreateIssueCallback(result.data.html_url);
    })
    .catch(error => {
      console.log(error);
      dispatch(setResponse('Error occured: ' + error.message));
      // TODO sentry?
    });
};
