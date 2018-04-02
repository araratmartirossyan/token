import { TokenPair } from './TokenPair';
export declare type TokenRefresher = (tokenPair: TokenPair) => Promise<TokenPair>;
