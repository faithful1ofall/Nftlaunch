import { useState } from "react";
import Link from "next/link";
import CardHover from "@components/cardHover";
import ProjectCardStyleWrapper from "./ProjectCard.style";
import Button from "@components/button";
import { useShuttle, MsgExecuteContract } from "@delphi-labs/shuttle-react";

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
  const [loading, setLoading] = useState(false);
const { recentWallet, broadcast, simulate } = useShuttle();


const mintnft = async () => {
  setLoading(true); 

  try {
      const contractAddress = process.env.NEXT_PUBLIC_FACTORY; // Replace with your deployed contract address

  
    const msg = new MsgExecuteContract({
    sender: recentWallet.account.address,
    contract: contractAddress,
    msg: {
      mint_active: {
        is_active: is_active
      }
    },
  });

      const msgs = [msg];
    console.log('msgs', msgs);

      const response = await simulate({
    messages: msgs,
    wallet: recentWallet,
  });
   console.log('response for simulate', response);
   const  feeest = response.fee?.amount[0];
   const  gasLimit = response.fee?.gas;


      const result = await broadcast({
                wallet: recentWallet,
                messages: msgs,
                feeAmount: feeest?.amount,
                gasLimit: gasLimit,
            });

      console.log("Transaction successful:", result);
      alert("Smart contract executed successfully!");
      setLoading(false);
    } catch (error) {
      console.error("Execution failed:", error);
      alert("Transaction failed!");
      setLoading(false);
  }
};

  
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
          <div className="dsc">PRICE S(Gwei) = {price}</div>
        </div>
      </div>
      <div className="project-content">
        <div className="project-header d-flex justify-content-between align-items-center">
          <div className="heading-title">
            <h4>{saleEnd} Mints Left</h4>
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
        {/* Collection Address Link */}
        <div className="collection-address">
          <strong>Collection:</strong>{" "}
          <Link
            href={`https://testnet.sonicscan.org/address/${address}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            {address}
          </Link>
        </div>
        <div className="social-links">
          {socialLinks?.map((profile, i) => (
            <Link key={i} href={profile.url}>
              <img src={profile.icon.src} alt="social icon" />
            </Link>
          ))}
        </div>
        <Button variant="mint" lg onClick={(e) => { e.preventDefault(); mintnft();}}>
          {loading ? <div className="spinner"></div> : 'Mint'}
        </Button>
      </div>

      <CardHover />
    </ProjectCardStyleWrapper>
  );
};

export default ProjectCard;
