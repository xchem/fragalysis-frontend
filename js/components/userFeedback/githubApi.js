import { api, METHOD } from '../../utils/api';
import { setResponse } from './redux/actions';
import { version } from '../../../package.json';
import { Base64 } from 'js-base64';
import { EXTENSION } from './redux/constants';

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
const uploadFile = ({ data64Based, formType, name, extension, raw = false }) => async dispatch => {
  let fileUrl = '';
  if (data64Based.length > 0) {
    // https://gist.github.com/maxisam/5c6ec10cc4146adce05d62f553c5062f
    const uid = new Date().getTime() + parseInt(Math.random() * 1e6).toString();
    const fileName = `${name}-${uid}${extension}`;

    const payload = {
      message: 'auto upload from ' + formType + ' form',
      branch: 'master',
      content: data64Based
    };

    const result = await api({
      method: METHOD.PUT,
      url: getAssetLink(fileName),
      headers: getHeaders(),
      data: JSON.stringify(payload)
    }).catch(error => {
      console.error(error);
      dispatch(setResponse('Error occured: ' + error.message));
      // TODO sentry?
    });
    fileUrl = `${result.data.content.html_url}?raw=${raw}`;
  }

  return fileUrl;
};

/**
 * Create issue in GitHub (thunk actions are used to stored in dispatchActions.js)
 */
export const createIssue = ({
  imageSource,
  formType,
  labels,
  afterCreateIssueCallback,
  name,
  email,
  title,
  description
}) => async (dispatch, getState) => {
  dispatch(setResponse(''));
  const rootReducer = getState();

  let screenshotUrl = undefined;
  if (imageSource && imageSource !== '') {
    //  const state => state.issueReducers;
    screenshotUrl = await dispatch(
      uploadFile({
        data64Based: imageSource.split(',')[1],
        formType,
        name: 'Screenshot',
        extension: EXTENSION.PNG,
        raw: true
      })
    );
  }

  const reducerUrl = await dispatch(
    uploadFile({
      data64Based: Base64.encode(JSON.stringify(rootReducer)),
      formType,
      name: 'Reducers',
      extension: EXTENSION.JSON
    })
  );
  let body = ['- Version: ' + version, '- Name: ' + name, '- Email: ' + email, '- Description: ' + description];
  if (reducerUrl.length > 0) {
    body.push('- Reducers: ' + reducerUrl);
  }

  if (screenshotUrl && screenshotUrl.length > 0) {
    body.push('', '![screenshot](' + screenshotUrl + ')');
  }

  body = body.join('\n');

  // https://developer.github.com/v3/issues/#create-an-issue
  var issue = {
    title: title,
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
      afterCreateIssueCallback(result.data.html_url);
    })
    .catch(error => {
      console.error(error);
      dispatch(setResponse('Error occured: ' + error.message));
      // TODO sentry?
    });
};
