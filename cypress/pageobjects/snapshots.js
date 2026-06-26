import General from './general.js';

const generalObj = new General();

class Snapshots {
  elements = {
    waiting: () => cy.wait(3000),
    createSnapshotButton: () => cy.get('#new-snapshot-button-id'),
    renameSnapshotButton: () => cy.get('button.MuiButton-containedPrimary'),
    updateSnapshotButton: () =>
      cy.get(':nth-child(1) > .MuiPaper-root > .jss224 > :nth-child(3) > .MuiButtonBase-root > .MuiButton-label'),
    snapshotNameInput: () => cy.get('[name="name"]'),
    submitButton: () => cy.get('.MuiGrid-justify-content-xs-flex-end > :nth-child(2) > .MuiButtonBase-root > .MuiButton-label'),
    shareSnapshotButton: () => cy.get('#header-share-button')
  };

  createSnapshot() {
    generalObj.performTargetSelection();
    this.elements.createSnapshotButton().click();
    generalObj.checkPopupMessage('Snapshot was successfully created');
  }

  renameSnapshot() {
    generalObj.performTargetSelection();
    this.elements.renameSnapshotButton().first().click();
    this.elements.snapshotNameInput().clear().type('Renamed Snapshot');
    this.elements.submitButton().click();
    generalObj.checkPopupMessage('Snapshot saved successfully');
  }

  updateSnapshot() {
    this.elements.updateSnapshotButton().first().click();
    generalObj.checkPopupMessage('Snapshot was successfully updated');
  }

  shareSnapshot() {
    generalObj.performTargetSelection();
    cy.window().then(win => {
      cy.stub(win.navigator.clipboard, 'writeText').as('clipboardWrite');
    });
    this.elements.shareSnapshotButton().click();
    generalObj.checkPopupMessage('Snapshot URL was copied to your clipboard.');
    cy.get('@clipboardWrite').should('have.been.called');
  }
}

export default Snapshots;
