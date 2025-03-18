import { toBase64, fromBase64, ChainGrpcWasmApi } from "@injectivelabs/sdk-ts";

import { Network as InjectiveNetworks, getNetworkEndpoints } from "@injectivelabs/networks";
const TEST_NETWORK = InjectiveNetworks.TestnetK8s;
const TEST_ENDPOINTS = getNetworkEndpoints(TEST_NETWORK);

const chainGrpcWasmApi1 = new ChainGrpcWasmApi(TEST_ENDPOINTS.grpc);



const fetchAllCollections = async () => {
  if (!process.env.NEXT_PUBLIC_FACTORY) {
    throw new Error("NEXT_PUBLIC_FACTORY environment variable is not defined");
  }

  const collectionArray = [];
  let start_after = '0';
  const MAX_ITERATIONS = 1;
  let iterationCount = 0;

  try {
    while (iterationCount < MAX_ITERATIONS) {
      const response = await chainGrpcWasmApi1.fetchSmartContractState(
        process.env.NEXT_PUBLIC_FACTORY,
        toBase64({
          get_all_collection: {
            start_after: start_after,
            limit: 30,
          },
        })
      );

      if (!response || !response.data) break;

      const result = fromBase64(response.data);
     if (result.contracts.length === 0) break;

      result.contracts.forEach((contract_info) => {
        collectionArray.push({
          contract_address: contract_info.address,
          minter: contract_info.minter,
          logo_url: contract_info.logo_url,
          name: contract_info.name,
          symbol: contract_info.symbol,
        });
        start_after = contract_info.address;
      });

      iterationCount++;
    }

    return collectionArray;
  } catch (error) {
    console.log("Error fetching collections:", error.message || error);
    return [];
  }
};

const fetchCollection = async (collectionAddress) => {
  console.log('get collection', collectionAddress);
  if(!collectionAddress) return null;
  
  try {
    const response = await chainGrpcWasmApi1.fetchSmartContractState(
      collectionAddress.contract_address,
      toBase64({
        num_tokens: {}
      })
    );

    
    const responseconfig = await chainGrpcWasmApi1.fetchSmartContractState(
      collectionAddress.contract_address,
      toBase64({
        config: {},
      })
    );
    
    
    
    
    const responsemintphase = await chainGrpcWasmApi1.fetchSmartContractState(
      collectionAddress.contract_address,
      toBase64({
        mint_phase: {
          start_after: '0',
          limit: 30,
        },
      })
    );
      
    

    if (!response || !response.data) return null;

    const result = fromBase64(response.data);
    const resultconfig = fromBase64(responseconfig.data);
    const resultmintphase = fromBase64(responsemintphase.data);
   
    console.log('nft config', resultconfig);

    console.log('nft resultmintphase', resultmintphase);
    
    return {
      numtokens: result, 
      mintphase: resultmintphase.mint_phase[0],
      baseURI: resultconfig?.base_url.startsWith("ipfs://")
        ? resultconfig?.base_url.replace("ipfs://", "https://gateway.pinata.cloud/ipfs/")
        : resultconfig?.base_url,
      basePrice: result?.basePrice,
      logoUrl: result?.logo_url,
      mintActive: resultconfig?.is_mint_active,
      name: result?.name,
      totalSupplyLimit: resultconfig?.max_mint,
      totalSupply: resultconfig?.total_supply,
      creator: collectionAddress?.minter,
      address: collectionAddress?.contract_address,
    };
  } catch (error) {
    console.error(`Error fetching collection details for ${collectionAddress.contract_address}:`, error.message || error);
    return null;
  }
};

const fetchCollectionMetadata = async (collection) => {
  try {
   // const response = await fetch(`${collection.baseURI}metadata.json`);
   
 //   const metadata =  await response.json();
    const responsenft = collection?.baseURI ? await fetch(`${collection.baseURI}1.json`) : null;
    
    let metadatanft = {}; // Default empty object

    if (responsenft && responsenft.ok) {
        metadatanft = await responsenft.json();
    }

    console.log(metadatanft.image);

    const image = metadatanft.image;

    const imagesrc = { src: image };
    const injiconsrc = { src: 'https://docs.injective.network/~gitbook/image?url=https%3A%2F%2F1906080330-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Forganizations%252FLzWvewxXUBLXQT4cTrrj%252Fsites%252Fsite_cKCsf%252Ficon%252FihvWVYq5lBANeNmdL3OG%252FInjective%2520Symbol%2520-%2520Main.png%3Falt%3Dmedia%26token%3Dbfc3984b-67ff-4563-a93b-390d9c6a720f&width=32&dpr=3&quality=100&sign=5fc24b15&sv=2' };

    return {
      thumb: imagesrc,
      title: collection?.name,
      price: collection?.mintphase.price ? `${collection?.mintphase.price}` : "N/A",
      saleEnd: `${collection?.totalSupplyLimit - collection.totalSupply}` || "N/A",
      coinIcon: injiconsrc,
      address: collection?.address,
      projectDetails: [
        { title: "Current Mints", text: collection?.numtokens ? collection.numtokens.toString() : "0" },
        { title: "Total Supply", text: collection?.totalSupply ? collection.totalSupply.toString() : "N/A" },
        { title: "Targeted Raise", text: `${collection?.totalSupply * collection?.mintphase.price}` || "N/A" },
        { title: "Access Type", text: "Public" },
      ],
      socialLinks: [],
    };
  } catch (error) {
    console.error(`Error fetching metadata for ${collection.address}:`, error.message || error);
    return null;
  }
};

const loadNFTCollections = async (onUpdate) => {
  try {
    const collections = await fetchAllCollections();
    const projects = [];

    for (const collection of collections) {
      const collectionDetails = await fetchCollection(collection);
      if (collectionDetails) {
        const collectionMetadata = await fetchCollectionMetadata(collectionDetails);
        if (collectionMetadata) {
          projects.push(collectionMetadata);

          // Call the callback function with updated data in real-time
          if (onUpdate) {
            onUpdate({
              data: [
                {
                  projectStatus: "On Going",
                  projects: [...projects], // Send a copy of the array
                },
              ],
            });
          }
        }
      }
    }

    return {
      data: [
        {
          projectStatus: "On Going",
          projects,
        },
      ],
    };
  } catch (error) {
    console.error("Error loading NFT collections:", error.message || error);
    return { data: [] };
  }
};

export default loadNFTCollections;
