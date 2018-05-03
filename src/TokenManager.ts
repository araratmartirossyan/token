import { Observable } from 'rxjs/Observable';
import { ReplaySubject } from 'rxjs/ReplaySubject';

import 'rxjs/add/observable/of';
import 'rxjs/add/observable/throw';
import 'rxjs/add/observable/fromPromise';
import 'rxjs/add/operator/take';
import 'rxjs/add/operator/retry';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/do';

import { TokenRefreshingError } from './TokenRefreshingError';
import { TokenRefresher } from './TokenRefresher';
import { TokenPair } from './TokenPair';
import { Observer } from 'rxjs/Observer';

export class TokenManager {

    private readonly tokenRefresher: TokenRefresher;
    private readonly onTokenPairRefreshed = new ReplaySubject<TokenPair>();
    private readonly onTokenPairRefreshingFailed = new ReplaySubject();

    private tokenPair: TokenPair;
    private isRefreshing: boolean = false;
    private isRefreshingFailed: boolean = false;

    constructor(tokenRefresher: TokenRefresher, tokenPair?: TokenPair) {
        this.tokenRefresher = tokenRefresher;
        this.tokenPair = tokenPair || { accessToken: '', refreshToken: '' };
    }

    updateTokens(tokenPair: TokenPair) {
        this.isRefreshingFailed = false;
        this.isRefreshing = false;

        this.tokenPair = tokenPair;
    }

    getTokens(): Observable<TokenPair> {
        if (this.isRefreshingFailed) {
            return this.refreshTokens();
        }

        if (this.isRefreshing) {
            return this.onTokenPairRefreshed
                .asObservable()
                .take(1);
        }

        return Observable.of(this.tokenPair);
    }

    onTokensRefreshed(): Observable<TokenPair> {
        return this.onTokenPairRefreshed.asObservable();
    }

    onTokensRefreshingFailed(): Observable<{}> {
        return this.onTokenPairRefreshingFailed.asObservable();
    }

    refreshTokens(): Observable<TokenPair> {
        if (!this.isRefreshingFailed && this.isRefreshing) {
            return this.onTokenPairRefreshed
                .asObservable()
                .take(1);
        }

        this.isRefreshing = true;
        this.isRefreshingFailed = false;

        return this.tokenRefresher(this.tokenPair)
            .retry(2)
            .catch(() => {
                this.isRefreshingFailed = true;

                const error = new TokenRefreshingError();
                this.onTokenPairRefreshingFailed.next({});

                return Observable.throw(error);
            })
            .do(tokens => this.onTokensRefreshingCompleted(tokens));
    }

    private onTokensRefreshingCompleted(tokenPair: TokenPair) {
        this.isRefreshingFailed = false;

        this.tokenPair = tokenPair;
        this.onTokenPairRefreshed.next(tokenPair);

        this.isRefreshing = false;
    }
}