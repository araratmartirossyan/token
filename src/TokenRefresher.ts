import { Observable } from 'rxjs/Observable';
import { TokenPair } from './TokenPair';

export type TokenRefresher =
    (tokenPair: TokenPair) => Promise<TokenPair>;
