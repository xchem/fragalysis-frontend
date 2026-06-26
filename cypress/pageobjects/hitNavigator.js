class HitNavigator {
  elements = {
    allButton: () => cy.get('#detail-view-all-1'),
    ligandButton: () => cy.get('#detail-view-ligand-1'),
    sidechainsButton: () => cy.get('#detail-view-sidechains-1'),
    interactionsButton: () => cy.get('#detail-view-interactions-1')
  };

  checkedButton(button) {
    button().should('have.css', 'background-color', 'rgb(63, 81, 181)');
  }

  uncheckedButton(button) {
    button().should('have.css', 'background-color', 'rgb(197, 202, 233)');
  }

  mediumcheckedButton(button) {
    button().should('have.css', 'background-color', 'rgb(121, 134, 203)');
  }

  clickAllButton() {
    this.elements.allButton().should('be.visible').click();
    this.checkedButton(this.elements.allButton);
  }

  clickLigandButton() {
    this.elements.ligandButton().should('be.visible').click();
    this.checkedButton(this.elements.ligandButton);
  }

  clickSidechainsButton() {
    this.elements.sidechainsButton().should('be.visible').click();
    this.checkedButton(this.elements.sidechainsButton);
  }

  clickInteractionsButton() {
    this.elements.interactionsButton().should('be.visible').click();
    this.checkedButton(this.elements.interactionsButton);
  }
}

export default HitNavigator;
