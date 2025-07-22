import {
	PublicKey,
	SystemProgram,
	TransactionInstruction,
} from '@solana/web3.js'
import {
	Context,
} from './context'

/**
 * Create a Create Account instruction to initialize new account.
 */
export async function createAccountIx(
	ctx: Context,
	newAccountAddr: PublicKey,
	size: number,
	programID: PublicKey,
): Promise<TransactionInstruction> {
	const rentExemption = await ctx.connection.getMinimumBalanceForRentExemption(size)
	return SystemProgram.createAccount({
		fromPubkey: ctx.signer.default(),
		newAccountPubkey: newAccountAddr,
		lamports: rentExemption,
		space: size,
		programId: programID,
	})
}
