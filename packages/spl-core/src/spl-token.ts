import {
	ACCOUNT_SIZE,
	ACCOUNT_TYPE_SIZE,
	MINT_SIZE,
	Mint,
	MintLayout,
	createInitializeMintInstruction,
} from '@solana/spl-token'
import {
	PublicKey,
	TransactionInstruction,
} from '@solana/web3.js'
import {
	ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID,
	TOKEN_PROGRAM_ID,
} from './constants'

/**
 * Create a InitializeMint instruction.
 */
export function createTokenMintIx(
	tokenMint: PublicKey,
	decimals: number,
	mintAuthority: PublicKey,
	freezeAuthority: PublicKey | null
): TransactionInstruction {
	return createInitializeMintInstruction(
		tokenMint,
		decimals,
		mintAuthority,
		freezeAuthority
	)
}

/**
 * Deserialize account data into Token Mint object.
 */
export function deserializeTokenMintAccount(
	data: Buffer
): Mint {
	const rawMint = MintLayout.decode(data)
	let tlvData = Buffer.alloc(0)
	if (data.length > MINT_SIZE) {
		tlvData = data.slice(ACCOUNT_SIZE + ACCOUNT_TYPE_SIZE)
	}

	return <Mint>{
		mintAuthority: rawMint.mintAuthorityOption ? rawMint.mintAuthority : null,
		supply: rawMint.supply,
		decimals: rawMint.decimals,
		isInitialized: rawMint.isInitialized,
		freezeAuthority: rawMint.freezeAuthorityOption ? rawMint.freezeAuthority : null,
		tlvData,
	}
}

/**
 * Find derived address for Associated Token account of a Token Mint.
 */
export function findAssociatedTokenAccountAddress(
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
	)
	return address
}
