import { TokenPair } from './TokenPair';
import { TokenRefresher } from './TokenRefresher';
export declare class TokenManager {
    private readonly tokenManager;
    constructor(tokenRefresher: TokenRefresher, tokenPair?: TokenPair);
    updateTokens(tokenPair: TokenPair): void;
    getTokens(): Promise<TokenPair>;
    onTokensRefreshingFailed(): Promise<{}>;
    refreshTokens(): Promise<TokenPair>;
}
