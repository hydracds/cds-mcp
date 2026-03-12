export interface TrendingToken {
  policyId: string;
  assetName: string;
  assetNameHex: string;
  nameHex?: string;
  price: number;
  volume: number;
  decimals: number;
  isVerified?: boolean;
  isverified?: boolean;
  is_snekdotfun?: boolean;
  snekdotfun_logoid?: string;
}

export interface TokenListItem {
  policyId: string;
  assetName: string;
  assetNameHex: string;
  nameHex?: string;
  decimals: number;
  price?: number;
  isVerified?: boolean;
  isverified?: boolean;
  is_snekdotfun?: boolean;
  snekdotfun_logoid?: string;
}

export interface AdaPriceData {
  adaPrice: {
    value: {
      price: number;
    };
  };
}

export interface OtcOffer {
  id: string;
  orderMode: "Buy" | "Sell";
  seller: string;
  tokenOffered: string;
  tokenOfferedPolicyId: string;
  tokenOfferedAssetNameHex: string;
  tokenOfferedAmount: number;
  price: number;
  requestedToken: string;
  requestedTokenPolicyId?: string;
  requestedTokenAssetNameHex?: string;
  requestedTokenAmount: number;
  status: "Active" | "Completed" | "Cancelled" | "Expired";
  createdAt: string;
  expiresAt?: string;
  allowPartial: boolean;
  filledAmount?: number;
}

export interface PendingOrder {
  status: string;
  [key: string]: any;
}

export interface Trade {
  tradeType: string;
  policyId: string;
  assetName: string;
  assetNameHex: string;
  amount: string;
  oldPrice: string;
  newPrice: string;
  dexName: string;
  maker: string;
  tx_datetime: number;
  isVerified: boolean;
}
