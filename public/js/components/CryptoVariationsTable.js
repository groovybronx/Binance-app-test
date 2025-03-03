export class CryptoVariationsTable {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.rows = new Map();
    }

    updateOrAddRow(symbol, priceChangePercent, lastPrice) {
        let row = this.rows.get(symbol);
        if (!row) {
            row = this.createRow(symbol);
            this.rows.set(symbol, row);
            this.container.appendChild(row);
        }

        const variationCell = row.querySelector('.variation-cell');
        const priceCell = row.querySelector('.price-cell');

        variationCell.textContent = `${parseFloat(priceChangePercent).toFixed(2)}%`;
        variationCell.className = 'variation-cell ' + (parseFloat(priceChangePercent) > 0 ? 'positive' : 'negative');
        priceCell.textContent = `${parseFloat(lastPrice).toFixed(2)} USDT`;
    }

    createRow(symbol) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="symbol-cell">${symbol}</td>
            <td class="variation-cell"></td>
            <td class="price-cell"></td>
            <td class="info-icon-cell">
                <span class="info-icon" title="Voir les informations détaillées">
                    <i class="fas fa-eye"></i>
                </span>
            </td>
        `;
        row.querySelector('.info-icon').addEventListener('click', () => window.displayAssetInfoPage(symbol));
        return row;
    }

    clear() {
        this.container.innerHTML = '';
        this.rows.clear();
    }
}