// public/js/services/favoriteService.js
class FavoriteService {
    constructor() {
    }

    /**
     * Retrieves the list of favorite symbols from local storage.
     *
     * @returns {Array<string>} An array of favorite symbols.
     */
    getFavorites() {
        const favorites = localStorage.getItem('favorites');
        return favorites ? JSON.parse(favorites) : [];
    }

    /**
     * Checks if a given symbol is in the list of favorites.
     *
     * @param {string} symbol - The symbol to check.
     * @returns {boolean} True if the symbol is a favorite, false otherwise.
     */
    isFavorite(symbol) {
        return this.getFavorites().includes(symbol);
    }

    /**
     * Adds a symbol to the list of favorites.
     *
     * @param {string} symbol - The symbol to add.
     */
    addFavorite(symbol) {
        const favorites = this.getFavorites();
        if (!favorites.includes(symbol)) {
            favorites.push(symbol);
            localStorage.setItem('favorites', JSON.stringify(favorites));
        }
    }

    /**
     * Removes a symbol from the list of favorites.
     *
     * @param {string} symbol - The symbol to remove.
     */
    removeFavorite(symbol) {
        let favorites = this.getFavorites();
        favorites = favorites.filter(fav => fav !== symbol);
        localStorage.setItem('favorites', JSON.stringify(favorites));
    }

    /**
     * Clears all the favorites from the local storage.
     */
    clearFavorites() {
        localStorage.removeItem('favorites');
    }

    /**
     * Limits the amount of favorite at 10
     * @returns {array} the array limit to 10
     */
    getLimitedFavorites(){
        return this.getFavorites().slice(0, 10);
    }
}

export const favoriteService = new FavoriteService();
