import {
	TOKEN_MINT_SPAN,
	TOKEN_PROGRAM_ID,
	TokenMint,
	createTokenMintIx,
	deserializeTokenMintAccount,
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
	transaction.feePayer = ctx.signer.default()
	transaction.partialSign(tokenMintKeypair)
	return ctx.signAndSendTransaction(transaction, sendOptions)
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
