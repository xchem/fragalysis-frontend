export const URLS = {
  snapshot: '/viewer/react/snapshot/',
  landing: '/viewer/react/landing/',
  fragglebox: '/viewer/react/fragglebox/',
  prodLanding: 'https://fragalysis.diamond.ac.uk/viewer/react/landing/',
  login: '/accounts/login/',
  logout: '/accounts/logout/',
  management: '/viewer/react/management/',
  funders: '/viewer/react/funders/',
  target: '/viewer/react/preview/target/',

  // Projects feature
  projects: '/viewer/react/projects/',
  // Direct feature
  direct: '/viewer/react/preview/direct/',
  download: '/viewer/react/download/'
};

//this constant indicates whether we are debugging local stack or remote stack
//if we are debugging local stack this variable needs to be set to true and
//if were debugging remote stack this variable needs to be set to false
export const isRemoteDebugging = true;

// export const base_url = window.location.protocol + '//' + window.location.host; //url for local developement
export const base_url = 'https://fragalysis-tibor-default.xchem-dev.diamond.ac.uk'; //url for debugging on main dev pod
//export const base_url = 'https://fragalysis-boris-default.xchem-dev.diamond.ac.uk'; //url for debugging on secondary dev pod
// export const base_url = 'https://fragalysis.xchem.diamond.ac.uk'; //url for debugging staging
// export const base_url = 'https://fragalysis.diamond.ac.uk'; //url for debugging production
