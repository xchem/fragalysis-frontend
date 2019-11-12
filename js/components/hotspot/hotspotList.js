/**
 * Created by ricgillams on 04/07/2018.
 */
import { Row, Well } from 'react-bootstrap';
import React, { memo, useState, useEffect, useCallback, useRef } from 'react';
import { connect } from 'react-redux';
import * as apiActions from '../../reducers/api/apiActions';
import * as listType from '../listTypes';
import HotspotView from './hotspotView';
import { getUrl, loadFromServer } from '../../utils/genericList';
import { api, METHOD } from '../../utils/api';

const molStyle = { height: '250px', overflow: 'scroll' };
const HotspotList = memo(({ molecule_list, setObjectList, target_on, mol_group_on }) => {
  const list_type = listType.MOLECULE;
  const oldUrl = useRef('');
  const setOldUrl = url => {
    oldUrl.current = url;
  };
  const [hsCount, setHsCount] = useState();

  const updateCount = useCallback(() => {
    if (molecule_list && molecule_list.length > 0) {
      api({
        url: '/api/hotspots/?map_type=DO&prot_id=' + molecule_list[0].prot_id.toString(),
        method: METHOD.GET,
        headers: {
          accept: 'application/json',
          'content-type': 'application/json'
        }
      })
        .then(response => {
          setHsCount(response.data);
        })
        .catch(error => {
          throw error;
        });
    }
  }, [molecule_list]);

  useEffect(() => {
    updateCount();
  }, [updateCount]);

  useEffect(() => {
    loadFromServer({
      url: getUrl({ list_type, mol_group_on, target_on }),
      setOldUrl: url => setOldUrl(url),
      old_url: oldUrl.current,
      list_type,
      setObjectList
    }).catch(error => {
      throw error;
    });
  }, [list_type, setObjectList, mol_group_on, target_on]);

  if (hsCount > 0) {
    return (
      <Well>
        <Row style={molStyle}>
          {molecule_list.map(data => (
            <HotspotView key={data.id} data={data} />
          ))}
        </Row>
      </Well>
    );
  } else {
    return null;
  }
});
function mapStateToProps(state) {
  return {
    molecule_list: state.apiReducers.present.molecule_list,
    target_on: state.apiReducers.present.target_on,
    mol_group_on: state.apiReducers.present.mol_group_on
  };
}
const mapDispatchToProps = {
  setObjectList: apiActions.setMoleculeList
};

export default connect(mapStateToProps, mapDispatchToProps)(HotspotList);
