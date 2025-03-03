class FavoriteService {
    constructor() {
        this.favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    }

    getFavorites() {
        return this.favorites;
    }

    addFavorite(symbol) {
        if (!this.favorites.includes(symbol)) {
            this.favorites.push(symbol);
            this.saveFavorites();
        }
    }

    removeFavorite(symbol) {
        const index = this.favorites.indexOf(symbol);
        if (index > -1) {
            this.favorites.splice(index, 1);
            this.saveFavorites();
        }
    }

    isFavorite(symbol) {
        return this.favorites.includes(symbol);
    }

    saveFavorites() {
        localStorage.setItem('favorites', JSON.stringify(this.favorites));
    }
}

export const favoriteService = new FavoriteService();