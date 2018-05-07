import { TokenPair } from './TokenPair';

export type TokenRefresher =
    (tokenPair: TokenPair) => Promise<TokenPair>;
