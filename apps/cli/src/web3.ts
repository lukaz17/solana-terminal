import {
	Context,
	KeypairsSigner,
} from '@local/solana-web3'
import {
	Connection,
	Keypair,
} from '@solana/web3.js'
import fs from 'fs'

/**
 * Initialize a Context using solana CLI keypair.
 */
export function createLocalContext(
	keypairFile: string = '~/.config/solana/id.json',
	rpcUrl: string = 'https://api.devnet.solana.com/',
): Context {
	const connection = new Connection(rpcUrl)
	const defaultKeypairStr = fs.readFileSync(keypairFile, { encoding: 'utf8' })
	const defaultKeypairBuf = Buffer.from(JSON.parse(defaultKeypairStr))
	const signer = new KeypairsSigner([
		Keypair.fromSecretKey(defaultKeypairBuf)
	])
	return new Context(connection, signer)
}
