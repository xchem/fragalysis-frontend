/**
 * Get image for src from \js\img\logos
 *
 * @param {string} image image file name
 * @returns
 */
export const get_logo = image => {
    return require('../../img/logos/' + image);
}

/**
 * List of companies with their definitions
 */
export const COMPANIES = {
    diamond: {
        title: 'Diamond Light Source',
        link: 'https://www.diamond.ac.uk/Home.html',
        image: 'dlsLogo.png'
    },
    asap: {
        title: 'AI-driven Structure-enabled Antiviral Platform',
        link: 'https://asapdiscovery.org/',
        image: 'asapLogo.jpg'
    },
    xchem: {
        title: 'XChem',
        link: 'https://www.diamond.ac.uk/Instruments/Mx/Fragment-Screening.html',
        image: 'xchemLogo.png'
    },
    fragmentScreen: {
        title: 'Fragment-Screen',
        link: 'https://fragmentscreen.org/home',
        image: 'fragmentScreenLogo.png'
    },
    sgc: {
        title: 'Structural Genomics Consortium',
        link: 'https://www.thesgc.org/',
        image: 'sgcLogo.png'
    },
    iris: {
        title: 'IRIS',
        link: 'https://www.iris.ac.uk/',
        image: 'irisLogo.png'
    },
    niaid: {
        title: 'National Institute of Allergy and Infectious Diseases',
        link: 'https://www.niaid.nih.gov/',
        image: 'niaidLogo.png'
    },
    iEric: {
        title: 'Instruct-ERIC',
        link: 'https://instruct-eric.org/',
        image: 'iEricLogo.png'
    },
    alc: {
        title: 'Ada Lovelace Center',
        link: 'https://adalovelacecentre.ac.uk/',
        image: 'alcLogo.png'
    },
    ukRI: {
        title: 'UK Research and Innovation',
        link: 'https://www.ukri.org/',
        image: 'ukRILogo.png'
    },
    inext: {
        title: 'iNEXT-Discovery',
        link: 'http://www.inext-eu.org/',
        image: 'inextLogo.png'
    },
    jff: {
        title: 'John Fell Fund',
        link: 'https://researchsupport.admin.ox.ac.uk/funding/internal/jff',
        image: 'jffLogo.jpg'
    },
    newtonfund: {
        title: 'Newton Fund',
        link: 'https://www.newtonfund.ac.uk/',
        image: 'nfLogo.png'
    },
    wellcomeTrust: {
        title: 'Institutional Strategic Support Fund',
        link: 'https://wellcome.org/grant-funding/funded-people-and-projects/institutional-strategic-support-fund',
        image: 'wtLogo.png'
    },
    wellcome: {
        title: 'Wellcome',
        link: 'https://wellcome.org',
        image: 'welcomeLogo.jpg'
    },
    ultradd: {
        title: 'Unrestricted Leveraging of Targets for Research Advancement and Drug Discovery',
        link: 'https://ultra-dd.org/',
        image: 'ultraddLogo.png'
    },
    imi: {
        title: 'Innovative Medicines Initiative',
        link: 'https://www.imi.europa.eu/',
        image: 'imiLogo.png'
    },
    ukRIstfc: {
        title: 'Science and Technology Facilities Council',
        link: 'https://www.ukri.org/councils/stfc/',
        image: 'ukRIstfcLogo.jpg'
    },
    rosetrees: {
        title: 'Rosetrees',
        link: 'https://rosetrees.org.uk/',
        image: 'rosetreesLogo.png'
    },
    eu: {
        title: 'European Union',
        link: 'https://european-union.europa.eu/live-work-study/funding-grants-subsidies_en',
        image: 'euLogo.png'
    },
    eubopen: {
        title: 'EUbOPEN',
        link: 'https://www.eubopen.org/',
        image: 'eubopenLogo.png'
    },
    harwell: {
        title: 'The Research Complex at Harwell',
        link: 'https://www.ukri.org/who-we-are/mrc/institutes-units-and-centres/the-research-complex-at-harwell/',
        image: 'harwellLogo.png'
    },
    sabs: {
        title: 'SABS R³',
        link: 'https://www.sabsr3.ox.ac.uk/home',
        image: 'sabsLogo.png'
    },
    cmd: {
        title: 'Centre for Medicines Discovery',
        link: 'https://www.cmd.ox.ac.uk/',
        image: 'cmdLogo.png'
    },
    opig: {
        title: 'Oxford Protein Informatics Group',
        link: 'https://opig.stats.ox.ac.uk/',
        image: 'opigLogo.png'
    },
    horizon: {
        title: 'Horizon 2020',
        link: 'https://ec.europa.eu/programmes/horizon2020/',
        image: 'horizon2020Logo.jpg'
    },
    janssen: {
        title: 'Janssen',
        link: 'https://www.janssen.com/',
        image: 'janssenLogo.png'
    },
    m2ms: {
        title: 'M2M Solutions',
        link: 'https://www.en.m2ms.sk/',
        image: 'm2msLogo.png'
    },
    informaticsmatters: {
        title: 'Informatics Matters',
        link: 'https://www.informaticsmatters.com/',
        image: 'informaticsLogo.png'
    },
    // company: {
    //   link: 'https://www.acellera.com/',
    //   image:
    // },
    // company: {
    //   link: 'https://www.rse.ox.ac.uk/',
    //   image:
    // },
    // company: {
    //   link: 'https://www.molsoft.com/',
    //   image:
    // },
    moonshot: {
        title: 'COVID Moonshot',
        link: 'https://covid.postera.ai/covid',
        image: 'covidMoonshotLogo.png'
    },
    mrc: {
        title: 'Medical Research Council',
        link: 'https://mrc.ukri.org/',
        image: 'mrcLogo.png'
    }
};

/**
 * Companies listed in funding section
 */
export const FUNDING = [
    COMPANIES.diamond,
    COMPANIES.asap,
    COMPANIES.fragmentScreen,
    COMPANIES.ultradd,
    COMPANIES.sgc,
    COMPANIES.iris,
    COMPANIES.niaid,
    COMPANIES.iEric,
    COMPANIES.janssen,
    COMPANIES.wellcomeTrust,
    COMPANIES.alc,
    COMPANIES.wellcome,
    COMPANIES.ukRI,
    COMPANIES.imi,
    COMPANIES.jff,
    COMPANIES.ukRIstfc,
    COMPANIES.rosetrees,
    COMPANIES.eu,
    COMPANIES.eubopen,
    COMPANIES.newtonfund,
    COMPANIES.harwell,
    COMPANIES.sabs,
    COMPANIES.inext,
    COMPANIES.horizon,
    COMPANIES.mrc
];

/**
 * Companies listed in contributors section
 */
export const CONTRIBUTORS = [
    COMPANIES.xchem,
    COMPANIES.m2ms,
    COMPANIES.informaticsmatters,
    COMPANIES.cmd,
    COMPANIES.opig,
    COMPANIES.sabs,
    COMPANIES.moonshot,
    COMPANIES.janssen
];
