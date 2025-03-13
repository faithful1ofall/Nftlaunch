import { toBase64, fromBase64 } from "@injectivelabs/sdk-ts";
import { ChainGrpcWasmApi } from "@injectivelabs/sdk-ts";




const chainGrpcWasmApi1 = new ChainGrpcWasmApi('testnet.sentry.chain.grpc.injective.network:443');





const fetchAllCollections = async () => {
  try {
    const collectionArray: any = []; // Array to store collections
    let start_after: string = '0'; // Pagination key

    // Loop to fetch all collections
    while (true) {
      const response: any = await chainGrpcWasmApi1.fetchSmartContractState(
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
        result.contracts.forEach((contract_info: any) => {
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


export default fetchAllCollections;

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
