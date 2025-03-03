//public/js/utils.js
/**
 * Updates the display of a crypto's variation in a table row.
 *
 * @param {HTMLElement} variationCell - The cell element displaying the variation.
 * @param {string} priceChangePercent - The percentage change in price.
 */
 export function updateVariationCellStyle(variationCell, priceChangePercent) {
    variationCell.textContent = `${priceChangePercent}%`;
    if (parseFloat(priceChangePercent) > 0) {
        variationCell.classList.add('positive');
        variationCell.classList.remove('negative');
    } else if (parseFloat(priceChangePercent) < 0) {
        variationCell.classList.add('negative');
        variationCell.classList.remove('positive');
    } else {
        variationCell.classList.remove('positive', 'negative');
    }
}
