import React, { memo, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { makeStyles } from '@material-ui/core';
import { useDispatch, useSelector } from 'react-redux';

import { ToastContext } from '../../toast';

import Plotly from 'plotly.js-dist-min';
import { api } from '../../../utils/api';
import { base_url } from '../../routes/constants';
import { Button, Grid } from '@mui/material';
import { PlotlyItem } from './plotlyItem';
import { Panel } from '../../common';
import { setPanelsExpanded } from '../../../reducers/layout/actions';
import { layoutItemNames } from '../../../reducers/layout/constants';
import RichTooltip from '../../tooltip/RichTooltip';

const useStyles = makeStyles(theme => ({
    viewWrapper: {
        height: '100%',
        width: '100%',
        overflow: 'auto'
    },
    plotlyDiv: {
        // height: '100%',
        // width: '100%'
    },
    backButton: {
        fontSize: '0.65rem !important',
        lineHeight: '1 !important'
    }
}));

export const PlotlyView = memo(({ expandHandler, onResize }) => {
    const classes = useStyles();
    const dispatch = useDispatch();

    const divRef = useRef();
    const { toastInfo } = useContext(ToastContext);
    const lhsOpen = useSelector(state => state.previewReducers.viewerControls.sidesOpen.LHS);
    // const rhsMoleculesDatasets = useSelector(state => state.datasetsReducers.moleculeLists);
    const targetId = useSelector(state => state.apiReducers.target_on);

    const [selectedDataset, setSelectedDataset] = useState(null);
    const [plotlyDatasets, setPlotlyDatasets] = useState([]);

    const componentId = useRef(`plotly-view-${Math.random().toString(36).substr(2, 9)}`);
    const plotlyGraph = useRef(null);

    useEffect(() => {
        // if (divRef.current && plotlyDatasets.length === 1) {
        if (plotlyDatasets.length === 0) {
            initPlotly();
        }
    }, [initPlotly, plotlyDatasets.length]);

    // const getMolecule = useCallback(id => {
    //     let molecule = undefined;
    //     for (const [datasetName, molecules] of Object.entries(rhsMoleculesDatasets)) {
    //         const foundMolecule = molecules.find(molecule => molecule.text_scores['original ID'] === id);
    //         if (foundMolecule) {
    //             molecule = foundMolecule;
    //             break;
    //         }
    //     }
    //     console.log('molecule', id, molecule);
    //     return molecule;
    // }, [rhsMoleculesDatasets]);

    const getMoleculeElement = useCallback((selector, dataset) => {
        const dataSelector = dataset?.identifier === 'compound_code' ? 'compound-code' : 'observation-code';
        // console.log('lhs to select:', dataSelector, selector);
        const elements = document.querySelectorAll(`[data-lhs-${dataSelector}='${selector}']`);
        return elements.length > 0 ? elements[0] : undefined;
    }, []);

    const getData = useCallback(async () => {
        return api({ url: `${base_url}/api/plot_data/?target=${targetId}` }).then(response => {
            return response.data?.results;
        });
    }, [targetId]);

    /**
     * TODO lhsOpen is not registered on change...
     */
    const highlightLHSElement = useCallback((selectors, dataset) => {
        if (lhsOpen) {
            selectors.forEach(selector => {
                const element = getMoleculeElement(selector, dataset);
                if (element) {
                    element.scrollIntoView();
                    element.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 1000, iterations: 3 })
                    toastInfo(`'${selectors.join(', ')}' ${(selectors.length > 1 ? 'were' : 'was')} focused on LHS`, { autoHideDuration: 5000 });
                } else {
                    toastInfo(`Selected compound was not found in visible viewport`, { autoHideDuration: 5000 });
                }
            });
        } else {
            toastInfo(`Open LHS to focus selected compound`, { autoHideDuration: 5000 });
        }
    }, [toastInfo, lhsOpen, getMoleculeElement]);

    const initPlotly = useCallback(async () => {
        window.PLOTLYENV = window.PLOTLYENV || {};
        // Plotly.newPlot('plot-ly', [{ "customdata": [["A4290a"], ["CIPSLIIOJPGGQL-DGCLKSJQSA-N"], ["CIPSLIIOJPGGQL-WCQYABFASA-N"], ["CIPSLIIOJPGGQL-DGCLKSJQSA-N"], ["OWXSCDCPVZGTHY-NTZNESFSSA-N"], ["OWXSCDCPVZGTHY-NTZNESFSSA-N"], ["OWXSCDCPVZGTHY-DMDPSCGWSA-N"], ["FSXIUBBLTJPOEQ-QKVFXAPYSA-N"], ["FSXIUBBLTJPOEQ-GTJPDFRWSA-N"], ["FSXIUBBLTJPOEQ-LAJNKCICSA-N"], ["YQNRLOFSQIVVPG-VHSXEESVSA-N"], ["YQNRLOFSQIVVPG-VHSXEESVSA-N"], ["SRQVRMUCHBMAPS-JTQLQIEISA-N"], ["SRQVRMUCHBMAPS-SNVBAGLBSA-N"], ["ABGYSGOHXUTZSE-SMDDFHAHSA-N"], ["ABGYSGOHXUTZSE-DCVWQXJKSA-N"], ["ABGYSGOHXUTZSE-QLMNROTDSA-N"], ["CJGWUQPZRLLSPL-JTQLQIEISA-N"], ["CJGWUQPZRLLSPL-SNVBAGLBSA-N"], ["JYKYJMCCOZVCCX-CYBMUJFWSA-N"], ["ROIJZOVRQUHLNA-OLZOCXBDSA-N"], ["ROIJZOVRQUHLNA-QWHCGFSZSA-N"], ["FVZMXFCKEYPRMB-NTZNESFSSA-N"], ["FVZMXFCKEYPRMB-NTZNESFSSA-N"], ["FVZMXFCKEYPRMB-DMDPSCGWSA-N"], ["FVZMXFCKEYPRMB-MDZLAQPJSA-N"], ["BZCLBVGVMUPYRD-YNEHKIRRSA-N"], ["GETTUYBPGFPSRH-CYZMBNFOSA-N"], ["GETTUYBPGFPSRH-UHTWSYAYSA-N"], ["GETTUYBPGFPSRH-UHTWSYAYSA-N"], ["SSKNNSPYZGBIMN-NTZNESFSSA-N"], ["SSKNNSPYZGBIMN-GMXVVIOVSA-N"], ["SSKNNSPYZGBIMN-NQBHXWOUSA-N"], ["SSKNNSPYZGBIMN-DMDPSCGWSA-N"], ["SSKNNSPYZGBIMN-MDZLAQPJSA-N"], ["SSKNNSPYZGBIMN-GVXVVHGQSA-N"], ["SSKNNSPYZGBIMN-WZRBSPASSA-N"], ["SSKNNSPYZGBIMN-LOWVWBTDSA-N"], ["DPTOBIYTNLZBMB-NTZNESFSSA-N"], ["DPTOBIYTNLZBMB-GMXVVIOVSA-N"], ["DPTOBIYTNLZBMB-NQBHXWOUSA-N"], ["DPTOBIYTNLZBMB-GMXVVIOVSA-N"], ["DPTOBIYTNLZBMB-MDZLAQPJSA-N"], ["DPTOBIYTNLZBMB-GVXVVHGQSA-N"], ["DPTOBIYTNLZBMB-WZRBSPASSA-N"], ["DPTOBIYTNLZBMB-LOWVWBTDSA-N"], ["KMYHYEWKIDCDGG-ABAIWWIYSA-N"], ["KMYHYEWKIDCDGG-IAQYHMDHSA-N"], ["KMYHYEWKIDCDGG-NHYWBVRUSA-N"], ["VDKTYYWXMPDQNX-YPMHNXCESA-N"], ["VDKTYYWXMPDQNX-WCQYABFASA-N"], ["DTHIPRCIVYUWKC-ABAIWWIYSA-N"], ["DTHIPRCIVYUWKC-IAQYHMDHSA-N"], ["DTHIPRCIVYUWKC-NHYWBVRUSA-N"], ["DTHIPRCIVYUWKC-XHDPSFHLSA-N"], ["SPWOTSWQWSKTTN-ABAIWWIYSA-N"], ["SPWOTSWQWSKTTN-IAQYHMDHSA-N"], ["SPWOTSWQWSKTTN-NHYWBVRUSA-N"], ["SPWOTSWQWSKTTN-XHDPSFHLSA-N"], ["IQRUJMCPLXCOCF-NSHDSACASA-N"], ["IQRUJMCPLXCOCF-LLVKDONJSA-N"], ["NNJBQLOPMCYGNX-MNOVXSKESA-N"], ["NNJBQLOPMCYGNX-WDEREUQCSA-N"], ["ZPPSFBXZVAZURQ-ABAIWWIYSA-N"], ["ZPPSFBXZVAZURQ-NHYWBVRUSA-N"], ["ZPPSFBXZVAZURQ-IAQYHMDHSA-N"], ["DIHBGMGXKWDIPC-QWHCGFSZSA-N"], ["VVIDWLPPPADVQU-WCQYABFASA-N"], ["VVIDWLPPPADVQU-AAEUAGOBSA-N"], ["VVIDWLPPPADVQU-DGCLKSJQSA-N"], ["VVIDWLPPPADVQU-YPMHNXCESA-N"], ["VWQRAZBSLICPHQ-OAHLLOKOSA-N"], ["VWQRAZBSLICPHQ-HNNXBMFYSA-N"], ["MATXBLKTWRNYBE-OAHLLOKOSA-N"], ["MATXBLKTWRNYBE-HNNXBMFYSA-N"], ["KCUWPJSIVYQWJM-YPMHNXCESA-N"], ["KCUWPJSIVYQWJM-WCQYABFASA-N"], ["KCUWPJSIVYQWJM-WCQYABFASA-N"], ["HOIGWFJTYNXUKQ-OAHLLOKOSA-N"], ["HOIGWFJTYNXUKQ-HNNXBMFYSA-N"], ["ZXKMFCGACBAZDX-HNNXBMFYSA-N"], ["BHXXNDRDFMGLNO-TZMCWYRMSA-N"], ["BHXXNDRDFMGLNO-GXTWGEPZSA-N"], ["BHXXNDRDFMGLNO-TZMCWYRMSA-N"], ["BHXXNDRDFMGLNO-GXTWGEPZSA-N"], ["JXKWTIAEYKUFKO-WBMJQRKESA-N"], ["JXKWTIAEYKUFKO-MLGOLLRUSA-N"], ["JXKWTIAEYKUFKO-WBMJQRKESA-N"], ["JXKWTIAEYKUFKO-MLGOLLRUSA-N"], ["FMDNAOXFOKFOHX-WBMJQRKESA-N"], ["FMDNAOXFOKFOHX-MLGOLLRUSA-N"], ["FMDNAOXFOKFOHX-WBMJQRKESA-N"], ["FMDNAOXFOKFOHX-MLGOLLRUSA-N"], ["BGYFBBKSPJEOFR-MLGOLLRUSA-N"], ["BGYFBBKSPJEOFR-MLGOLLRUSA-N"], ["BGYFBBKSPJEOFR-WBMJQRKESA-N"], ["BGYFBBKSPJEOFR-MLGOLLRUSA-N"], ["XOEQMYWHIQUCEZ-MBNYWOFBSA-N"], ["XOEQMYWHIQUCEZ-MBNYWOFBSA-N"], ["XOEQMYWHIQUCEZ-OUCADQQQSA-N"], ["CFFYEHHIEOEUPL-HZSPNIEDSA-N"], ["AWQKJROYGCNUQN-SGMGOOAPSA-N"], ["AWQKJROYGCNUQN-SGMGOOAPSA-N"], ["AWQKJROYGCNUQN-YRGRVCCFSA-N"], ["AWQKJROYGCNUQN-OUCADQQQSA-N"], ["AWQKJROYGCNUQN-MBNYWOFBSA-N"], ["AWQKJROYGCNUQN-SGMGOOAPSA-N"], ["AWQKJROYGCNUQN-YRGRVCCFSA-N"], ["AWQKJROYGCNUQN-OUCADQQQSA-N"], ["CAIXFUNHKQPGKQ-WBMJQRKESA-N"], ["CAIXFUNHKQPGKQ-MLGOLLRUSA-N"], ["CAIXFUNHKQPGKQ-WBMJQRKESA-N"], ["CAIXFUNHKQPGKQ-MLGOLLRUSA-N"], ["BGJAEFQQGGWPKQ-IACUBPJLSA-N"], ["BGJAEFQQGGWPKQ-IACUBPJLSA-N"], ["BGJAEFQQGGWPKQ-IACUBPJLSA-N"], ["BGJAEFQQGGWPKQ-IACUBPJLSA-N"], ["ZTGZMPJKZODOKZ-MBNYWOFBSA-N"], ["ZTGZMPJKZODOKZ-SGMGOOAPSA-N"], ["ZTGZMPJKZODOKZ-YRGRVCCFSA-N"], ["ZTGZMPJKZODOKZ-SGMGOOAPSA-N"], ["ZTGZMPJKZODOKZ-YRGRVCCFSA-N"], ["ZTGZMPJKZODOKZ-OUCADQQQSA-N"], ["PSAGHVQLKXCCTK-LBPRGKRZSA-N"], ["PSAGHVQLKXCCTK-GFCCVEGCSA-N"], ["WTYHUVHWKOLYLP-NEPJUHHUSA-N"], ["WTYHUVHWKOLYLP-NWDGAFQWSA-N"], ["SRQVRMUCHBMAPS-JTQLQIEISA-N"], ["SRQVRMUCHBMAPS-SNVBAGLBSA-N"], ["YQNRLOFSQIVVPG-VHSXEESVSA-N"], ["YQNRLOFSQIVVPG-VHSXEESVSA-N"], ["IQRUJMCPLXCOCF-LLVKDONJSA-N"], ["NNJBQLOPMCYGNX-MNOVXSKESA-N"], ["NNJBQLOPMCYGNX-WDEREUQCSA-N"], ["JYKYJMCCOZVCCX-ZDUSSCGKSA-N"], ["JYKYJMCCOZVCCX-CYBMUJFWSA-N"], ["ROIJZOVRQUHLNA-OLZOCXBDSA-N"], ["ROIJZOVRQUHLNA-QWHCGFSZSA-N"], ["FSXIUBBLTJPOEQ-LAJNKCICSA-N"], ["FSXIUBBLTJPOEQ-LAJNKCICSA-N"], ["FSXIUBBLTJPOEQ-GTJPDFRWSA-N"], ["FSXIUBBLTJPOEQ-XUSGNXJCSA-N"], ["ABGYSGOHXUTZSE-SMDDFHAHSA-N"], ["ABGYSGOHXUTZSE-QLMNROTDSA-N"], ["KMYHYEWKIDCDGG-ABAIWWIYSA-N"], ["KMYHYEWKIDCDGG-IAQYHMDHSA-N"], ["KMYHYEWKIDCDGG-XHDPSFHLSA-N"], ["FVZMXFCKEYPRMB-NTZNESFSSA-N"], ["FVZMXFCKEYPRMB-NTZNESFSSA-N"], ["FVZMXFCKEYPRMB-NTZNESFSSA-N"], ["GETTUYBPGFPSRH-CYZMBNFOSA-N"], ["GETTUYBPGFPSRH-CYZMBNFOSA-N"], ["GETTUYBPGFPSRH-UHTWSYAYSA-N"], ["GETTUYBPGFPSRH-UHTWSYAYSA-N"], ["OWXSCDCPVZGTHY-NTZNESFSSA-N"], ["OWXSCDCPVZGTHY-DMDPSCGWSA-N"], ["OWXSCDCPVZGTHY-NTZNESFSSA-N"], ["OWXSCDCPVZGTHY-DMDPSCGWSA-N"], ["HOIGWFJTYNXUKQ-OAHLLOKOSA-N"], ["ZPPSFBXZVAZURQ-ABAIWWIYSA-N"], ["ZPPSFBXZVAZURQ-IAQYHMDHSA-N"], ["ZPPSFBXZVAZURQ-NHYWBVRUSA-N"], ["ZPPSFBXZVAZURQ-XHDPSFHLSA-N"], ["SPWOTSWQWSKTTN-NHYWBVRUSA-N"], ["SPWOTSWQWSKTTN-IAQYHMDHSA-N"], ["SPWOTSWQWSKTTN-NHYWBVRUSA-N"], ["SPWOTSWQWSKTTN-XHDPSFHLSA-N"], ["ZXKMFCGACBAZDX-OAHLLOKOSA-N"], ["ZXKMFCGACBAZDX-HNNXBMFYSA-N"], ["CIPSLIIOJPGGQL-WCQYABFASA-N"], ["CIPSLIIOJPGGQL-WCQYABFASA-N"], ["DPTOBIYTNLZBMB-NTZNESFSSA-N"], ["DPTOBIYTNLZBMB-GMXVVIOVSA-N"], ["DPTOBIYTNLZBMB-NQBHXWOUSA-N"], ["DPTOBIYTNLZBMB-DMDPSCGWSA-N"], ["DPTOBIYTNLZBMB-MDZLAQPJSA-N"], ["DPTOBIYTNLZBMB-GVXVVHGQSA-N"], ["DPTOBIYTNLZBMB-WZRBSPASSA-N"], ["DPTOBIYTNLZBMB-LOWVWBTDSA-N"], ["SSKNNSPYZGBIMN-GMXVVIOVSA-N"], ["SSKNNSPYZGBIMN-NQBHXWOUSA-N"], ["SSKNNSPYZGBIMN-DMDPSCGWSA-N"], ["SSKNNSPYZGBIMN-MDZLAQPJSA-N"], ["SSKNNSPYZGBIMN-GMXVVIOVSA-N"], ["SSKNNSPYZGBIMN-WZRBSPASSA-N"], ["SSKNNSPYZGBIMN-DMDPSCGWSA-N"], ["VDKTYYWXMPDQNX-DGCLKSJQSA-N"], ["VDKTYYWXMPDQNX-WCQYABFASA-N"], ["DTHIPRCIVYUWKC-ABAIWWIYSA-N"], ["DTHIPRCIVYUWKC-IAQYHMDHSA-N"], ["DTHIPRCIVYUWKC-ABAIWWIYSA-N"], ["DTHIPRCIVYUWKC-XHDPSFHLSA-N"], ["DIHBGMGXKWDIPC-QWHCGFSZSA-N"], ["DIHBGMGXKWDIPC-STQMWFEESA-N"], ["CJGWUQPZRLLSPL-JTQLQIEISA-N"], ["CJGWUQPZRLLSPL-SNVBAGLBSA-N"], ["MATXBLKTWRNYBE-OAHLLOKOSA-N"], ["MATXBLKTWRNYBE-HNNXBMFYSA-N"], ["CMSBLBNUDOKASG-CYBMUJFWSA-N"], ["CMSBLBNUDOKASG-ZDUSSCGKSA-N"], ["VVIDWLPPPADVQU-WCQYABFASA-N"], ["VVIDWLPPPADVQU-AAEUAGOBSA-N"], ["VVIDWLPPPADVQU-DGCLKSJQSA-N"], ["VVIDWLPPPADVQU-YPMHNXCESA-N"], ["VWQRAZBSLICPHQ-OAHLLOKOSA-N"], ["VWQRAZBSLICPHQ-HNNXBMFYSA-N"], ["KCUWPJSIVYQWJM-YPMHNXCESA-N"], ["KCUWPJSIVYQWJM-AAEUAGOBSA-N"], ["KCUWPJSIVYQWJM-YPMHNXCESA-N"], ["KCUWPJSIVYQWJM-AAEUAGOBSA-N"], ["NQQVRAIZECZCHX-OLZOCXBDSA-N"], ["PSAGHVQLKXCCTK-LBPRGKRZSA-N"], ["PSAGHVQLKXCCTK-LBPRGKRZSA-N"], ["WTYHUVHWKOLYLP-NEPJUHHUSA-N"], ["WTYHUVHWKOLYLP-NWDGAFQWSA-N"], ["JXKWTIAEYKUFKO-WBMJQRKESA-N"], ["JXKWTIAEYKUFKO-MLGOLLRUSA-N"], ["JXKWTIAEYKUFKO-WBMJQRKESA-N"], ["JXKWTIAEYKUFKO-MLGOLLRUSA-N"], ["BHXXNDRDFMGLNO-GXTWGEPZSA-N"], ["BHXXNDRDFMGLNO-TZMCWYRMSA-N"], ["BHXXNDRDFMGLNO-GXTWGEPZSA-N"], ["ZTGZMPJKZODOKZ-MBNYWOFBSA-N"], ["ZTGZMPJKZODOKZ-SGMGOOAPSA-N"], ["ZTGZMPJKZODOKZ-YRGRVCCFSA-N"], ["ZTGZMPJKZODOKZ-MBNYWOFBSA-N"], ["ZTGZMPJKZODOKZ-OBJOEFQTSA-N"], ["ZTGZMPJKZODOKZ-YRGRVCCFSA-N"], ["ZTGZMPJKZODOKZ-SCRDCRAPSA-N"], ["AWQKJROYGCNUQN-MBNYWOFBSA-N"], ["AWQKJROYGCNUQN-SGMGOOAPSA-N"], ["AWQKJROYGCNUQN-MBNYWOFBSA-N"], ["AWQKJROYGCNUQN-OUCADQQQSA-N"], ["AWQKJROYGCNUQN-MBNYWOFBSA-N"], ["AWQKJROYGCNUQN-SGMGOOAPSA-N"], ["AWQKJROYGCNUQN-YRGRVCCFSA-N"], ["AWQKJROYGCNUQN-OUCADQQQSA-N"]], "hovertemplate": "distance_score=%{x}\u003cbr\u003eenergy_score=%{y}\u003cbr\u003ename=%{customdata[0]}\u003cextra\u003e\u003c\u002fextra\u003e", "legendgroup": "", "marker": { "color": "#636efa", "symbol": "circle" }, "mode": "markers", "name": "", "orientation": "v", "showlegend": false, "x": [null, 1.071216801394393, 1.3008199275397387, 1.074045882221497, 1.499901549020984, 1.5069069576904544, 1.5296989503367784, 0.742827086758538, 0.7017650273479701, 0.6470237448538345, 1.0947641330100515, 1.3710824187760455, 0.6129831080540072, 0.6264045970486548, 1.2531739834917532, 1.271411913557177, 1.214748039112578, 0.6221643454899825, 0.6307033788818582, 1.0908612855456699, 1.8668030014298274, 1.317126754309536, 1.6791924812851928, 1.4916289749847247, 1.7585064910273387, 2.1952285058735765, 1.5823595682654554, 1.0817291423402289, 1.1693285490073704, 1.4476085186099332, 1.5307839922829711, 1.167709186938211, 2.003798910446164, 1.0055939919420773, 1.8570100630257824, 1.6769817834584626, 1.4849721896613566, 1.4675791343670872, 1.148318665952644, 1.359335445270447, 1.0922154496853675, 1.930360809339324, 1.618660943222737, 1.7123455460481152, 1.995161938436353, 1.2282460103706576, 1.0256730980108268, 1.1429666954764632, 1.6585238386713548, 2.0255286938685857, 1.9328097631000267, 1.03317422567712, 1.1366080845482316, 1.5007869776016807, 1.9055442566313734, 2.8290964099006923, 1.932216000797786, 2.123056866714624, 2.3344736765351985, 1.970920076149331, 1.9665146713088149, 1.911999505773655, 1.8039255444321738, 1.4346792530125325, 1.546134841306549, 2.9286761301357647, 0.8259011722719276, 0.59735331363312, 0.58054072096888, 0.7185203543381261, 0.9557322626005814, 0.989906243025586, 0.6547198807264489, 0.8914315358080821, 0.6233027070633911, 1.2602545061335733, 2.0979431461783684, 0.6109968485176606, 2.3776674670062046, 2.214088589681595, 3.7513686539567646, 1.5394492617014197, 1.7758679349257784, 1.4820430679207839, 2.0085850641530283, 1.1006522028802923, 1.271058465597009, 1.0773378571477399, 1.2853788944673816, 1.2694917975199558, 1.2884483459854172, 1.0627663855701186, 1.292642577890017, 1.3576501885818895, 1.6608775248862049, 1.5829662833177303, 1.9293355796622753, 1.4675034571407564, 1.2891449641925097, 1.735778096096238, 1.5324949673199229, 1.2332183606028222, 1.1222237657595167, 1.0826254670828546, 1.539145202564873, 1.2853093153764605, 1.1169000989261724, 1.0846458090413453, 1.0498034125783295, 1.8666134174564741, 1.2605611190390824, 2.148359561412704, 1.2483760904674397, 1.3931455077389112, 1.1749771539897564, 1.1679239224634939, 1.4311331088821346, 1.7702258821152992, 1.2729843973605854, 1.2659140838172926, 1.3391853076990972, 2.487493904875884, 1.0933279841307912, 1.1624960434297007, 0.9162691748468391, 1.5434676408337082, 1.9735499039337012, 0.8675111253857353, 0.6217428170853769, 1.0929018644185493, 1.0975730791932978, 1.433872852163108, 2.0613155768139633, 2.1302493918245484, 0.9430488061737927, 0.9031789746446144, 1.5300919527692762, 1.3702308719505496, 1.645799638249347, 0.6535300491073738, 0.8098842999089694, 1.855222686620828, 1.2531739834917532, 1.115289260846757, 1.0934053941926667, 1.1212500203779576, 1.9305071759603967, 1.4952376543717645, 1.6780209060903652, 1.4971041271046768, 1.0813616058120215, 1.0795468354519193, 1.7590297878659409, 1.4385492462659415, 1.504266233716619, 1.5091639400123018, 1.5605068219906209, 2.3710227714993355, 2.1713161288579697, 1.0738382348604054, 4.662506969047764, 1.920250683720848, 1.4467320808761224, 3.8535279150182586, 1.8304882882009013, 2.123056866714624, 1.739876134412126, 0.648104785858764, 1.149028665797946, 1.2419654083082254, 1.1940420599571506, 1.1493293863286498, 1.0780619590544456, 1.0989252034375063, 1.091035876325894, 1.620965647536308, 1.646021971953262, 1.673317910286507, 1.1975032888859138, 1.2971163496252929, 2.3173691512195456, 1.0965556015174243, 1.852196974715266, 1.168927690150863, 1.4163553322500761, 1.0059952909985583, 1.5579528941125094, 1.8836448570372175, 1.5012997215156612, 1.13746268858108, 1.7214650231734943, 1.353120356926523, 0.8274956661410077, 0.9171107046995428, 0.6187791323084025, 0.6966792297657726, 0.8932322222508255, 0.6302639194772541, 1.2583594313929412, 1.459625332592304, 0.7189666494143688, 0.5783756038627024, 0.618663910646864, 0.6523190455012459, 0.9855182528084964, 1.2977014378763554, 1.2573899210059991, 0.693241983025056, 1.1783351441677965, 0.8991020066952452, 1.2690706861827736, 1.0052985195551867, 1.1516568363383333, 1.538564436162589, 1.512355887432645, 1.2308547123228872, 1.6742717999345713, 1.216874043655226, 1.3243194092910453, 1.7850904056639563, 1.975636987981692, 1.976104673627543, 1.8909171996172114, 1.2505865675867986, 1.144041199049667, 1.9229168171928364, 2.5672720821266806, 1.5305606891583006, 2.0924098255827213, 1.3520808200505525, 1.3508801849671188, 1.1592496344801568, 1.039375268731743, 1.1605031107697066, 1.2128789267289137, 1.5472285965363806, 1.0931985233293589], "xaxis": "x", "y": [null, 123.45821361487685, 154.1611971981173, -54.960612726579825, -167.2716286561668, 3.0119987145385494, 29.220471367461073, -27.15887365744277, 191.55566741002792, 163.64513386680142, -24.767501329812603, 55.49326228360394, 192.24158526727308, 11.169079147043476, 12.917181219841837, 16.277108391246998, 12.219767766984148, 193.70510330769764, 58.6415729809853, 154.264949161382, 29.680034694725805, 38.07179249374809, 22.687268890852238, 40.077138774001696, 10.931054426279502, 28.774646306374052, -41.92138200996334, 32.632142531958664, 20.510033338543224, 17.813483797626816, 177.40556346213498, -98.7733713673764, 188.29690020319947, 46.0789054313575, 188.7674945869593, 118.46999117518476, 71.13523640231335, 137.99493684012293, 91.19707517726533, 120.22459159015318, 127.57674260361262, 235.48884291565332, 147.87402454591836, 150.02939265901807, 112.73104432894218, 122.97878185909781, 185.17630687697277, 161.01340705515582, -22.79886261556328, 30.794008936169973, 14.571796154224558, 178.01704202917352, 131.40976346357752, 146.4777351476847, 150.94922926065237, -144.2971507684939, -7.700189926095732, -86.15071017734647, 116.21635868224098, 200.7552743267703, 158.85555941072823, 42.20449064718622, 31.95734924082734, 138.1199557284175, 176.63478989183272, -14.680087221361646, -120.88297439333667, 180.52727558041659, 147.4322753081771, 113.52903047802482, 206.5412509543304, 104.82570522207436, 157.8100121762323, 108.12770643484879, 168.49700547568625, 200.18995344132566, 86.07626898815022, 137.10161751811478, 89.80289382079297, 49.31184165748584, 179.03969578544752, -3.5399041729591545, 27.41203662913125, -16.567415823442616, 12.537448936560793, 151.65537016264153, 114.58567757727792, 137.35914550395955, 128.31970522226527, 81.82638398094696, 55.100706848449704, -1.7394033971353338, 133.00092503701842, 91.61565425789274, -156.5596532295907, -134.78447594361057, 30.095512165973787, 41.03582635490386, 11.452450457207135, -23.521698762115534, -0.9608804856073903, 141.63781713183607, 57.97892101087291, 73.45135617079313, 176.2302602473373, 140.69413994187585, 162.77048527739692, -112.16728454694646, 134.69737106279769, 130.60116976944403, 162.73087998462796, 26.281852456365073, 133.49867376076526, 16.7900606108455, 28.635571945400613, 27.561677072407633, 22.93418466069045, 114.43303132615767, 75.61299355171934, 185.14424160946396, 138.77277088351389, 158.32828361240468, -67.92609588575522, 134.44635814583125, -34.775544116565584, -66.06577200667601, 27.386543130104315, 162.4570983313577, 143.44018411866057, 1.8758192825477522, -0.5720947419458184, 182.68524705511936, 31.480750325559427, 39.117928114431436, 133.16993198463507, -104.28859721614049, -59.90854723242791, -13.734596594890263, 146.4721965495405, 169.90065959399095, 92.15367313860645, 151.05916135940072, 12.917181219841837, 15.042401792353758, 141.72503286419447, 178.18456749139966, 86.67204379867303, 37.56515612099071, -97.80023557715549, 23.600327580367434, -119.074190849805, 29.027426972544333, 0.2512128566499996, 15.781862644290868, -21.3579428194206, -74.76644048112661, -15.746688822104602, 25.49106287116001, 130.59374849261116, 165.63808603171015, 25.05785967378904, -39.79643811472033, 113.55228864553987, 80.31522535115505, 80.69285000977482, -86.15071017734647, 85.0831398566628, 5.707616764859949, 111.97068881236282, 127.00894378009184, -69.36018199026194, 112.76875465845671, 65.5191074837984, 189.8754765133507, 171.58113014638502, 177.56618223757653, 160.61475338477658, 199.0876674813302, 168.39257998219682, 101.27645842156528, 121.21114156025885, 188.91829692550715, 2.3517366209377997, 119.43252603513571, 91.77411178564091, 135.21114303996796, 24.556339460145466, 43.678517338517565, 141.57495519981978, -156.45861665471352, 157.67153350395125, 131.6428259647098, 26.84339385576476, 13.004747393004834, 160.79608835909346, 201.32211503739342, 179.797218850119, 171.9060137367547, 64.8614072616632, 24.55962090543312, 149.64798967905335, 163.95016649368176, 142.9010035244521, 161.7333966827743, 127.48454137726617, 197.79227338763263, 182.91427510754448, 178.2189570594399, 166.3527941075339, 177.88939344709615, 12.93164080878421, 58.91201444654553, 142.00815536416735, -18.8692952437965, -23.446667764912377, 57.902312876594806, 92.28195212108847, 55.23700209539646, 82.67016394977406, 13.202239289090414, -4.5189802932216026, -14.446212481989619, 133.05228967684513, 88.45635651319787, 130.87604370252643, 168.22572670464797, 93.44580121052024, 10.845867024318295, 117.12827339588364, 170.36441200293564, 134.1088795197877, 139.60484820199088, 161.11699251879025, 142.90511493924316, 162.3020577033065, 120.1848466865888, -125.28208112509799], "yaxis": "y", "type": "scatter" }], { "legend": { "tracegroupgap": 0 }, "margin": { "t": 60 }, "template": { "data": { "barpolar": [{ "marker": { "line": { "color": "#E5ECF6", "width": 0.5 }, "pattern": { "fillmode": "overlay", "size": 10, "solidity": 0.2 } }, "type": "barpolar" }], "bar": [{ "error_x": { "color": "#2a3f5f" }, "error_y": { "color": "#2a3f5f" }, "marker": { "line": { "color": "#E5ECF6", "width": 0.5 }, "pattern": { "fillmode": "overlay", "size": 10, "solidity": 0.2 } }, "type": "bar" }], "carpet": [{ "aaxis": { "endlinecolor": "#2a3f5f", "gridcolor": "white", "linecolor": "white", "minorgridcolor": "white", "startlinecolor": "#2a3f5f" }, "baxis": { "endlinecolor": "#2a3f5f", "gridcolor": "white", "linecolor": "white", "minorgridcolor": "white", "startlinecolor": "#2a3f5f" }, "type": "carpet" }], "choropleth": [{ "colorbar": { "outlinewidth": 0, "ticks": "" }, "type": "choropleth" }], "contourcarpet": [{ "colorbar": { "outlinewidth": 0, "ticks": "" }, "type": "contourcarpet" }], "contour": [{ "colorbar": { "outlinewidth": 0, "ticks": "" }, "colorscale": [[0.0, "#0d0887"], [0.1111111111111111, "#46039f"], [0.2222222222222222, "#7201a8"], [0.3333333333333333, "#9c179e"], [0.4444444444444444, "#bd3786"], [0.5555555555555556, "#d8576b"], [0.6666666666666666, "#ed7953"], [0.7777777777777778, "#fb9f3a"], [0.8888888888888888, "#fdca26"], [1.0, "#f0f921"]], "type": "contour" }], "heatmapgl": [{ "colorbar": { "outlinewidth": 0, "ticks": "" }, "colorscale": [[0.0, "#0d0887"], [0.1111111111111111, "#46039f"], [0.2222222222222222, "#7201a8"], [0.3333333333333333, "#9c179e"], [0.4444444444444444, "#bd3786"], [0.5555555555555556, "#d8576b"], [0.6666666666666666, "#ed7953"], [0.7777777777777778, "#fb9f3a"], [0.8888888888888888, "#fdca26"], [1.0, "#f0f921"]], "type": "heatmapgl" }], "heatmap": [{ "colorbar": { "outlinewidth": 0, "ticks": "" }, "colorscale": [[0.0, "#0d0887"], [0.1111111111111111, "#46039f"], [0.2222222222222222, "#7201a8"], [0.3333333333333333, "#9c179e"], [0.4444444444444444, "#bd3786"], [0.5555555555555556, "#d8576b"], [0.6666666666666666, "#ed7953"], [0.7777777777777778, "#fb9f3a"], [0.8888888888888888, "#fdca26"], [1.0, "#f0f921"]], "type": "heatmap" }], "histogram2dcontour": [{ "colorbar": { "outlinewidth": 0, "ticks": "" }, "colorscale": [[0.0, "#0d0887"], [0.1111111111111111, "#46039f"], [0.2222222222222222, "#7201a8"], [0.3333333333333333, "#9c179e"], [0.4444444444444444, "#bd3786"], [0.5555555555555556, "#d8576b"], [0.6666666666666666, "#ed7953"], [0.7777777777777778, "#fb9f3a"], [0.8888888888888888, "#fdca26"], [1.0, "#f0f921"]], "type": "histogram2dcontour" }], "histogram2d": [{ "colorbar": { "outlinewidth": 0, "ticks": "" }, "colorscale": [[0.0, "#0d0887"], [0.1111111111111111, "#46039f"], [0.2222222222222222, "#7201a8"], [0.3333333333333333, "#9c179e"], [0.4444444444444444, "#bd3786"], [0.5555555555555556, "#d8576b"], [0.6666666666666666, "#ed7953"], [0.7777777777777778, "#fb9f3a"], [0.8888888888888888, "#fdca26"], [1.0, "#f0f921"]], "type": "histogram2d" }], "histogram": [{ "marker": { "pattern": { "fillmode": "overlay", "size": 10, "solidity": 0.2 } }, "type": "histogram" }], "mesh3d": [{ "colorbar": { "outlinewidth": 0, "ticks": "" }, "type": "mesh3d" }], "parcoords": [{ "line": { "colorbar": { "outlinewidth": 0, "ticks": "" } }, "type": "parcoords" }], "pie": [{ "automargin": true, "type": "pie" }], "scatter3d": [{ "line": { "colorbar": { "outlinewidth": 0, "ticks": "" } }, "marker": { "colorbar": { "outlinewidth": 0, "ticks": "" } }, "type": "scatter3d" }], "scattercarpet": [{ "marker": { "colorbar": { "outlinewidth": 0, "ticks": "" } }, "type": "scattercarpet" }], "scattergeo": [{ "marker": { "colorbar": { "outlinewidth": 0, "ticks": "" } }, "type": "scattergeo" }], "scattergl": [{ "marker": { "colorbar": { "outlinewidth": 0, "ticks": "" } }, "type": "scattergl" }], "scattermapbox": [{ "marker": { "colorbar": { "outlinewidth": 0, "ticks": "" } }, "type": "scattermapbox" }], "scatterpolargl": [{ "marker": { "colorbar": { "outlinewidth": 0, "ticks": "" } }, "type": "scatterpolargl" }], "scatterpolar": [{ "marker": { "colorbar": { "outlinewidth": 0, "ticks": "" } }, "type": "scatterpolar" }], "scatter": [{ "fillpattern": { "fillmode": "overlay", "size": 10, "solidity": 0.2 }, "type": "scatter" }], "scatterternary": [{ "marker": { "colorbar": { "outlinewidth": 0, "ticks": "" } }, "type": "scatterternary" }], "surface": [{ "colorbar": { "outlinewidth": 0, "ticks": "" }, "colorscale": [[0.0, "#0d0887"], [0.1111111111111111, "#46039f"], [0.2222222222222222, "#7201a8"], [0.3333333333333333, "#9c179e"], [0.4444444444444444, "#bd3786"], [0.5555555555555556, "#d8576b"], [0.6666666666666666, "#ed7953"], [0.7777777777777778, "#fb9f3a"], [0.8888888888888888, "#fdca26"], [1.0, "#f0f921"]], "type": "surface" }], "table": [{ "cells": { "fill": { "color": "#EBF0F8" }, "line": { "color": "white" } }, "header": { "fill": { "color": "#C8D4E3" }, "line": { "color": "white" } }, "type": "table" }] }, "layout": { "annotationdefaults": { "arrowcolor": "#2a3f5f", "arrowhead": 0, "arrowwidth": 1 }, "autotypenumbers": "strict", "coloraxis": { "colorbar": { "outlinewidth": 0, "ticks": "" } }, "colorscale": { "diverging": [[0, "#8e0152"], [0.1, "#c51b7d"], [0.2, "#de77ae"], [0.3, "#f1b6da"], [0.4, "#fde0ef"], [0.5, "#f7f7f7"], [0.6, "#e6f5d0"], [0.7, "#b8e186"], [0.8, "#7fbc41"], [0.9, "#4d9221"], [1, "#276419"]], "sequential": [[0.0, "#0d0887"], [0.1111111111111111, "#46039f"], [0.2222222222222222, "#7201a8"], [0.3333333333333333, "#9c179e"], [0.4444444444444444, "#bd3786"], [0.5555555555555556, "#d8576b"], [0.6666666666666666, "#ed7953"], [0.7777777777777778, "#fb9f3a"], [0.8888888888888888, "#fdca26"], [1.0, "#f0f921"]], "sequentialminus": [[0.0, "#0d0887"], [0.1111111111111111, "#46039f"], [0.2222222222222222, "#7201a8"], [0.3333333333333333, "#9c179e"], [0.4444444444444444, "#bd3786"], [0.5555555555555556, "#d8576b"], [0.6666666666666666, "#ed7953"], [0.7777777777777778, "#fb9f3a"], [0.8888888888888888, "#fdca26"], [1.0, "#f0f921"]] }, "colorway": ["#636efa", "#EF553B", "#00cc96", "#ab63fa", "#FFA15A", "#19d3f3", "#FF6692", "#B6E880", "#FF97FF", "#FECB52"], "font": { "color": "#2a3f5f" }, "geo": { "bgcolor": "white", "lakecolor": "white", "landcolor": "#E5ECF6", "showlakes": true, "showland": true, "subunitcolor": "white" }, "hoverlabel": { "align": "left" }, "hovermode": "closest", "mapbox": { "style": "light" }, "paper_bgcolor": "white", "plot_bgcolor": "#E5ECF6", "polar": { "angularaxis": { "gridcolor": "white", "linecolor": "white", "ticks": "" }, "bgcolor": "#E5ECF6", "radialaxis": { "gridcolor": "white", "linecolor": "white", "ticks": "" } }, "scene": { "xaxis": { "backgroundcolor": "#E5ECF6", "gridcolor": "white", "gridwidth": 2, "linecolor": "white", "showbackground": true, "ticks": "", "zerolinecolor": "white" }, "yaxis": { "backgroundcolor": "#E5ECF6", "gridcolor": "white", "gridwidth": 2, "linecolor": "white", "showbackground": true, "ticks": "", "zerolinecolor": "white" }, "zaxis": { "backgroundcolor": "#E5ECF6", "gridcolor": "white", "gridwidth": 2, "linecolor": "white", "showbackground": true, "ticks": "", "zerolinecolor": "white" } }, "shapedefaults": { "line": { "color": "#2a3f5f" } }, "ternary": { "aaxis": { "gridcolor": "white", "linecolor": "white", "ticks": "" }, "baxis": { "gridcolor": "white", "linecolor": "white", "ticks": "" }, "bgcolor": "#E5ECF6", "caxis": { "gridcolor": "white", "linecolor": "white", "ticks": "" } }, "title": { "x": 0.05 }, "xaxis": { "automargin": true, "gridcolor": "white", "linecolor": "white", "ticks": "", "title": { "standoff": 15 }, "zerolinecolor": "white", "zerolinewidth": 2 }, "yaxis": { "automargin": true, "gridcolor": "white", "linecolor": "white", "ticks": "", "title": { "standoff": 15 }, "zerolinecolor": "white", "zerolinewidth": 2 } } }, "xaxis": { "anchor": "y", "domain": [0.0, 1.0], "title": { "text": "distance_score" } }, "yaxis": { "anchor": "x", "domain": [0.0, 1.0], "title": { "text": "energy_score" } } }, { "responsive": true });
        const plotDataSet = await getData();
        if (!plotDataSet || plotDataSet.count === 0) return;
        // id, title, author, upload_time, plotly_data, target, project, identifier
        setPlotlyDatasets(plotDataSet);
        // const dataset = plotDataSet[0];
        // handleDatasetChange(dataset.id);
    }, [getData]);

    const renderPlotly = useCallback((dataset) => {
        const plotData = dataset.plotly_data;

        // plotData.layout['autosize'] = true;
        plotData.layout['width'] = divRef.current.clientWidth;
        plotData.layout['height'] = divRef.current.clientHeight;

        // maybe for future resizing
        // if (plotlyGraph.current) {
        //     Plotly.relayout(plotlyGraph.current, { width: divRef.current.clientWidth, height: divRef.current.clientHeight });
        // }

        plotlyGraph.current = Plotly.newPlot(componentId.current, plotData.data, plotData.layout);

        // https://plotly.com/javascript/lasso-selection/
        const myPlot = document.getElementById(componentId.current);
        myPlot.on('plotly_click', function (data) {
            let selectors = []
            for (var i = 0; i < data.points.length; i++) {
                // console.log('data.points', data.points[i]);
                selectors.push(data.points[i].customdata)
                // selectors.push(data.points[i].x);
            };
            highlightLHSElement(selectors, dataset);
        });
    }, [highlightLHSElement]);

    const handleDatasetChange = useCallback((value) => {
        const dataset = plotlyDatasets.find(d => d.id === value);
        setSelectedDataset(dataset);

        if (!dataset) return;

        renderPlotly(dataset);
    }, [plotlyDatasets, renderPlotly]);

    return <Panel
        //   ref={ref}
        hasHeader
        hasExpansion
        defaultExpanded
        title={selectedDataset ? `Graphs: "${selectedDataset.title}" (${selectedDataset.author?.first_name} ${selectedDataset.author?.last_name})` : "Graphs"}
        onExpandChange={useCallback(
            expanded => {
                dispatch(setPanelsExpanded(layoutItemNames.PLOTLY_VIEW, expanded));
                expandHandler && expandHandler(expanded);
            },
            [dispatch, expandHandler]
        )}
        headerActions={[
            <Grid container className={classes.headerContainer} key="plotly-header">
                <Grid item xs style={{ textAlign: 'right' }}>
                    {selectedDataset && (
                        <RichTooltip path="backToList">
                            <Button
                                className={classes.backButton}
                                variant="contained"
                                color="primary"
                                size="small"
                                onClick={() => setSelectedDataset(null)}
                            >
                                BACK TO LIST
                            </Button>
                        </RichTooltip>
                    )}
                </Grid>
            </Grid>
        ]}
    >

        <div ref={divRef} className={classes.viewWrapper}>
            <Grid container direction="column" alignItems="center" justifyContent={"flex-start"} spacing={0.5}>
                {!selectedDataset && plotlyDatasets.map(d => <Grid item xs key={d.id} style={{ width: '100%' }}>
                    <PlotlyItem item={d} onShowClick={() => handleDatasetChange(d.id)} />
                </Grid>)}
                <Grid item xs id={componentId.current} className={classes.plotlyDiv} style={{ display: !!selectedDataset ? 'flex' : 'none' }}></Grid>
            </Grid>
        </div>
    </Panel>;
});
