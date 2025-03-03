import { BalanceTable } from '../components/BalanceTable.js';

class AccountService {
    constructor() {
        this.balanceTable = new BalanceTable('balanceTableBody');
    }

    async fetchAccountInfo() {
        try {
            const response = await fetch('/api/account/info');
            if (!response.ok) throw new Error('Erreur lors de la récupération des informations du compte');
            const accountInfo = await response.json();
            this.displayAccountBalances(accountInfo.balances);
        } catch (error) {
            console.error('Erreur:', error);
            document.getElementById('balancesErrorMessage').textContent = 'Erreur lors de la récupération des soldes.';
        }
    }

    displayAccountBalances(balances) {
        const filteredBalances = balances.filter(balance => parseFloat(balance.free) > 0 || parseFloat(balance.locked) > 0);
        this.balanceTable.render(filteredBalances);
    }
}

export const accountService = new AccountService();