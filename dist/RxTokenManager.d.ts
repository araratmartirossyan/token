import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/throw';
import 'rxjs/add/observable/fromPromise';
import 'rxjs/add/operator/take';
import 'rxjs/add/operator/retry';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/do';
import { RxTokenRefresher } from './RxTokenRefresher';
import { TokenPair } from './TokenPair';
export declare class RxTokenManager {
    private readonly tokenRefresher;
    private readonly onTokenPairRefreshed;
    private readonly onTokenPairRefreshingFailed;
    private tokenPair;
    private isRefreshing;
    private isRefreshingFailed;
    constructor(tokenRefresher: RxTokenRefresher, tokenPair?: TokenPair);
    updateTokens(tokenPair: TokenPair): void;
    getTokens(): Observable<TokenPair>;
    onTokensRefreshed(): Observable<TokenPair>;
    onTokensRefreshingFailed(): Observable<{}>;
    refreshTokens(): Observable<TokenPair>;
    private onTokensRefreshingCompleted(tokenPair);
}
