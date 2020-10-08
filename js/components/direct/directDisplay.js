import React, { memo, useContext, useEffect, useRef, useState } from 'react';
import { useRouteMatch } from 'react-router-dom';
import Preview from '../preview/Preview';

export const DirectDisplay = memo(props => {
  let match = useRouteMatch();

  useEffect(() => {
    const param = match.params[0];
    const splitParams = param.split('/');
    let target;
    let molecules = [];
    let i;
    let currentMolecule;
    for (i = 0; i < splitParams.length; i++) {
      const part = splitParams[i];
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
  }, [match]);

  return <Preview />;
});
