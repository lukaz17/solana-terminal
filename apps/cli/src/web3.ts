import {
	Context,
	createAssociatedTokenAccount,
	createTokenMint,
	getMetadataAccountForTokenMint,
	getTokenAccountAccount,
	getTokenMintAccount,
	KeypairsSigner,
	mintToken,
	setMetadataForFungibleToken,
} from '@local/solana-web3'
import {
	findAssociatedTokenAccountAddress,
	findTokenMetadataAddress,
} from '@local/spl-core'
import {
	Connection,
	Keypair,
	PublicKey,
} from '@solana/web3.js'
import fs from 'fs'

/**
 * Initialize a Context using solana CLI keypair.
 */
export function createLocalContext(
	keypairFile: string = '~/.config/solana/id.json',
	rpcUrl: string = 'https://api.devnet.solana.com/',
): Context {
	const connection = new Connection(rpcUrl, 'finalized')
	const defaultKeypairStr = fs.readFileSync(keypairFile, { encoding: 'utf8' })
	const defaultKeypairBuf = Buffer.from(JSON.parse(defaultKeypairStr))
	const signer = new KeypairsSigner([
		Keypair.fromSecretKey(defaultKeypairBuf)
	])
	return new Context(connection, signer)
}


export async function exeCreateAssociatedTokenAccount(
	ctx: Context,
	tokenMint: PublicKey,
	owner: PublicKey,
): Promise<void> {
	const associatedTokenAccount = findAssociatedTokenAccountAddress(tokenMint, owner)
	let associatedTokenAccountAccount = await getTokenAccountAccount(ctx, associatedTokenAccount)
	if (associatedTokenAccountAccount === null) {
		await createAssociatedTokenAccount(
			ctx,
			tokenMint,
			owner,
			undefined,
		)
		associatedTokenAccountAccount = await getTokenAccountAccount(ctx, associatedTokenAccount)
	}
	console.debug(`Associated Token Account ${associatedTokenAccount.toBase58()} data`)
	console.debug(associatedTokenAccountAccount)
}

export async function exeCreateTokenMint(
	ctx: Context,
	tokenMintKeypair: Keypair,
): Promise<void> {
	const tokenMint = tokenMintKeypair.publicKey
	let tokenMintAcccount = await getTokenMintAccount(ctx, tokenMint)
	if (tokenMintAcccount === null) {
		await createTokenMint(
			ctx,
			tokenMintKeypair,
			6,
			undefined
		)
		tokenMintAcccount = await getTokenMintAccount(ctx, tokenMint)
	}
	console.debug(`Token Mint ${tokenMint.toBase58()} data`)
	console.debug(tokenMintAcccount)
}

export async function exeMintToken(
	ctx: Context,
	tokenMint: PublicKey,
	receipient: PublicKey,
	amount: bigint,
): Promise<void> {
	await mintToken(
		ctx,
		tokenMint,
		receipient,
		amount,
		undefined,
	)
}

export async function exeSetTokenMetadata(
	ctx: Context,
	tokenMint: PublicKey,
	name: string,
	symbol: string,
	metadataUri: string,
): Promise<void> {
	await setMetadataForFungibleToken(
		ctx,
		tokenMint,
		name,
		symbol,
		metadataUri,
		ctx.defaultSigner,
		ctx.defaultSigner,
		undefined,
	)
	const tokenMetadata = findTokenMetadataAddress(tokenMint)
	const tokenMetadataAccount = await getMetadataAccountForTokenMint(ctx, tokenMint)
	console.debug(`Token Metadata ${tokenMetadata.toBase58()} data`)
	console.debug(tokenMetadataAccount)
}
