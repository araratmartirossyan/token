import { Observable } from 'rxjs/Observable';
import { TokenPair } from './TokenPair';
export declare type TokenRefresher = (tokenPair: TokenPair) => Observable<TokenPair>;
