import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';

import 'rxjs/add/observable/combineLatest';
import 'rxjs/add/observable/timer';
import 'rxjs/add/observable/empty';

import { TokenRefreshingError } from '../TokenRefreshingError';
import { TokenManager } from '../TokenManager';
import { TokenPair } from '../TokenPair';
import { EmptyObservable } from 'rxjs/Observable/EmptyObservable';

describe('Token Manager', () => {

    const emptyTokenRefresher = () => new Observable<TokenPair>(undefined);

    it('Initial tokens must be empty', (done) => {
        const tokenManager = new TokenManager(emptyTokenRefresher);

        tokenManager.getTokens()
            .subscribe(tokens => {
                expect(tokens.accessToken).toEqual('');
                expect(tokens.refreshToken).toEqual('');
                done();
            });
    });

    it('Check intialization with tokens', (done) => {
        const accessToken = '234jk3458234lj3459435';
        const refreshToken = 'dsklflshsd2344328324j';

        const tokenManager = new TokenManager(emptyTokenRefresher, { accessToken, refreshToken });

        tokenManager.getTokens()
            .subscribe(tokens => {
                expect(tokens.accessToken).toEqual(accessToken);
                expect(tokens.refreshToken).toEqual(refreshToken);
                done();
            });
    });

    it('Check updating tokens', (done) => {
        const tokenManager = new TokenManager(emptyTokenRefresher);

        const accessToken = '234jk3458234lj3459435';
        const refreshToken = 'dsklflshsd2344328324j';

        tokenManager.updateTokens({ accessToken, refreshToken });

        tokenManager.getTokens()
            .subscribe(tokens => {
                expect(tokens.accessToken).toEqual(accessToken);
                expect(tokens.refreshToken).toEqual(refreshToken);
                done();
            });
    });

    it('Check tokens on refreshing (must return refreshed token after starting refreshing process)', (done) => {
        const refreshedAccessToken = 'jhauenw22355345s';
        const refreshedRefreshToken = 'sdjfwer8q990wwerl';

        const tokenRefresher = () => new Observable<TokenPair>((observer) => {
            setInterval(() => {
                observer.next({ accessToken: refreshedAccessToken, refreshToken: refreshedRefreshToken });
            }, 0.2);
        });

        const initialAccessToken = '234jk3458234lj3459435';
        const initialRefreshToken = 'dsklflshsd2344328324j';

        const tokenManager = new TokenManager(tokenRefresher, {
            accessToken: initialAccessToken,
            refreshToken: initialRefreshToken,
        });

        tokenManager.refreshTokens()
            .subscribe();

        tokenManager.getTokens()
            .subscribe(tokens => {
                expect(tokens.accessToken).toEqual(refreshedAccessToken);
                expect(tokens.refreshToken).toEqual(refreshedRefreshToken);
                done();
            });
    });

    it('Should repeat token refreshing on fail', (done) => {
        const refreshedAccessToken = 'jhauenw22355345s';
        const refreshedRefreshToken = 'sdjfwer8q990wwerl';

        const counter = { refreshingCount: 0 };

        const tokenRefresher = () => new Observable<TokenPair>((observer) => {
            Observable
                .timer(0.1)
                .subscribe(() => {
                    if (counter.refreshingCount >= 1) {
                        counter.refreshingCount++;

                        observer.next({ accessToken: refreshedAccessToken, refreshToken: refreshedRefreshToken });
                        observer.complete();
                    } else {
                        counter.refreshingCount++;
                        observer.error('Error on refreshing tokens');
                    }
                });
        });

        const tokenManager = new TokenManager(tokenRefresher);

        tokenManager.refreshTokens()
            .subscribe();

        tokenManager.getTokens()
            .subscribe(tokens => {
                expect(tokens.accessToken).toEqual(refreshedAccessToken);
                expect(tokens.refreshToken).toEqual(refreshedRefreshToken);
                done();
            });
    });

    it('Should return same tokens on multiple refrefing requests', (done) => {
        const randomToken = () => uuid() as string;

        const tokenRefresher = () => new Observable<TokenPair>(observer => {
            setInterval(() => {
                observer.next({ accessToken: randomToken(), refreshToken: randomToken() });
            }, 0.2);
        });

        const tokenManager = new TokenManager(tokenRefresher);

        tokenManager.refreshTokens().subscribe();
        tokenManager.refreshTokens().subscribe();
        tokenManager.refreshTokens().subscribe();

        const request1 = tokenManager.getTokens();
        const request2 = tokenManager.getTokens();
        const request3 = tokenManager.getTokens();

        Observable
            .combineLatest(request1, request2, request3)
            .subscribe((tokenGroups: TokenPair[]) => {

                const [tokenPair1, tokenPair2, tokenPair3] = tokenGroups;

                const isAccessTokensEquals =
                    (tokenPair1.accessToken === tokenPair2.accessToken) &&
                    (tokenPair2.accessToken === tokenPair3.accessToken);

                const isRefreshTokenEquals =
                    (tokenPair1.refreshToken === tokenPair2.refreshToken) &&
                    (tokenPair2.refreshToken === tokenPair3.refreshToken);

                expect(isAccessTokensEquals).toEqual(true);
                expect(isRefreshTokenEquals).toEqual(true);

                done();
            });
    });

    it('Should return same tokens for already running request', () => {
        const refreshedAccessToken = 'jhauenw22355345s';
        const refreshedRefreshToken = 'sdjfwer8q990wwerl';

        const tokenRefresher = () => new Observable<TokenPair>((observer) => {
            setInterval(() => {
                observer.next({ accessToken: refreshedAccessToken, refreshToken: refreshedRefreshToken });
            }, 0.2);
        });

        const updatedAccessToken = 'dfkflhr234sgdg';
        const updatedRefreshToken = 'uaadfbndsvl36vd';

        const tokenManager = new TokenManager(tokenRefresher);

        tokenManager.refreshTokens()
            .subscribe(tokens => {
                expect(tokens.accessToken).toEqual(refreshedAccessToken);
                expect(tokens.refreshToken).toEqual(refreshedRefreshToken);
            });

        tokenManager.updateTokens({ accessToken: updatedAccessToken, refreshToken: updatedRefreshToken });
    });

    it('Should throw Token Refreshing Error if server unavailable', (done) => {
        const tokenRefresher = () => new Observable<TokenPair>((observer) => {
            observer.error('Server unavailable');
        });

        const tokenManager = new TokenManager(tokenRefresher);

        tokenManager.refreshTokens()
            .subscribe(undefined, error => {
                expect(error instanceof TokenRefreshingError).toBeTruthy();
                done();
            });
    });
});

const uuid = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        // tslint:disable-next-line:no-bitwise
        const r = Math.random() * 16 | 0;
        // tslint:disable-next-line:no-bitwise
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};
