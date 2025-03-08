import { getContract, readContract } from "thirdweb";
import { client } from "./client";
import { sonicTestnet } from "./Customchains";
import factoryabi from "./factoryabi.json";
import nftabi from "./nftabi.json";


// Function to fetch baseURI from a collection contract
const fetchCollection = async (collectionAddress) => {
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

      return {
  baseURI: data.startsWith("ipfs://")
    ? data.replace("ipfs://", "https://gateway.pinata.cloud/ipfs/")
    : data,
  basePrice,
  totalSupplyLimit,
  totalSupply
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
    console.log('response base uri', response);
    const metadata = await response.json();

    console.log('metadata base uri', metadata);

    return {
      thumb: metadata.image,
      title: metadata.CollectionName,
      price: collection.basePrice || "N/A",
      saleEnd: metadata.saleEnd || "N/A",
      coinIcon: metadata.icon || metadata.image,
      projectDetails: [
        { title: "Min allocation", text: metadata.minAllocation || "N/A" },
        { title: "Max allocation", text: collection.totalSupplyLimit || "N/A" },
        { title: "Targeted raise", text: metadata.targetedRaise || "N/A" },
        { title: "Access type", text: metadata.accessType || "N/A" },
      ],
      socialLinks: metadata.socialLinks || [],
    };
  } catch (error) {
    console.error(`Error fetching metadata from ${collection}:`, error);
    return null;
  }
};

// Load NFT collections and format data
const loadNFTCollections = async () => {
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

      if (baseURI) {
        const collectionData = await fetchCollectionMetadata(collect);
        if (collectionData) projects.push(collectionData);
      }
    }

    return {
      data: [
        {
       //   projectStatus: "On Going",
          projects,
        },
      ],
    };
  } catch (error) {
    console.error("Error loading NFT collections:", error);
    return { data: [] };
  }
};

export default loadNFTCollections;
