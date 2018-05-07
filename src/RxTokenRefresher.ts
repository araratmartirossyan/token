import { Observable } from 'rxjs/Observable';
import { TokenPair } from './TokenPair';

export type RxTokenRefresher =
    (tokenPair: TokenPair) => Observable<TokenPair>;
