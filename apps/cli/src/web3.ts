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
	rpcUrl: string = 'https://api.devnet.solana.com/',
): Context {
	const connection = new Connection(rpcUrl)
	const defaultKeypairStr = fs.readFileSync('~/.config/solana/id.json', { encoding: 'utf8' })
	const defaultKeypairBuf = Buffer.from(JSON.parse(defaultKeypairStr))
	const signer = new KeypairsSigner([
		Keypair.fromSecretKey(defaultKeypairBuf)
	])
	return new Context(connection, signer)
}
