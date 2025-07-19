import {
	DataV2,
	createCreateMetadataAccountV3Instruction,
	createUpdateMetadataAccountV2Instruction
} from '@metaplex-foundation/mpl-token-metadata';
import {
	PublicKey,
	TransactionInstruction
} from '@solana/web3.js';
import {
	TOKEN_METADATA_PROGRAM_ID
} from './constants';

/*
 * Create a CreateMetadataAccount instruction for fungible tokens.
 */
export function createMetadataForFungibleTokenIx(
	tokenMint: PublicKey,
	name: string,
	symbol: string,
	metadataUri: string,
	tokenMintAuthority: PublicKey,
	metadataUpdateAuthority: PublicKey,
	payer: PublicKey,
): TransactionInstruction {
	const metadataAddress = findMetadataAddress(tokenMint);
	const createMetadataInstruction = createCreateMetadataAccountV3Instruction(
		{
			metadata: metadataAddress,
			mint: tokenMint,
			mintAuthority: tokenMintAuthority,
			payer: payer,
			updateAuthority: metadataUpdateAuthority,
		},
		{
			createMetadataAccountArgsV3: {
				data: <DataV2>{
					name,
					symbol,
					uri: metadataUri,
					sellerFeeBasisPoints: 0,
					creators: null,
					collection: null,
					uses: null,
				},
				isMutable: true,
				collectionDetails: null,
			}
		}
	);
	return createMetadataInstruction;
}

/**
 * Find derived address for Metadata account of a Token Mint.
 */
export function findMetadataAddress(
	tokenMint: PublicKey,
): PublicKey {
	const [address,]: [PublicKey, number] = PublicKey.findProgramAddressSync(
		[
			Buffer.from('metadata'),
			TOKEN_METADATA_PROGRAM_ID.toBytes(),
			tokenMint.toBytes()
		],
		TOKEN_METADATA_PROGRAM_ID
	)
	return address;
}

/*
 * Create a UpdateMetadataAccount instruction for fungible tokens.
 */
export function updateMetadataForFungibleTokenIx(
	tokenMint: PublicKey,
	name: string,
	symbol: string,
	metadataUri: string,
	newMetadataUpdateAuthority: PublicKey | null,
	currentMetadataUpdateAuthority: PublicKey,
): TransactionInstruction {
	const metadataAddress = findMetadataAddress(tokenMint);
	const updateMetadataInstruction = createUpdateMetadataAccountV2Instruction(
		{
			metadata: metadataAddress,
			updateAuthority: currentMetadataUpdateAuthority,
		},
		{
			updateMetadataAccountArgsV2: {
				data: <DataV2>{
					name,
					symbol,
					uri: metadataUri,
					sellerFeeBasisPoints: 0,
					creators: null,
					collection: null,
					uses: null,
				},
				isMutable: true,
				primarySaleHappened: null,
				updateAuthority: newMetadataUpdateAuthority,
			}
		}
	);
	return updateMetadataInstruction;
}
