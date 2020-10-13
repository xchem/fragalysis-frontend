import React, { memo, useContext, useEffect, useRef, useState } from 'react';
import { useRouteMatch } from 'react-router-dom';
import Preview from '../preview/Preview';
import {URL_TOKENS} from './constants';

export const DirectDisplay = memo(props => {
  let match = useRouteMatch();

  useEffect(() => {
    const param = match.params[0];
    if (param && param.startsWith(URL_TOKENS.target)) {
      let withoutKeyword = param.split(URL_TOKENS.target);
      if (withoutKeyword && withoutKeyword.length === 2) {
        const splitParams = withoutKeyword[1].split('/');
        if (splitParams && splitParams.length > 1) {
          let target = splitParams[1];
          let rest = splitParams.slice(2);
          let molecules = [];
          if (rest && rest.length > 1 && rest[0] === URL_TOKENS.molecules) {
            rest = rest.slice(1);
            let i;
            let currentMolecule;
            for (i = 0; i < rest.length; i++) {
              const part = rest[i];
              if (part && part.trim()) {
                if (i === 0) {
                  target = part;
                  continue;
                } else {
                  if (currentMolecule) {
                    switch (part || part.toUpperCase()) {
                      case 'A':
                        currentMolecule.L = true;
                        currentMolecule.P = true;
                        currentMolecule.C = true;
                        currentMolecule.S = true;
                        currentMolecule.V = true;
                        break;
                      case 'L':
                        currentMolecule.L = true;
                        break;
                      case 'P':
                        currentMolecule.P = true;
                        break;
                      case 'C':
                        currentMolecule.C = true;
                        break;
                      case 'S':
                        currentMolecule.S = true;
                        break;
                      case 'V':
                        currentMolecule.V = true;
                        break;
                      default:
                        currentMolecule = { name: part, L: true, P: false, C: false, S: false, V: false };
                        molecules.push(currentMolecule);
                        break;
                    }
                  } else {
                    currentMolecule = { name: part, L: true, P: false, C: false, S: false, V: false };
                    molecules.push(currentMolecule);
                  }
                }
              } else {
                continue;
              }
            }
          }
        }
      }
    }
  }, [match]);

  return <Preview />;
});
