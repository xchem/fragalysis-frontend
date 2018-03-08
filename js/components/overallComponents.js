import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import * as apiActions from '../actions/apiActions'
import * as types from '../actions/actonTypes'
import { Col } from 'react-bootstrap';
import { MolGroupList, MoleculeList} from './apiComponents';
import { NGLView } from './nglComponents';


export class Tindspect extends Component {

    constructor(props) {
    super(props)
    this.handleChange = this.handleChange.bind(this)
    this.handleRefreshClick = this.handleRefreshClick.bind(this)
  }
 
  componentDidMount() {
      const getParams = {}
      this.props.dispatch(apiActions.fetchDataFillDiv(types.LOAD_TARGETS, {}, types.LOAD_TARGETS))
  }
 
  componentDidUpdate(prevProps) {
      this.props.dispatch(apiActions.loadTargets())
  }
 
  handleChange(nextSubreddit) {

  }
 
  handleRefreshClick(e) {
    e.preventDefault()
 
    const { dispatch, selectedSubreddit } = this.props
    dispatch(invalidateSubreddit(selectedSubreddit))
    dispatch(fetchPostsIfNeeded(selectedSubreddit))
  }
 
  render() {
        return <a>
            <Col xs={2}>
                <MolGroupList />
            </Col>
            <Col xs={4}>
                <MoleculeList />
            </Col>
            <Col xs={6} md={6} >
                <NGLView />
            </Col>
        </a>
    }

}