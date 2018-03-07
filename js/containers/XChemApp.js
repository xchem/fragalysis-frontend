/**
 * Created by abradley on 07/03/2018.
 */
import {Row, Col} from 'react-bootstrap';
import { TargetList, MolGroupList, MoleculeList } from '../components/apiComponents';
import { NGLView } from '../components/nglComponents';

export default class XChemApp extends React.Component {

    render() {
        
        return <Row>
                <Col xs={1} >
                    <TargetList />
                </Col>
                <Col xs={1}>
                    <MolGroupList />
                </Col>
                <Col xs={4}>
                    <MoleculeList />
                </Col>
                <Col xs={6} md={6} >
                    <NGLView />
                </Col>
            </Row>
    }
}


