export const formatPrice = (price: number) => {
    if (!price) return 0;
    return price > 1 ? Math.round(price).toLocaleString() : price.toFixed(5);
};
