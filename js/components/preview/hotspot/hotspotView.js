/**
 * Created by ricgillams on 05/07/2018.
 */

import { Grid } from '@material-ui/core';
import { Paper } from '../../common/Surfaces/Paper';
import React from 'react';
import { connect } from 'react-redux';
import { deleteObject, loadObject } from '../../../reducers/ngl/dispatchActions';
import { Switch } from '@material-ui/core';
import { OBJECT_TYPE } from '../../nglView/constants';
import { VIEWS } from '../../../constants/constants';
import { api, METHOD } from '../../../utils/api';
import { base_url as base_url_const } from '../../routes/constants';

class HotspotView extends React.PureComponent {
  constructor(props) {
    super(props);
    this.onHotspot = this.onHotspot.bind(this);
    this.colorToggle = this.colorToggle.bind(this);
    this.handleHotspot = this.handleHotspot.bind(this);
    this.fetchHotspotUrl = this.fetchHotspotUrl.bind(this);
    this.buttonRender = this.buttonRender.bind(this);
    var base_url = base_url_const;
    this.img_url = new URL(base_url + '/viewer/img_from_smiles/');
    var get_params = {
      img_type: 'png',
      smiles: props.data.smiles
    };
    Object.keys(get_params).forEach(key => this.img_url.searchParams.append(key, get_params[key]));
    this.key = 'mol_image';
    this.state = {
      hsDict: {
        donor: {
          Tepid: false,
          Warm: false,
          Hot: false
        },
        acceptor: {
          Tepid: false,
          Warm: false,
          Hot: false
        },
        apolar: {
          Tepid: false,
          Warm: false,
          Hot: false
        }
      },
      hsParams: {
        Tepid: { opacity: 0.2, contour: 10 },
        Warm: { opacity: 0.4, contour: 14 },
        Hot: { opacity: 0.6, contour: 17 },
        donor: { abbreviation: 'DO', buttonStyle: 'primary' },
        acceptor: { abbreviation: 'AC', buttonStyle: 'danger' },
        apolar: { abbreviation: 'AP', buttonStyle: 'warning' }
      }
    };
  }

  handleHotspot(hotspotObject, loadState) {
    if (loadState === 'load') {
      this.props.loadObject({ target: hotspotObject });
    } else if (loadState === 'unload') {
      this.props.deleteObject(hotspotObject);
    }
  }

  colorToggle() {
    var colorList = [
      '#EFCDB8',
      '#CC6666',
      '#FF6E4A',
      '#78DBE2',
      '#1F75FE',
      '#FAE7B5',
      '#FDBCB4',
      '#C5E384',
      '#95918C',
      '#F75394',
      '#80DAEB',
      '#ADADD6'
    ];
    return {
      backgroundColor: colorList[this.props.data.id % colorList.length]
    };
  }

  fetchHotspotUrl(mapType, protId, loadState, isoLevel, opacity) {
    var hotspotQuery = '?map_type=' + mapType + '&prot_id=' + protId.toString();
    api({
      url: '/api/hotspots/' + hotspotQuery,
      method: METHOD.GET,
      headers: {
        accept: 'application/json',
        'content-type': 'application/json'
      }
    })
      .then(response => {
        return {
          name: 'HOTSPOT_' + response.data.results[0].prot_id.toString() + mapType + isoLevel,
          hotUrl: response.data.results[0].map_info.replace('http:', window.location.protocol),
          display_div: VIEWS.MAJOR_VIEW,
          OBJECT_TYPE: OBJECT_TYPE.HOTSPOT,
          map_type: response.data.results[0].map_type.toString(),
          fragment: response.data.results[0].prot_id.toString(),
          isoLevel: isoLevel,
          opacity: opacity,
          disablePicking: true
        };
      })
      .then(hotspotObject => this.handleHotspot(hotspotObject, loadState))
      .catch(error => {
        throw error;
      });
  }

  onHotspot(strength, type) {
    const newState = !this.state.hsDict[type][strength];
    const replacementObject = { [type]: { [strength]: newState } };
    const newDict = JSON.parse(JSON.stringify(Object.assign({}, this.state.hsDict, replacementObject)));
    this.setState({ hsDict: newDict });
    const load_var = this.state.hsDict[type][strength] ? 'unload' : 'load';
    this.fetchHotspotUrl(
      this.state.hsParams[type].abbreviation,
      this.props.data.prot_id,
      load_var,
      this.state.hsParams[strength].contour,
      this.state.hsParams[strength].opacity
    );
  }

  buttonRender(strength, type) {
    var _this = this;
    return <Switch onChange={() => _this.onHotspot(strength, type)} />;
  }

  render() {
    return (
      <Grid container>
        <Grid item xs={3} md={3}>
          <Paper style={this.colorToggle()}>
            <img src={this.img_url + '&dummy=png'} />
          </Paper>
        </Grid>
        <Grid container item xs={3} md={3}>
          <Grid item> {this.buttonRender('Tepid', 'donor')} </Grid>
          <Grid item> {this.buttonRender('Tepid', 'acceptor')} </Grid>
          <Grid item> {this.buttonRender('Tepid', 'apolar')} </Grid>
        </Grid>
        <Grid container item xs={3} md={3}>
          <Grid item> {this.buttonRender('Warm', 'donor')} </Grid>
          <Grid item> {this.buttonRender('Warm', 'acceptor')} </Grid>
          <Grid item> {this.buttonRender('Warm', 'apolar')} </Grid>
        </Grid>
        <Grid container item xs={3} md={3}>
          <Grid item> {this.buttonRender('Hot', 'donor')} </Grid>
          <Grid item> {this.buttonRender('Hot', 'acceptor')} </Grid>
          <Grid item> {this.buttonRender('Hot', 'apolar')} </Grid>
        </Grid>
      </Grid>
    );
  }
}

function mapStateToProps(state) {
  return {};
}

const mapDispatchToProps = {
  deleteObject,
  loadObject
};

export default connect(mapStateToProps, mapDispatchToProps)(HotspotView);
