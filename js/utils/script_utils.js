/**
 * Created by abradley on 03/08/2018.
 */
export class DockingScripts {
    getDuckYaml(prot_code, interaction) {
        var out_data = 'prot_code: "' + prot_code + '"\n' +
            'prot_int: "' + interaction + '"\n' +
            'cutoff: 9\n' +
            'md_len: 0.5\n' +
            'init_velocity: 0.00001\n' +
            'num_smd_cycles: 10\n' +
            'distance: 2.5\n' +
            'gpu_id: "0"\n' +
            'apo_pdb_file: ' + prot_code + '_apo.pdb\n' +
            'mol_file: ' + prot_code + '.mol'
        return out_data
    }

    getYankYaml(prot_code) {
        var yank_yaml = "options:\n  minimize: yes\n  verbose: no\n  output_dir: sams-twostage-harmonic-dense\n  temperature: 300*kelvin\n  pressure: 1*atmosphere\n  switch_experiment_interval: 50\n  resume_setup: yes\n  resume_simulation: yes\n  processes_per_experiment: 1\n  hydrogen_mass: 3.0 * amu\n  checkpoint_interval: 50\n  alchemical_pme_treatment: exact \n\nmolecules:\n  prot:\n    filepath: no_buffer_altlocs.pdb\n  lig:\n    filepath: " + prot_code + "_params.mol2 \n    antechamber:\n      charge_method: bcc\n\nmcmc_moves:\n    langevin:\n        type: LangevinSplittingDynamicsMove\n        timestep: 4.0*femtosecond\n        splitting: 'V R R R O R R R V'\n        n_steps: 1250\n\nsamplers:\n    sams:\n        type: SAMSSampler\n        mcmc_moves: langevin\n        state_update_scheme: global-jump\n        flatness_threshold: 10.0\n        number_of_iterations: 200000\n        gamma0: 10.0\n        online_analysis_interval: null\n\nsolvents:\n  pme:\n    nonbonded_method: PME\n    switch_distance: 9*angstroms\n    nonbonded_cutoff: 10*angstroms\n    ewald_error_tolerance: 1.0e-4\n    clearance: 9*angstroms\n    positive_ion: Na+\n    negative_ion: Cl-\n    solvent_model: tip3p\n\nsystems:\n  prot-lig:\n    receptor: prot\n    ligand: lig\n    solvent: pme\n    leap:\n      parameters: [leaprc.protein.ff14SB, leaprc.gaff2, leaprc.water.tip3p]\n\nprotocols:\n  dense-protocol:\n    complex:\n      alchemical_path:\n        lambda_restraints:     [1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.000, 1.00, 1.000, 1.00, 1.000, 1.00, 1.000, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00]\n        lambda_electrostatics: [1.00, 0.99, 0.98, 0.97, 0.96, 0.95, 0.94, 0.93, 0.92, 0.91, 0.90, 0.85, 0.80, 0.75, 0.70, 0.65, 0.60, 0.55, 0.50, 0.45, 0.40, 0.35, 0.30, 0.25, 0.20, 0.15, 0.10, 0.05, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.000, 0.00, 0.000, 0.00, 0.000, 0.00, 0.000, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00]\n        lambda_sterics:        [1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 0.99, 0.98, 0.97, 0.96, 0.95, 0.94, 0.93, 0.92, 0.91, 0.90, 0.89, 0.88, 0.87, 0.86, 0.85, 0.84, 0.83, 0.82, 0.81, 0.80, 0.79, 0.78, 0.77, 0.76, 0.75, 0.74, 0.73, 0.72, 0.71, 0.70, 0.69, 0.68, 0.67, 0.66, 0.65, 0.64, 0.63, 0.62, 0.61, 0.60, 0.59, 0.58, 0.57, 0.56, 0.55, 0.54, 0.53, 0.52, 0.51, 0.50, 0.49, 0.48, 0.47, 0.46, 0.45, 0.44, 0.43, 0.42, 0.41, 0.40, 0.39, 0.38, 0.37, 0.36, 0.35, 0.34, 0.33, 0.32, 0.31, 0.30, 0.29, 0.28, 0.27, 0.26, 0.25, 0.24, 0.23, 0.22, 0.21, 0.20, 0.19, 0.18, 0.17, 0.16, 0.15, 0.14, 0.13, 0.12, 0.11, 0.10, 0.095, 0.09, 0.085, 0.08, 0.075, 0.07, 0.065, 0.06, 0.05, 0.04, 0.03, 0.02, 0.01, 0.00]\n    solvent:\n      alchemical_path:\n        lambda_electrostatics: [1.00, 0.99, 0.98, 0.97, 0.96, 0.95, 0.94, 0.93, 0.92, 0.91, 0.90, 0.85, 0.80, 0.75, 0.70, 0.65, 0.60, 0.55, 0.50, 0.45, 0.40, 0.35, 0.30, 0.25, 0.20, 0.15, 0.10, 0.05, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.000, 0.00, 0.000, 0.00, 0.000, 0.00, 0.000, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00]\n        lambda_sterics:        [1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 0.99, 0.98, 0.97, 0.96, 0.95, 0.94, 0.93, 0.92, 0.91, 0.90, 0.89, 0.88, 0.87, 0.86, 0.85, 0.84, 0.83, 0.82, 0.81, 0.80, 0.79, 0.78, 0.77, 0.76, 0.75, 0.74, 0.73, 0.72, 0.71, 0.70, 0.69, 0.68, 0.67, 0.66, 0.65, 0.64, 0.63, 0.62, 0.61, 0.60, 0.59, 0.58, 0.57, 0.56, 0.55, 0.54, 0.53, 0.52, 0.51, 0.50, 0.49, 0.48, 0.47, 0.46, 0.45, 0.44, 0.43, 0.42, 0.41, 0.40, 0.39, 0.38, 0.37, 0.36, 0.35, 0.34, 0.33, 0.32, 0.31, 0.30, 0.29, 0.28, 0.27, 0.26, 0.25, 0.24, 0.23, 0.22, 0.21, 0.20, 0.19, 0.18, 0.17, 0.16, 0.15, 0.14, 0.13, 0.12, 0.11, 0.10, 0.095, 0.09, 0.085, 0.08, 0.075, 0.07, 0.065, 0.06, 0.05, 0.04, 0.03, 0.02, 0.01, 0.00]\n\nexperiments:\n  sampler: sams\n  system: prot-lig\n  protocol: dense-protocol\n  restraint:\n    type: Harmonic"
        return yank_yaml
    }

    getPrmFile(dock_name) {
        var prm_file = "RBT_PARAMETER_FILE_V1.00\n" +
            "TITLE " + dock_name + "\n" +
            "RECEPTOR_FILE /data/receptor.mol2\n" +
            "SECTION MAPPER\n" +
            "\tSITE_MAPPER RbtLigandSiteMapper\n" +
            "\tREF_MOL /data/reference_hydrogens.sdf\n" +
            "\tRADIUS 6.0\n" +
            "\tSMALL_SPHERE 1.0\n" +
            "\tMIN_VOLUME 100\n" +
            "\tMAX_CAVITIES 1\n" +
            "\tVOL_INCR 0.0\n" +
            "\tGRIDSTEP 0.5\n" +
            "END_SECTION\n" +
            "SECTION CAVITY\n" +
            "\tSCORING_FUNCTION RbtCavityGridSF\n" +
            "\tWEIGHT 1.0\n" +
            "END_SECTION\n" +
            "SECTION LIGAND\n" +
            "\tTRANS_MODE TETHERED\n" +
            "\tROT_MODE TETHERED\n" +
            "\tDIHEDRAL_MODE FREE\n" +
            "\tMAX_TRANS 1.0\n" +
            "\tMAX_ROT 20.0\n" +
            "END_SECTION"
        return prm_file
    }

    getDockingScript(constraint_smiles) {
        var docking_script = "/usr/bin/obabel -imol /data/reference.sdf -h -O /data/reference_hydrogens.sdf\n" +
            "/usr/bin/obabel -ismi /data/input.smi -h --gen3D -O /data/input_hydrogens.sdf\n" +
            "/usr/bin/obabel -ipdb /data/receptor.pdb -O /data/receptor.mol2\n" +
            '/rDock_2013.1_src/bin/sdtether /data/reference_hydrogens.sdf  /data/input_hydrogens.sdf /data/output.sdf "' + constrain_smiles + '"\n' +
            "/rDock_2013.1_src/bin/rbcavity -was -d -r /data/recep.prm\n" +
            "/rDock_2013.1_src/bin/rbdock -i /data/output.sdf -o /data/docked -r /data/recep.prm -p dock.prm -n 9"
        return docking_script
    }
}