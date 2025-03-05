import { useState, useEffect} from "react";
import { FaTelegramPlane, FaTwitter, FaUpload, FaMagic } from "react-icons/fa";
import Button from "@components/button";
import ApplyFormStyleWrapper from "./ApplyFrom.style";
import { PinataSDK } from "pinata-web3";
import { generateImage } from '../../../utils/openaigen'
//import Image from "next/image";

const pinata = new PinataSDK({
  pinataJwt: process.env.NEXT_PUBLIC_PINATAJWT,
  pinataGateway: "example-gateway.mypinata.cloud",
});

const ApplyForm = () => {
 const [layers, setLayers] = useState([]);
  const [nftCount, setNftCount] = useState(1);
  const [imageCID, setImageCID] = useState(null);
  const [metadataCID, setMetadataCID] = useState(null);
  const [totalCombinations, setTotalCombinations] = useState(0);
  const [imagePreviews, setImagePreviews] = useState({});
  const [loading, setLoading] = useState(false);


  const AIgenerateImage = async (prompt) => {
  try {
    setLoading(true);
    const imageData = await generateImage(prompt, 2);
  //  const imageUrl = imageData.data[0].url;

    // Fetch the image while handling CORS issues
//    const response = await fetch(imageUrl, { mode: "no-cors" });

//    if (!response.ok) throw new Error("Failed to fetch image");
//   const blob = await response.blob();
    console.log(imageData);
  //  const imageFile = new File([imageData], `${Date.now()}ai.png`, { type: "image/png" });

    return imageData.res.data[0].url;
  } catch (error) {
    console.error("Error generating AI image:", error);
    alert("AI image generation failed due to CORS restrictions.");
    return null;
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
  setImagePreviews((prevPreviews) => {
    const newPreviews = { ...prevPreviews };

    layers.forEach((layer, layerIndex) => {
      if (!newPreviews[layerIndex]) {
        newPreviews[layerIndex] = [];
      }

      layer.images.forEach((image, imageIndex) => {
        if (!newPreviews[layerIndex][imageIndex] && image.file) {
          newPreviews[layerIndex][imageIndex] = URL.createObjectURL(image.file);
        }
        if (!newPreviews[layerIndex][imageIndex] && image.url) {
          newPreviews[layerIndex][imageIndex] = image.url;
        }
      });

      // Remove previews for deleted images
      newPreviews[layerIndex] = newPreviews[layerIndex].slice(0, layer.images.length);
    });

    return newPreviews;
  });
}, [layers]);
  
  // Compute total combinations dynamically
  useEffect(() => {
  if (layers.length === 0) {
    setTotalCombinations(0);
    return;
  }

  let combinations = 1;
  layers.forEach((layer) => {
    if (layer.images.length > 0) {
      combinations *= layer.images.length;
    }
  });

  setTotalCombinations(combinations);
}, [layers]);

  const removeImage = (layerIndex, imageIndex) => {
  setLayers((prevLayers) => {
    return prevLayers.map((layer, lIdx) => {
      if (lIdx === layerIndex) {
        return {
          ...layer,
          images: layer.images.filter((_, iIdx) => iIdx !== imageIndex),
        };
      }
      return layer;
    });
  });

  setImagePreviews((prevPreviews) => {
    const newPreviews = { ...prevPreviews };

    if (newPreviews[layerIndex] && newPreviews[layerIndex][imageIndex]) {
      URL.revokeObjectURL(newPreviews[layerIndex][imageIndex]); // Clean up URL
    }

    newPreviews[layerIndex] = newPreviews[layerIndex]?.filter((_, iIdx) => iIdx !== imageIndex) || [];

    return newPreviews;
  });
};
  
  const handleLayerUpload = async (event, layerIndex, useAI = false) => {
  if (useAI) {
    const layerName = layers[layerIndex]?.name || "this layer"; // Use the layer name if available
    const prePrompt = `You are generating an image layer for an NFT. The layer name is "${layerName}". `;
    const userPrompt = window.prompt(prePrompt + "Describe your NFT image:");

    if (userPrompt && userPrompt.trim()) {
      try {
        const aiImage = await AIgenerateImage(userPrompt);
        if (aiImage) {
          setLayers((prevLayers) =>
            prevLayers.map((layer, index) =>
              index === layerIndex
                ? { ...layer, images: [...layer.images, { url: aiImage, rarity: "" }] }
                : layer
            )
          );
        }
      } catch (error) {
        console.error("Error generating AI image:", error);
      }
    }
    return;
  }

  const files = Array.from(event.target.files);
  const newImages = files.map((file) => ({ file, rarity: "" }));

  if (newImages.length > 0) {
    setLayers((prevLayers) =>
      prevLayers.map((layer, index) =>
        index === layerIndex
          ? { ...layer, images: [...layer.images, ...newImages] }
          : layer
      )
    );
  }
};

  // Handle rarity change per image
  const handleTraitChange = (layerIndex, imageIndex, value) => {
    setLayers((prevLayers) => {
      const newLayers = [...prevLayers];
      newLayers[layerIndex].images[imageIndex].rarity = value;
      return newLayers;
    });
  };

  // Validate rarity sum to be 100%
  const validateRarity = () => {
    for (const layer of layers) {
      const totalRarity = layer.images.reduce(
        (sum, img) => sum + Number(img.rarity || 0),
        0
      );
      if (totalRarity !== 100) {
        return false;
      }
    }
    return true;
  };

  const addLayer = () => {
  setLayers((prevLayers) => [
    ...prevLayers,
    { name: prevLayers.length === 0 ? "Background" : "", images: [] },
  ]);
};

  const uploadFiles = async (files, type) => {
  try {
    return await pinata.upload.fileArray(files, {
      metadata: {
            name: `MiniLaunch_${type}_${Date.now()}`, // Unique name
      },
    });
  } catch (error) {
    console.error("Error uploading files:", error);
    throw error;
  }
};
  

const generateNFTs = async () => {
  setLoading(true);
  if (imageCID && metadataCID) {
  try {
    await pinata.unpin([imageCID, metadataCID]);
  } catch (error) {
    console.warn("Error unpinning old IPFS data:", error);
  }
  }
  try {
    // Fetch collection name and description from form
    const collectionName = document.getElementById("CollectionName").value.trim();
    const collectionDescription = document.getElementById("CollectionDescription").value.trim();

    if (!collectionName || !collectionDescription) {
      return alert("Please enter collection name and description.");
    }
  if (!validateRarity()) return alert("Rarity percentages must sum to 100% per layer.");
  if (layers.length === 0) return alert("No layers added!");

  let imageFiles = [];
  let metadataFiles = [];

  // Create and configure canvas
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");

  // Generate all unique NFT combinations
  let uniqueCombinations = [];
  function generateCombinations(currentCombo = [], depth = 0) {
    if (depth === layers.length) {
      uniqueCombinations.push(currentCombo);
      return;
    }
    layers[depth].images.forEach(image => generateCombinations([...currentCombo, image], depth + 1));
  }
  generateCombinations();

  // Preload all images asynchronously
  const preloadImage = (image) =>
    new Promise((resolve, reject) => {
      const img = new Image();
      if(image.file){
      img.src = URL.createObjectURL(image.file);
      } 
      if(image.url){
        img.src = image.url;
      }
      img.onload = () => resolve(img);
      img.onerror = reject;
    });

  const loadedImages = await Promise.all(
    uniqueCombinations.flat().map((img) => preloadImage(img))
  );

  // Generate images
  for (let i = 0; i < Math.min(nftCount, uniqueCombinations.length); i++) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    uniqueCombinations[i].forEach((image, index) => {
      ctx.drawImage(loadedImages[i * layers.length + index], 0, 0, canvas.width, canvas.height);
    });

    const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
    imageFiles.push(new File([blob], `${i + 1}.png`, { type: "image/png" }));
  }

  
    // Upload images in parallel
    const imageUpload = await uploadFiles(imageFiles, 'imageFiles');
    if (!imageUpload.IpfsHash) return alert("Failed to upload images to IPFS");
    
    const imageCID = imageUpload.IpfsHash;
    setImageCID(imageCID);

    // Generate metadata
    for (let i = 0; i < Math.min(nftCount, uniqueCombinations.length); i++) {
      let metadata = {
        name: `${collectionName}  #${i + 1}`,
        description: collectionDescription,
        image: `ipfs://${imageCID}/${i + 1}.png`,
        attributes: uniqueCombinations[i].map((image, index) => ({
          trait_type: layers[index].name,
          value: image.file.name,
          rarity: image.rarity,
        })),
      };

      metadataFiles.push(new File([JSON.stringify(metadata, null, 2)], `${i + 1}.json`, { type: "application/json" }));
    }

    const metadataCollection = {
      name: collectionName,
      description: collectionDescription
    };

    const metadataCollectionFile = new File([JSON.stringify(metadataCollection, null, 2)], "_metadata.json", {
      type: "application/json",
    });

    metadataFiles.push(metadataCollectionFile);

    // Upload metadata in parallel
    const metadataUpload = await uploadFiles(metadataFiles, 'metadataFiles');
    if (!metadataUpload.IpfsHash) return alert("Failed to upload metadata");

    setMetadataCID(metadataUpload.IpfsHash);
  
    
    alert(`NFTs generated!\nImages: ipfs://${imageCID}\nMetadata: ipfs://${metadataUpload.IpfsHash}`);
  } catch (error) {
  
    console.error("Error uploading to IPFS:", error);
    alert("Upload failed!");
  } finally {
    setLoading(false); // Ensures loading state resets regardless of success or failure
}
};
  
  return (
    <ApplyFormStyleWrapper>
      <form>
        {/* Existing Collection Form Fields */}
        <div className="form_widgets">
          <div className="form-group">
            <label htmlFor="CollectionName">Collection Name</label>
            <input
              type="text"
              id="CollectionName"
              placeholder="Collection Name"
              className="form-control"
            />
          </div>
          <div className="form-group">
    <label htmlFor="CollectionDescription">Description</label>
    <textarea
      id="CollectionDescription"
      placeholder="Enter a short description of your collection"
      className="form-control"
      rows="3"
    />
  </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input type="email" id="email" placeholder="Email" className="form-control" />
          </div>
        </div>

        {/* NFT Layer Management */}
        <div className="form_widgets">
          <h5>NFT Layer Management</h5>
          {layers.map((layer, layerIndex) => (
            <div key={layerIndex} className="layer-group">
              <input
                type="text"
                placeholder="Layer Name"
                value={layer.name}
                onChange={(e) => {
                  const newLayers = [...layers];
                  newLayers[layerIndex].name = e.target.value;
                  setLayers(newLayers);
                }}
                className="form-control"
              />
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => handleLayerUpload(e, layerIndex)}
                className="form-control"
              />
              <button onClick={(e) => { e.preventDefault(); handleLayerUpload(e, layerIndex, true); }}>
  <FaMagic /> AI Generate
</button>

              {/* Display Images with Rarity Inputs */}
              {layer.images.map((image, imageIndex) => (
                <div key={imageIndex} className="image-group">
                  <p>{image?.file?.name || 'ai generated'}</p>
                  <img src={imagePreviews[layerIndex]?.[imageIndex]} alt="Layer Preview" className="preview-img" />
                  <button onClick={(e) => removeImage(layerIndex, imageIndex)}>Remove</button>
                  <input
                    type="number"
                    placeholder="Rarity %"
                    value={image.rarity}
                    onChange={(e) => { e.preventDefault(); handleTraitChange(layerIndex, imageIndex, e.target.value); }}
                    className="form-control"
                  />
                </div>
              ))}
            </div>
          ))}

            {/* Display Total Combinations */}
        <h4>Total Possible Combinations: {totalCombinations}</h4>

          <Button variant="blue" onClick={(e) => { e.preventDefault(); addLayer(); }}>
            <FaUpload /> Add Layer
          </Button>
        </div>

        {/* NFT Generation Options */}
        <div className="form_widgets">
          <h5>Generate NFTs</h5>
          <input
            type="number"
            value={nftCount}
            onChange={(e) => setNftCount(e.target.value)}
            className="form-control"
            placeholder="Number of NFTs to Generate"
          />
          <Button variant="blue" onClick={(e) => { e.preventDefault(); generateNFTs(); }} disabled={loading}>
  {loading ? (
    <>
      <span className="spinner"></span> Generating...
    </>
  ) : (
    <>
      <FaMagic /> Generate & Upload
    </>
  )}
</Button>

          {/* Display CIDs after generation */}
          {imageCID && metadataCID && (
  <div className="cid_display">
    <h5>Uploaded CIDs</h5>
    <p>
      <strong>Images CID:</strong>{" "}
      <a
        href={`https://gateway.pinata.cloud/ipfs/${imageCID}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        ipfs://{`${imageCID.substring(0, 6)}...${imageCID.slice(-6)}`}
      </a>
    </p>
    <p>
      <strong>Metadata CID:</strong>{" "}
      <a
        href={`https://gateway.pinata.cloud/ipfs/${metadataCID}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        ipfs://{`${metadataCID.substring(0, 6)}...${metadataCID.slice(-6)}`}
      </a>
    </p>
  </div>
)}
        </div>

        {/* Social Links */}
        <div className="form_widgets">
          <div className="form-group">
            <label htmlFor="telegram">TELEGRAM GROUP</label>
            <div className="input_with_icon">
              <div className="input_social_icon">
                <FaTelegramPlane />
              </div>
              <input type="text" id="telegram" placeholder="Enter telegram group link" className="form-control" />
            </div>
          </div>
        </div>

        <Button variant="blue" lg>
          Submit Collection
        </Button>
      </form>
    </ApplyFormStyleWrapper>
  );
};

export default ApplyForm;
