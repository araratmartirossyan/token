"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Observable_1 = require("rxjs/Observable");
const ReplaySubject_1 = require("rxjs/ReplaySubject");
require("rxjs/add/observable/of");
require("rxjs/add/observable/throw");
require("rxjs/add/observable/fromPromise");
require("rxjs/add/operator/take");
require("rxjs/add/operator/retry");
require("rxjs/add/operator/catch");
require("rxjs/add/operator/do");
const TokenRefreshingError_1 = require("./TokenRefreshingError");
class TokenManager {
    constructor(tokenRefresher, tokenPair) {
        this.onTokensRefreshed = new ReplaySubject_1.ReplaySubject();
        this.isRefreshing = false;
        this.isRefreshingFailed = false;
        this.tokenRefresher = tokenRefresher;
        this.tokenPair = tokenPair || { accessToken: '', refreshToken: '' };
    }
    updateTokens(tokenPair) {
        this.isRefreshingFailed = false;
        this.isRefreshing = false;
        this.tokenPair = tokenPair;
    }
    getTokens() {
        if (this.isRefreshingFailed) {
            return this.refreshTokens();
        }
        if (this.isRefreshing) {
            return this.onTokensRefreshed
                .asObservable()
                .take(1);
        }
        return Observable_1.Observable.of(this.tokenPair);
    }
    refreshTokens() {
        if (!this.isRefreshingFailed && this.isRefreshing) {
            return this.onTokensRefreshed
                .asObservable()
                .take(1);
        }
        this.isRefreshing = true;
        this.isRefreshingFailed = false;
        const tokenPair = this.tokenPair;
        const tokenRefresher = Observable_1.Observable.create((observer) => {
            this.tokenRefresher(tokenPair)
                .then(tokenPair => observer.next(tokenPair))
                .catch(error => observer.error(error));
        });
        return tokenRefresher
            .retry(2)
            .catch(() => {
            this.isRefreshingFailed = true;
            return Observable_1.Observable.throw(new TokenRefreshingError_1.TokenRefreshingError());
        })
            .do(tokens => this.onTokensRefreshingCompleted(tokens));
    }
    onTokensRefreshingCompleted(tokenPair) {
        this.isRefreshingFailed = false;
        this.tokenPair = tokenPair;
        this.onTokensRefreshed.next(tokenPair);
        this.isRefreshing = false;
    }
}
exports.TokenManager = TokenManager;
//# sourceMappingURL=TokenManager.js.map