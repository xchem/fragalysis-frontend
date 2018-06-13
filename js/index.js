import 'babel-polyfill'
import React from 'react'
import { render } from 'react-dom'
import Root from './containers/root'
import '../css/index.css';
import {
  BrowserRouter as Router,
  Route,
  Link
} from 'react-router-dom';


render(
      <Root />, document.getElementById('app')
) 