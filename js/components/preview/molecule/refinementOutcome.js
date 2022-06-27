/**
 * Created by abradley on 11/10/2018.
 */
import React from 'react';
import status_6 from '../../../img/status_6.svg';
import status_6_gray from '../../../img/status_6_gray.svg';
import status_5 from '../../../img/status_5.svg';
import status_4 from '../../../img/status_4.svg';
import { api } from '../../../utils/api';
import { base_url as base_url_const } from '../../routes/constants';

class RefinementOutcome extends React.PureComponent {
  constructor(props) {
    super(props);
    this.base_url = base_url_const;
    this.getUrl = this.getUrl.bind(this);
    this.state = { refinementOutcome: undefined };
  }

  getUrl() {
    var get_view = '/api/molannotation/?mol_id=' + this.props.data.id.toString();
    return new URL(this.base_url + get_view);
  }

  convertJson(input_json) {
    var results = input_json['results'];
    for (var index in results) {
      var result = results[index];
      if (result['annotation_type'] === 'ligand_confidence') {
        var result_text = result['annotation_text'];
        var int_conf = parseInt(result_text);
      }
    }
    if (int_conf) {
      this.setState({ refinementOutcome: int_conf });
    } else {
      this.setState({ refinementOutcome: undefined });
    }
  }

  componentDidMount() {
    const url = this.getUrl();
    api({ url })
      .then(response => this.convertJson(response.data))
      .catch(error => {
        this.setState(() => {
          throw error;
        });
      });
  }

  render() {
    const { refinementOutcome } = this.state;
    const { className } = this.props;
    let imgSource;
    switch (refinementOutcome) {
      case 4:
        imgSource = status_4;
        break;
      case 5:
        imgSource = status_5;
        break;
      case 6:
        imgSource = status_6;
        break;
      case undefined:
        imgSource = status_6_gray;
        break;
      default:
        break;
    }

    return <div className={className}>{imgSource && <img src={imgSource} style={{ width: 16, height: 16 }} />}</div>;
  }
}

export default RefinementOutcome;
