export class BalanceTable {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
    }

    render(balances) {
        if (!balances || balances.length === 0) {
            this.container.innerHTML = '<p>Aucun solde disponible.</p>';
            return;
        }

        let tableHTML = `
            <table class="table table-striped">
                <thead>
                    <tr>
                        <th>Actif</th>
                        <th>Solde libre</th>
                        <th>Solde bloqué</th>
                    </tr>
                </thead>
                <tbody>
        `;

        balances.forEach(balance => {
            tableHTML += `
                <tr>
                    <td>${balance.asset}</td>
                    <td>${parseFloat(balance.free).toFixed(8)}</td>
                    <td>${parseFloat(balance.locked).toFixed(8)}</td>
                </tr>
            `;
        });

        tableHTML += '</tbody></table>';
        this.container.innerHTML = tableHTML;
    }
}