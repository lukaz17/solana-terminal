import {
	PublicKey
} from '@solana/web3.js';
import {
	ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID,
	TOKEN_PROGRAM_ID
} from './constants';


/**
 * Find derived address for Associated Token account of a Token Mint.
 */
export function findAssociatedTokenAddress(
	owner: PublicKey,
	tokenMint: PublicKey,
): PublicKey {
	const [address,] = PublicKey.findProgramAddressSync(
		[
			owner.toBuffer(),
			TOKEN_PROGRAM_ID.toBuffer(),
			tokenMint.toBuffer(),
		],
		ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID
	);
	return address
}
