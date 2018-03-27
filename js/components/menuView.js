/**
 * Created by abradley on 20/03/2018.
 */
import Menu from './menu';
import React from 'react';
import TargetList from './targetList';
var styles = {
  bmBurgerButton: {
    position: 'fixed',
    width: '36px',
    height: '30px',
    left: '36px',
    top: '20px'
  },
  bmBurgerBars: {
    background: '#373a47'
  },
  bmCrossButton: {
    height: '24px',
    width: '24px'
  },
  bmCross: {
    background: '#bdc3c7'
  },
  bmMenu: {
    background: '#373a47',
    padding: '2.5em 1.5em 0',
    fontSize: '1.15em'
  },
  bmMorphShape: {
    fill: '#373a47'
  },
  bmItemList: {
    color: '#b8b7ad',
    padding: '0.8em'
  },
  bmOverlay: {
    background: 'rgba(0, 0, 0, 0.3)'
  }
}



export class MyMenu extends React.Component {
  showSettings (event) {
    event.preventDefault();
  }

  render () {
      var menuBody = [
          <a key="HOME" id="home" className="menu-item" href="/"><i className="fa fa-fw fa-star-o" /><span>Home</span></a>,
          <a key="LOGIN" className="menu-item--small" href="/accounts/login"><i className="fa fa-fw fa-bell-o" /><span>Login</span></a>,
          <TargetList key="TARGLIST"/>
          ]
      return (
      <Menu right styles={styles}>
          {menuBody}
      </Menu>
    );
  }
}