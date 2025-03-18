import Button from "@components/button";
import BannerStyleWrapper from "./Banner.style";

import bannerIcon from "@assets/images/icons/icon1.png";

const Banner = () => {
  return (
    <>
      <BannerStyleWrapper>
        <div className="container">
          <div className="banner-content text-center">
            <img
              src={bannerIcon.src}
              className="banner-icon"
              alt="banner icon"
            />
            <h1 className="banner-title">
              NFT Launch Metaverse Web 3.0 NFT Agent Launchpad &amp; AI
            </h1>
            <div className="description">
              The next generation A.I ecosystem for NFT AI Agents
            </div>

            <Button href="/projects-grid" variant="mint" md isCenter className="banner-btn">
              Explore Collections
            </Button>
          </div>
        </div>
      </BannerStyleWrapper>
    </>
  );
};

export default Banner;
