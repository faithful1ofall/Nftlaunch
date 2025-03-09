import { useEffect, useState } from "react";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import nextArrowIcon from "@assets/images/icons/next-arrow.png"
import ProjectCard from "../ProjectCard/ProjectCard";
import ProjectItemsStyleWrapper from "./ProjectItems.style";
import projectData from "@assets/data/projects/dataV7";

import coinIcon1 from "@assets/images/project/previous-image.png"
import coinIcon2 from "@assets/images/project/previous-image2.png"
import coinIcon3 from "@assets/images/project/previous-image3.png"
import coinIcon4 from "@assets/images/project/chain.png"

import loadNFTCollections from "../../../../lib/CollectionData";

const ProjectItems = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true); // Loading state

  useEffect(() => {
    const fetchData = async () => {
       loadNFTCollections((updatedData) => {
  console.log("Live update:", updatedData);
          setData(updatedData.data[0]);
         setLoading(false);
});
      
    /*  try {
       
      //  const { data } = await loadNFTCollections();
        console.log("newdata", data);
     //   setData(data); // Store fetched data in state
      } catch (error) {
        console.error("Error loading NFT collections:", error);
      } finally {
         // Set loading to false after fetching
         setLoading(false);
      }*/
    };

    fetchData();
  }, []);
  return (
    <ProjectItemsStyleWrapper>
      <div className="container">
        <div className="single-project-row">

          {loading ? (
            <p>Loading...</p> // Display loading message while fetching
          ) : (
          <Tabs>
            <TabList>
              {/*   <div className="tab_btn_wrapper">
                {data?.map((child, i) => (
                  <Tab key={i}>
                    <button>
                      {child.projectStatus}
                    </button>
                  </Tab>
                ))}
              </div>*/}

              <div className="item_sorting_list">
                <button>
                  All Access
                  <img src={nextArrowIcon.src} alt="icon" />
                  <ul className="sub-menu">
                    <li>All Access</li>
                    <li>Public</li>
                    <li>Private</li>
                    <li>Community</li>
                  </ul>
                </button>
                <button>
                  All Block Chain
                  <img src={nextArrowIcon.src} alt="icon" />
                  <ul className="sub-menu">
                    <li><img src={'https://s2.coinmarketcap.com/static/img/coins/64x64/32684.png'} alt="icon" /> Sonic</li>
                    {/* <li><img src={coinIcon2.src} alt="icon" /> Ethereum (ETH)</li>
                    <li><img src={coinIcon3.src} alt="icon" /> Polygon</li>
                    <li><img src={coinIcon4.src} alt="icon" /> All Block Chain</li>*/}
                  </ul>
                </button>
              </div>
            </TabList>

            {data?.map((items, i) => (
              <TabPanel key={i} className="row tabs-row">
                {items.projects?.map((project, i) => (
                  <div key={i} className="col-lg-4 col-md-6">
                    <ProjectCard key={i} {...project} />
                  </div>
                ))}
              </TabPanel>
            ))}

          </Tabs>
      )}
        </div>
      </div>
    </ProjectItemsStyleWrapper>
  );
};

export default ProjectItems;
