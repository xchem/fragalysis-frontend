import { api, METHOD } from '../../../utils/api';

export const getServiceStatus = async () => {
  const states = ['OK', 'DEGRADED', 'unknown1', 'unknown2']
  const services = [
    // { id: 1, name: 'service1', state: states[Math.floor(Math.random() * states.length)] },
    // { id: 2, name: 'service2', state: states[Math.floor(Math.random() * states.length)] },
    // { id: 3, name: 'service3', state: states[Math.floor(Math.random() * states.length)] },
    // { id: 4, name: 'service4', state: states[Math.floor(Math.random() * states.length)] }
  ];
  return Promise.resolve(services).then((resp => {
    return resp;
  }));
  // return api({
  //   url: 'service status url',
  //   method: METHOD.GET,
  //   data: 'do we need some data?'
  // })
  //   .then(resp => {
  //     return resp.data;
  //   })
  //   .catch(err => console.log(err));
};