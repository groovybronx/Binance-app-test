// public/js/services/accountService.js
export class AccountService {
    constructor() {
        
    }

    /**
     * Filters and returns only the balances for USDT pairs with a positive free or locked balance.
     * @param {Object} accountInfo - The account information object containing balances.
     * @returns {Array<Object>} An array of USDT balances with positive free or locked amounts.
     */
    getUsdtBalances(accountInfo) {
        if (!accountInfo || !accountInfo.balances) {
            return [];
        }
        return accountInfo.balances.filter(balance =>
            balance.asset.endsWith('USDT') && (parseFloat(balance.free) > 0 || parseFloat(balance.locked) > 0)
        );
    }

    /**
     * Fetches data for a given asset symbol from the API.
     *
     * @param {string} symbol - The symbol of the asset to fetch data for.
     * @returns {Promise<Object>} A promise that resolves to the asset's data.
     */
     async fetchAssetData(symbol) {
        try {
            const response = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${symbol}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            return data;
        } catch (error) {
            console.error(`Error fetching data for ${symbol}:`, error);
            throw error;
        }
    }

}
