/**
 * Created by abradley on 13/03/2018.
 */

import React, { memo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { ListItemText, ListItemSecondaryAction, Grid, IconButton, Tooltip } from '@material-ui/core';
import { List, ListItem, Panel } from '../common';
import { Link } from 'react-router-dom';
import { URLS } from '../routes/constants';
import { isDiscourseAvailable, generateDiscourseTargetURL, openDiscourseLink } from '../../utils/discourse';
import { setOpenDiscourseErrorModal } from '../../reducers/api/actions';
import { Chat } from '@material-ui/icons';
import { getTargetProjectCombinations } from './redux/dispatchActions';
import { setCurrentProject } from './redux/actions';
import { URL_TOKENS } from '../direct/constants';

export const TargetList = memo(() => {
  const dispatch = useDispatch();
  const isTargetLoading = useSelector(state => state.targetReducers.isTargetLoading);
  const target_id_list = useSelector(state => state.apiReducers.target_id_list);
  const projectsList = useSelector(state => state.targetReducers.projects);

  const render_item_method = (target, project) => {
    const preview = `${URLS.target}${target.title}/${URL_TOKENS.target_access_string}/${project.target_access_string}`;
    const sgcUrl = 'https://thesgc.org/sites/default/files/XChem/' + target.title + '/html/index.html';
    const sgcUploaded = ['BRD1A', 'DCLRE1AA', 'FALZA', 'FAM83BA', 'HAO1A', 'NUDT4A', 'NUDT5A', 'NUDT7A', 'PARP14A'];
    const discourseAvailable = isDiscourseAvailable();
    // const [discourseUrl, setDiscourseUrl] = useState();

    return (
      <ListItem key={`${target.id}_${project.id}`}>
        <Grid container direction="row" spacing={2}>
          <Grid item xs={4}>
            <Link
              to={preview}
              onClick={() => {
                // dispatch(setCurrentProject(project));
              }}
            >
              <ListItemText primary={target.title} />
            </Link>
          </Grid>
          <Grid item xs={4}>
            <ListItemText primary={project.target_access_string} />
          </Grid>
          <Grid item xs={4}>
            <Grid container direction="row" justify="center" alignItems="center">
              {sgcUploaded.includes(target.title) && (
                <a href={sgcUrl} target="new">
                  Open SGC summary
                </a>
              )}
              {discourseAvailable && (
                <Tooltip title="Go to Discourse">
                  <IconButton
                    disabled={!isDiscourseAvailable()}
                    onClick={() => {
                      generateDiscourseTargetURL(target.title)
                        .then(response => {
                          const link = response.data['Post url'];
                          openDiscourseLink(link);
                        })
                        .catch(err => {
                          console.log(err);
                          dispatch(setOpenDiscourseErrorModal(true));
                        });
                    }}
                  >
                    <Chat />
                  </IconButton>
                </Tooltip>
              )}
            </Grid>
          </Grid>
        </Grid>
      </ListItem>
    );
  };

  if (target_id_list) {
    return (
      <Panel hasHeader title="Target List" isLoading={isTargetLoading}>
        <List>
          {getTargetProjectCombinations(target_id_list, projectsList).map(data =>
            render_item_method(data.target, data.project)
          )}
        </List>
      </Panel>
    );
  } else {
    return <h1>FILL ME UP PLEASE</h1>;
  }
});
