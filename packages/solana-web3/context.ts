import {
	Connection,
	Keypair,
	PublicKey,
	sendAndConfirmTransaction,
	SendOptions,
	Transaction,
} from '@solana/web3.js'

/// *******
/// Abstract signer interface to support different signing mechanisms.
/// _______
export interface Signer {
	default(): PublicKey
	sign(tx: Transaction): Promise<void>
}

/// *******
/// Context abstracts the underlying interaction with Solana blockchain.
/// _______
export class Context {
	private _connection: Connection
	private _sendOptions?: SendOptions
	private _signer: Signer

	constructor(
		connection: Connection,
		signer: Signer,
	) {
		this._connection = connection
		this._signer = signer
	}

	get connection(): Connection {
		return this._connection
	}

	get signer(): Signer {
		return this._signer
	}

	/**
	 * Check if an address is initialized onchain.
	 */
	async isAddressInitialized(
		address: PublicKey,
	): Promise<boolean> {
		const accInfo = await this._connection.getAccountInfo(address)
		return accInfo !== null
	}

	/**
	 * Check if an address is a program account.
	 */
	async isProgramAccount(
		address: PublicKey,
	): Promise<boolean> {
		const accInf = await this._connection.getAccountInfo(address)
		if (accInf === null) {
			console.log(`Account ${address.toBase58()} is empty`, '\n')
			return false
		}
		else if (!accInf.executable) {
			console.log(`Account ${address.toBase58()} is not executable`, '\n')
			return false
		}
		return true
	}

	/**
	 * Send transaction and wait until it is confirmed.
	 */
	async sendTransaction(
		transaction: Transaction,
		options?: SendOptions,
	): Promise<string> {
		return sendAndConfirmTransaction(
			this._connection,
			transaction,
			[],
			options || this._sendOptions
		)
	}

	/**
	 * Sign then send transaction and wait until it is confirmed.
	 */
	async signAndSendTransaction(
		transaction: Transaction,
		options?: SendOptions,
	): Promise<string> {
		await this._signer.sign(transaction)
		return sendAndConfirmTransaction(
			this._connection,
			transaction,
			[],
			options || this._sendOptions
		)
	}

	/**
	 * Update connection with Solana Blockchain.
	 */
	useConnection(
		connection: Connection,
	): void {
		this._connection = connection
	}

	/**
	 * Update connection with Solana Blockchain.
	 */
	useSendOptions(
		sendOptions: SendOptions,
	): void {
		this._sendOptions = sendOptions
	}

	/**
	 * Update new signer mechanism.
	 */
	useSigners(
		signer: Signer,
	): void {
		this._signer = signer
	}
}

/// *******
/// InMemory implementation of Signer.
/// _______
export class KeypairsSigner {
	private _signers: Keypair[]

	/**
	 * Initialize with an array of Keypairs.
	 */
	constructor(
		signers: Keypair[] = [],
	) {
		this._signers = signers
	}

	/**
	 * Payer will be the first signer in the stored signers.
	 */
	default(): PublicKey {
		if (this._signers === undefined || this._signers.length === 0) {
			throw new Error('No keypair available')
		}
		return this._signers[0]!.publicKey
	}

	/**
	 * Sign the transaction using the stored signers.
	 */
	async sign(
		tx: Transaction,
	): Promise<void> {
		tx.sign(...this._signers)
	}

	/**
	 * Update the stored signers with a new array of Keypairs.
	 */
	useKeypairs(
		keypairs: Keypair[],
	): void {
		this._signers = keypairs
	}
}
