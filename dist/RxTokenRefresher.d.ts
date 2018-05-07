import { Observable } from 'rxjs/Observable';
import { TokenPair } from './TokenPair';
export declare type RxTokenRefresher = (tokenPair: TokenPair) => Observable<TokenPair>;
