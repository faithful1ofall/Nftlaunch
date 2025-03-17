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
   /* let phase = [];

    if (phase.length == 0) {
    const currentTime = Math.floor(Date.now() / 1000); 
    const oneYearInSeconds = 365 * 24 * 60 * 60;

    let new_phase = {
        mint_type: "1",
        mint_name: "Public",
        price: "1",
        start_time: currentTime,
        end_time: currentTime + oneYearInSeconds, 
    };
    phase.push(new_phase);
}*/
      
/*    const msg = new MsgExecuteContract({
    sender: recentWallet.account.address,
    contract: address,
    msg: {
      mint_active: {
        is_active: true
      }
    },
  });*/

  /*  const msg1 = new MsgExecuteContract({
    sender: recentWallet.account.address,
    contract: address,
    msg: {
      mint_phase: {
        mint_phase: phase
      }
    },
  });*/

    let config = {
                minter: 'inj16ry7wekxvq38mjfcwrdpqzhgap9dnpgrpk296n',
                total_supply: "10",
                max_mint: "10",
                native_token: 'inj',
                base_url: 'test',
                logo_url: 'testlogo',
                mint_wallet: 'inj16ry7wekxvq38mjfcwrdpqzhgap9dnpgrpk296n',
                royalty_wallet: [{percent: 10, wallet: 'inj16ry7wekxvq38mjfcwrdpqzhgap9dnpgrpk296n'}]
    }

    const msg2 = new MsgExecuteContract({
    sender: recentWallet.account.address,
    contract: address,
    msg: {
      config: {
        minter:config.minter,
        total_supply: Number(config.total_supply),
        max_mint: Number(config.max_mint),
        native_token: config.native_token,
        base_url: config.base_url,
        logo_url: config.logo_url,
        mint_wallet: config.mint_wallet,
        royalty_wallet: config.royalty_wallet
      }
    },
  });

    
    
  let extensions = [{}]
    let extensions1 = {}


    const msg1 = new MsgExecuteContract({
    sender: recentWallet.account.address,
    contract: address,
    msg: {
      batch_mint_all: {
        token_count: 1,
        owner: recentWallet.account.address,
        extension: extensions1
      }
    },
    funds: [
      {
        denom: 'inj',
        amount: '1'
      }
    ]
  });
    
    console.log('totsupply', projectDetails[0].text);

    const msg = new MsgExecuteContract({
    sender: recentWallet.account.address,
    contract: address,
    msg: {
      batch_mint: {
        token_id: ['1'],
        owner: [recentWallet.account.address],
        token_uri: ['test'],
        extension: extensions
      }
    },
    funds: [
      {
        denom: 'inj',
        amount: '10000000000'
      }
    ]
  });

      const msgs = [msg2];
     const msgs1 = [msg1];
    console.log('msgs', msgs);
  console.log('msgs', msgs1);

      const response = await simulate({
    messages: msgs,
    wallet: recentWallet,
  });
   console.log('response for simulate', response);
   const  feeest = response.fee?.amount[0];
   const  gasLimit = response.fee?.gas;
    
const result1 = await broadcast({
                wallet: recentWallet,
                messages: msgs1,
                feeAmount: feeest?.amount,
                gasLimit: gasLimit,
            });
    console.log("1st Transaction successful:", result1);
  

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
