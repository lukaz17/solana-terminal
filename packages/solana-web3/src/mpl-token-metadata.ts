import {
	Metadata,
} from '@metaplex-foundation/mpl-token-metadata'
import {
	PublicKey,
	SendOptions,
	Transaction,
} from '@solana/web3.js'
import {
	createMetadataForFungibleTokenIx,
	deserializeMetadataAccount,
	findTokenMetadataAddress,
	updateMetadataForFungibleTokenIx,
} from '@local/spl-core'
import {
	Context
} from './context'

/**
 * Get and deserialize Metadata Account using its address.
 */
export async function getMetadataAccount(
	ctx: Context,
	tokenMetadata: PublicKey,
): Promise<Metadata | null> {
	const tokenMetadataAccInfo = await ctx.connection.getAccountInfo(tokenMetadata)
	if (tokenMetadataAccInfo === null) {
		return null
	}
	return deserializeMetadataAccount(tokenMetadataAccInfo.data)
}

/**
 * Get and deserialize Metadata Account using Token Mint address.
 */
export async function getMetadataAccountForTokenMint(
	ctx: Context,
	tokenMint: PublicKey,
): Promise<Metadata | null> {
	const tokenMetadata = findTokenMetadataAddress(tokenMint)
	return getMetadataAccount(ctx, tokenMetadata)
}

/**
 * Create or Update Metadata Account for a Fungible Token.
 */
export async function setMetadataForFungibleToken(
	ctx: Context,
	tokenMint: PublicKey,
	name: string,
	symbol: string,
	metadataUri: string,
	tokenMintAuthority: PublicKey,
	metadataUpdateAuthority: PublicKey,
	sendOptions?: SendOptions,
): Promise<string> {
	const tokenMetadataAccount = await getMetadataAccountForTokenMint(ctx, tokenMint)
	const transaction = new Transaction()
	if(tokenMetadataAccount === null) {
		transaction.add(createMetadataForFungibleTokenIx(
			tokenMint,
			name,
			symbol,
			metadataUri,
			tokenMintAuthority || ctx.signer.default(),
			metadataUpdateAuthority || ctx.signer.default(),
			ctx.signer.default(),
		))
	} else {
		transaction.add(updateMetadataForFungibleTokenIx(
			tokenMint,
			name,
			symbol,
			metadataUri,
			tokenMetadataAccount.updateAuthority,
			metadataUpdateAuthority || ctx.signer.default(),
		))
	}
	return ctx.signAndSendTransaction(transaction, sendOptions)
}
