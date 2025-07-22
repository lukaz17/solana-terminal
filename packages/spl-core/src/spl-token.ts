import {
	ACCOUNT_SIZE,
	ACCOUNT_TYPE_SIZE,
	Account,
	AccountLayout,
	AccountState,
	MINT_SIZE,
	Mint,
	MintLayout,
	createAssociatedTokenAccountInstruction,
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
 * Create a Create Associated Token Account instruction.
 */
export function createAssociatedTokenAccountIx(
	tokenMint: PublicKey,
	owner: PublicKey,
	payer: PublicKey,
): TransactionInstruction {
	const associatedTokenAccount = findAssociatedTokenAccountAddress(
		tokenMint,
		owner,
	)
	return createAssociatedTokenAccountInstruction(
		payer,
		associatedTokenAccount,
		owner,
		tokenMint,
		TOKEN_PROGRAM_ID,
		ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID,
	)
}

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
 * Deserialize account data into Token Account object.
 */
export function deserializeTokenAccountAccount(
	data: Buffer,
): Account {
	const rawAccount = AccountLayout.decode(data)
	let tlvData = Buffer.alloc(0)
	if (data.length > ACCOUNT_SIZE) {
		tlvData = data.slice(ACCOUNT_SIZE + ACCOUNT_TYPE_SIZE)
	}
	return <Account>{
		mint: rawAccount.mint,
		owner: rawAccount.owner,
		amount: rawAccount.amount,
		delegate: rawAccount.delegateOption ? rawAccount.delegate : null,
		delegatedAmount: rawAccount.delegatedAmount,
		isInitialized: rawAccount.state !== AccountState.Uninitialized,
		isFrozen: rawAccount.state === AccountState.Frozen,
		isNative: !!rawAccount.isNativeOption,
		rentExemptReserve: rawAccount.isNativeOption ? rawAccount.isNative : null,
		closeAuthority: rawAccount.closeAuthorityOption ? rawAccount.closeAuthority : null,
		tlvData,
	}
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
	tokenMint: PublicKey,
	owner: PublicKey,
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
