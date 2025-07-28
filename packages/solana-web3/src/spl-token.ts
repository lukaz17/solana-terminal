import {
	TOKEN_MINT_SPAN,
	TOKEN_PROGRAM_ID,
	TokenAccount,
	TokenMint,
	createAssociatedTokenAccountIx,
	createTokenMintIx,
	deserializeTokenAccountAccount,
	deserializeTokenMintAccount,
	findAssociatedTokenAccountAddress,
} from '@local/spl-core'
import {
	Keypair,
	PublicKey,
	SendOptions,
	Transaction,
} from '@solana/web3.js'
import {
	Context,
} from './context'
import {
	createAccountIx,
} from './system'

/**
 * Create an Associated Token Account of a Token Mint for spcecified Owner.
 */
export async function createAssociatedTokenAccount(
	ctx: Context,
	tokenMint: PublicKey,
	owner: PublicKey,
	sendOptions?: SendOptions,
): Promise<string> {
	const transaction = new Transaction()
	transaction.add(createAssociatedTokenAccountIx(
		tokenMint,
		owner,
		ctx.defaultSigner,
	))
	const txSig = await ctx.signAndSendTransaction(transaction, sendOptions)
	const associatedTokenAccount = findAssociatedTokenAccountAddress(
		tokenMint,
		owner,
	)
	console.debug(`Created Associated Token Account ${associatedTokenAccount}: ${txSig}`)
	return txSig
}

/**
 * Create new Token Mint Account.
 */
export async function createTokenMint(
	ctx: Context,
	tokenMintKeypair: Keypair,
	decimals: number = 6,
	sendOptions?: SendOptions,
): Promise<string> {
	const transaction = new Transaction()
	transaction.add(await createAccountIx(
		ctx,
		tokenMintKeypair.publicKey,
		TOKEN_MINT_SPAN,
		TOKEN_PROGRAM_ID,
	))
	transaction.add(createTokenMintIx(
		tokenMintKeypair.publicKey,
		decimals,
		ctx.signer.default(),
		null,
	))
	await ctx.setLatestBlockhash(transaction)
	transaction.feePayer = ctx.defaultSigner
	transaction.sign(tokenMintKeypair)
	const txSig = await ctx.signAndSendTransaction(transaction, sendOptions)
	console.debug(`Created Token Mint ${tokenMintKeypair.publicKey}: ${txSig}`)
	return txSig
}

/**
 * Get and deserialize Token Account Account using its address.
 */
export async function getTokenAccountAccount(
	ctx: Context,
	tokenAccount: PublicKey
): Promise<TokenAccount | null> {
	const tokenAccountAccInfo = await ctx.connection.getAccountInfo(tokenAccount)
	if (tokenAccountAccInfo === null) {
		return null
	}
	const tokenAccountAccount = deserializeTokenAccountAccount(tokenAccountAccInfo.data)
	tokenAccountAccount.address = tokenAccount
	return tokenAccountAccount
}


/**
 * Get and deserialize Token Mint Account using its address.
 */
export async function getTokenMintAccount(
	ctx: Context,
	tokenMint: PublicKey
): Promise<TokenMint | null> {
	const tokenMintAccInfo = await ctx.connection.getAccountInfo(tokenMint)
	if (tokenMintAccInfo === null) {
		return null
	}
	const tokenMintAccount = deserializeTokenMintAccount(tokenMintAccInfo.data)
	tokenMintAccount.address = tokenMint
	return tokenMintAccount
}
