export const formatPrice = (price: number) => {
    return price > 1 ? price.toLocaleString() : price.toFixed(5);
};
