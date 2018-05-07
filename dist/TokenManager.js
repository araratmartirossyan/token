"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Observable_1 = require("rxjs/Observable");
const RxTokenManager_1 = require("./RxTokenManager");
class TokenManager {
    constructor(tokenRefresher, tokenPair) {
        const rxTokenRefresher = (tokenPair) => {
            return Observable_1.Observable.create((observer) => {
                tokenRefresher(tokenPair)
                    .then((pair) => {
                    observer.next(pair);
                })
                    .catch(error => {
                    observer.error(error);
                });
            });
        };
        this.tokenManager = new RxTokenManager_1.RxTokenManager(rxTokenRefresher, tokenPair);
    }
    updateTokens(tokenPair) {
        this.tokenManager.updateTokens(tokenPair);
    }
    getTokens() {
        return new Promise((resolve, reject) => {
            this.tokenManager
                .getTokens()
                .subscribe(resolve, reject);
        });
    }
    onTokensRefreshingFailed() {
        return new Promise(resolve => {
            this.tokenManager
                .onTokensRefreshingFailed()
                .subscribe(resolve);
        });
    }
    refreshTokens() {
        return new Promise((resolve, reject) => {
            this.tokenManager
                .refreshTokens()
                .subscribe(resolve, reject);
        });
    }
}
exports.TokenManager = TokenManager;
//# sourceMappingURL=TokenManager.js.map