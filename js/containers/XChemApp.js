/**
 * Created by abradley on 07/03/2018.
 */
import {Row, Col} from 'react-bootstrap';
import { Tindspect } from '../components/overallComponents';

export default class XChemApp extends React.Component {

    render() {
            return <div>
                <Row>
                    <Header/>
                </Row>
                <Row>
                    <Col xs={12} md={12}>
                        <Tindspect/>
                    </Col>
                </Row>
            </div>
    }
}
