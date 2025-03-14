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
  const MAX_ITERATIONS = 2;
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
      console.log('get all collection', result);
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
  try {
    const response = await chainGrpcWasmApi1.fetchSmartContractState(
      collectionAddress.contract_address,
      toBase64({
        contract_info: {},
      })
    );

    const responseconfig = await chainGrpcWasmApi1.fetchSmartContractState(
      collectionAddress.contract_address,
      toBase64({
        config: {},
      })
    );

    try{
    const responseactivemintphase = await chainGrpcWasmApi1.fetchSmartContractState(
      collectionAddress.contract_address,
      toBase64({
        active_mint_phase: {},
      })
    );
    } catch (error) {
    console.error(`Error fetching active_mint_phase details for ${contract_address.contract_address}:`, error.message || error);
    }

    try{
    const responsemintphase = await chainGrpcWasmApi1.fetchSmartContractState(
      collectionAddress.contract_address,
      toBase64({
        mint_phase: {},
      })
    );
      } catch (error) {
    console.error(`Error fetching mint_phase details for ${contract_address.contract_address}:`, error.message || error);
    }

    if (!response || !response.data) return null;

    const result = fromBase64(response.data);
    const resultconfig = fromBase64(responseconfig.data);
   const resultactivemintphase = fromBase64(responseactivemintphase.data);
   const resultmintphase = fromBase64(responsemintphase.data);
   
    console.log('nft config', resultconfig);

    console.log('nft resultactivemintphase', resultactivemintphase);

    console.log('nft resultmintphase', resultmintphase);
    
    return {
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
    console.error(`Error fetching collection details for ${contract_address.contract_address}:`, error.message || error);
    return null;
  }
};

const fetchCollectionMetadata = async (collection) => {
  try {
  //  const response = await fetch(`${collection.baseURI}metadata.json`);
 //   const responsenft = await fetch(`${collection.baseURI}1.json`);

 //   const metadata = await response.json();
//    const metadatanft = await responsenft.json();

    const image = collection?.baseURI.startsWith("ipfs://")
      ? collection?.baseURI.replace("ipfs://", "https://gateway.pinata.cloud/ipfs/")
      : collection?.baseURI;

    const imagesrc = { src: image };
    const injiconsrc = { src: 'https://docs.injective.network/~gitbook/image?url=https%3A%2F%2F1906080330-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Forganizations%252FLzWvewxXUBLXQT4cTrrj%252Fsites%252Fsite_cKCsf%252Ficon%252FihvWVYq5lBANeNmdL3OG%252FInjective%2520Symbol%2520-%2520Main.png%3Falt%3Dmedia%26token%3Dbfc3984b-67ff-4563-a93b-390d9c6a720f&width=32&dpr=3&quality=100&sign=5fc24b15&sv=2' };

    return {
      thumb: imagesrc,
      title: collection?.name,
      price: collection?.basePrice ? `${collection.basePrice}` : "N/A",
      saleEnd: `${collection?.totalSupplyLimit - collection.totalSupply}` || "N/A",
      coinIcon: injiconsrc,
      address: collection?.address,
      projectDetails: [
        { title: "Current Mints", text: collection?.totalSupply ? collection.totalSupply.toString() : "0" },
        { title: "Max Mints", text: collection?.totalSupplyLimit ? collection.totalSupplyLimit.toString() : "N/A" },
        { title: "Targeted Raise", text: `${collection?.totalSupplyLimit * collection.basePrice}` || "N/A" },
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

/* const fetchAllCollections = async () => {
  try {
    const collectionArray = []; // Array to store collections
    let start_after = '0'; // Pagination key

    // Loop to fetch all collections
    while (true) {
      const response = await chainGrpcWasmApi1.fetchSmartContractState(
        process.env.NEXT_PUBLIC_FACTORY,
        toBase64({
          get_all_collection: {
            start_after: start_after,
            limit: 30, // Fetch 30 collections at a time
          },
        })
      );

      if (response) {
        const result = fromBase64(response.data);
        console.log('coll data', response);

        // Break the loop if no more collections are returned
        if (result.contracts.length === 0) break;

        // Add each collection to the array
        result.contracts.forEach((contract_info) => {
          collectionArray.push({
            contract_address: contract_info.address,
            minter: contract_info.minter,
            logo_url: contract_info.logo_url,
            name: contract_info.name,
            symbol: contract_info.symbol,
          });
          start_after = contract_info.address; // Update pagination key
        });
      } else {
        break; // Break the loop if no response
      }
    }

    return collectionArray; // Return the fetched collections
  } catch (error) {
    console.log("Error fetching collections:", error);
    return []; // Return an empty array on error
  }
};


export default fetchAllCollections;*/

// Function to fetch baseURI from a collection contract
/*const fetchCollection = async (collectionAddress) => {
  try {
    const contract = getContract({
      address: collectionAddress,
      chain: sonicTestnet,
      abi: nftabi,
      client,
    });

    const data = await readContract({
      contract,
      method: "baseURI",
    });
    const basePrice = await readContract({
      contract,
      method: "basePrice",
    });
    const totalSupplyLimit = await readContract({
      contract,
      method: "totalSupplyLimit",
    });
    const totalSupply = await readContract({
      contract,
      method: "totalSupply",
    });

    const creator = await readContract({
      contract,
      method: "creator",
    });

    

      return {
  baseURI: data.startsWith("ipfs://")
    ? data.replace("ipfs://", "https://gateway.pinata.cloud/ipfs/")
    : data,
  basePrice,
  totalSupplyLimit,
  totalSupply,
  creator,
  address: collectionAddress
        
}; // Return as is if it's already a complete URL

  } catch (error) {
    console.error(`Error fetching baseURI for ${collectionAddress}:`, error);
    return null;
  }
};

// Fetch metadata.json from baseURI
const fetchCollectionMetadata = async (collection) => {
  try {
    const response = await fetch(`${collection.baseURI}metadata.json`);
    const responsenft = await fetch(`${collection.baseURI}1.json`);
    
    const metadata = await response.json();

    const metadatanft = await responsenft.json();

    const image = metadatanft.image.startsWith("ipfs://")
    ? metadatanft.image.replace("ipfs://", "https://gateway.pinata.cloud/ipfs/")
    : metadatanft.image

    const imagesrc = { src: image }
    const soniciconsrc = { src: 'https://s2.coinmarketcap.com/static/img/coins/64x64/32684.png' }
    console.log('metadata base uri && nft1', metadata, metadatanft);

    return {
      thumb: imagesrc,
      title: metadata.CollectionName,
      price: collection.basePrice ? `${collection.basePrice}` : "N/A",
      saleEnd: `${collection.totalSupplyLimit - collection.totalSupply}`  || "N/A",
      coinIcon: soniciconsrc,
      address: collection.address,
      projectDetails: [
        { title: "Current Mints", text: collection.totalSupply ? collection.totalSupply.toString() : "N/A", },
        { title: "Max Mints", text: collection.totalSupplyLimit ? collection.totalSupplyLimit.toString() : "N/A"},
        { title: "Targeted raise", text: `${collection.totalSupplyLimit * collection.basePrice}` || "N/A" },
        { title: "Access type", text: metadata.accessType || "Public" },
      ],
      socialLinks: metadata.socialLinks || [],
    };
  } catch (error) {
    console.error(`Error fetching metadata from ${collection}:`, error);
    return null;
  }
};

// Load NFT collections and format data
const loadNFTCollections = async (onUpdate) => {
  try {
    console.log(sonicTestnet);
    const contract = getContract({
  address: process.env.NEXT_PUBLIC_FACTORY,
  chain: sonicTestnet,
  abi: factoryabi,
  client,
});
    const data = await readContract({
         contract,
         method: "getAllCollections"
     });
   // const collectionAddresses = await factorycontract.call("getCollections");
    console.log('collectionadd', data);
    const collectionAddresses = data;
    
       let projects = [];

    for (const collectionAddress of collectionAddresses) {
      const collect = await fetchCollection(collectionAddress);
      console.log('collect', collect);

      if (collect) {
        const collectionData = await fetchCollectionMetadata(collect);
 if (collectionData) {
          projects.push(collectionData);

          // Call the callback function with updated data
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
    console.error("Error loading NFT collections:", error);
    return { data: [] };
  }
};

export default loadNFTCollections;*/
