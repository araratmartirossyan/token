import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';
import { RxTokenManager } from './RxTokenManager';
import { TokenPair } from './TokenPair';
import { TokenRefresher } from './TokenRefresher';

export class TokenManager {

    private readonly tokenManager: RxTokenManager;

    constructor(tokenRefresher: TokenRefresher, tokenPair?: TokenPair) {
        const rxTokenRefresher = (tokenPair: TokenPair) => {
            return Observable.create((observer: Observer<TokenPair>) => {
                tokenRefresher(tokenPair)
                    .then((pair) => {
                        observer.next(pair);
                    })
                    .catch(error => {
                        observer.error(error);
                    });
            });
        };

        this.tokenManager = new RxTokenManager(rxTokenRefresher, tokenPair);
    }

    updateTokens(tokenPair: TokenPair) {
        this.tokenManager.updateTokens(tokenPair);
    }

    getTokens(): Promise<TokenPair> {
        return new Promise<TokenPair>((resolve, reject) => {
            this.tokenManager
                .getTokens()
                .subscribe(resolve, reject);
        });
    }

    onTokensRefreshingFailed(): Promise<{}> {
        return new Promise(resolve => {
            this.tokenManager
                .onTokensRefreshingFailed()
                .subscribe(resolve);
        });
    }

    refreshTokens(): Promise<TokenPair> {
       return new Promise<TokenPair>((resolve, reject) => {
           this.tokenManager
               .refreshTokens()
               .subscribe(resolve, reject);
       });
    }
}