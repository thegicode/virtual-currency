export const formatPrice = (price: number) => {
    if (!price) return 0;
    return price > 1 ? price.toLocaleString() : price.toFixed(5);
};
