import { calculatePrice } from './pricingAlgorithm';

export const computePricing = ({ domains = [], users = 1, addons = [], profile = 'mainteneur' } = {}) => {
  const result = calculatePrice(domains, users, addons, profile);

  return {
    basePrice: result.basePrice,
    addonsTotal: result.addonsTotal,
    totalPrice: result.finalPrice,
    discount: result.discount,
  };
};
