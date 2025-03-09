import Link from "next/link";
import CardHover from "@components/cardHover";
import ProjectCardStyleWrapper from "./ProjectCard.style";
import { getContract, prepareContractCall } from "thirdweb";
import { client } from "src/lib/client";
import { sonicTestnet } from "src/lib/Customchains";
import nftabi from "src/lib/nftabi.json";
import Button from "@components/button";

import { useSendTransaction, useReadContract } from "thirdweb/react";

const ProjectCard = ({
  thumb,
  title,
  price,
  saleEnd,
  coinIcon,
  projectDetails,
  address,
  socialLinks,
}) => {

  const contract = getContract({
address: address,
chain: sonicTestnet,
abi: nftabi,
client,
});

   const { data, isLoading } = useReadContract({
contract,
method: "totalSupply"
});

  const basePrice = useReadContract({
contract,
method: "basePrice"
});


  const { mutate: sendTx, data: transactionResult } =
useSendTransaction();

  
  
 const mintnft = () => {
const transaction = prepareContractCall({
contract,
method: "mint",
params: [data + 1],
value: basePrice.data,
});
   
   sendTx(transaction, {
    onSuccess: () => alert("Transaction sent successfully!"),
    onError: (error) => alert(`Transaction failed: ${error.message}`),
  });
 }

  
  return (
    <ProjectCardStyleWrapper className="project_item_wrapper">
      <div className="project-info d-flex">
        <Link href="#">
          <img src={thumb.src} alt="project thumb" />
        </Link>
        <div className="project-auother">
          <h4 className="mb-10">
            <Link href="/projects-details-1">
              {title}
            </Link>
          </h4>
          <div className="dsc">PRICE (S) = {price}</div>
        </div>
      </div>
      <div className="project-content">
        <div className="project-header d-flex justify-content-between align-items-center">
          <div className="heading-title">
            <h4>{saleEnd} Days Left</h4>
          </div>
          <div className="project-icon">
            <img src={coinIcon.src} alt="coin icon" />
          </div>
        </div>
        <ul className="project-listing">
          {projectDetails?.map((item, i) => (
            <li key={i}>
              {item.title} <span>{item.text}</span>
            </li>
          ))}
        </ul>
        <div className="social-links">
          {socialLinks?.map((profile, i) => (
            <Link key={i} href={profile.url}>
              <img src={profile.icon.src} alt="social icon" />
            </Link>
          ))}
        </div>
        <Button variant="mint" lg onClick={(e) => { e.preventDefault(); mintnft();}}>
          Mint
        </Button>
      </div>

      <CardHover />
    </ProjectCardStyleWrapper>
  );
};

export default ProjectCard;
