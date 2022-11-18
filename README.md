## Inspiration
Crowdfunding platforms generally use the standard financial system which excludes many people who lack access to international financial services because of poorly designed regulations  or because there are no financial institutions in their area. According to data released by the World Bank, Some 1.7 billion adults worldwide still don't have access to a bank account.  

Furthermore, there is always the problem of cross-border payments worldwide, it is difficult for traditional crowdfunding platforms to process cross-border payments. A crowdfunding project in Africa cannot receive money in its local currency from the US or other European countries due to many financial limitations. These problems can be solved using cryptocurrency.   

Traditional crowdfunding platforms are centralized and they have high transaction costs or commission which makes it difficult to raise funds.  


## What it does
Coin Rise is a decentralized Crowdfunding platform where users can raise funds for projects without the presence of a third party. It's transparent for both the contributors and the project submitters.   

Unlike traditional crowdfunding, there are no hidden charges or commissions. Every transaction is visible on the blockchain.  

It removes the high transaction costs and long transfer delays for those with access to financial services.     


The platform introduces two method to fund a project:

**First one is normal project submission**  
A project submitter can submit his campaign on this platform where he can specify the minimum amount needed and the duration of the campaign.
On the other hand, users can see his campaign on our platform and decide to fund it with stablecoins USDC, if the deadline came and the campaign had raised a total supply greater than the minimum amount needed, the contract will send automatically the funds to the submitter if not and the campaign fails, the contract will return the funds to contributors.

**Second method:**  
Send fund by chunks that’s defined by the project submitter and voted by contributors  

The purpose of voting system is to give more transparency about spending the money:  
-the submitter can choose this option and this will give him more credibility and he can propose how he will be spending the money  
-the contributor on the other hand can vote if a part of the allocated fund should be spent on the submitter proposal or not  
for example if the submitter propose that he should get the funds on 3 chunks to build a school ( example: first one will be buying material, 2nd : building , 3rd: painting )
the contributor can see the progress of the project and vote if other chunks should be sent to the submitter or not ( if not , the funds should be returned to contributors)

## How we built it
- ChainLink Keeper automates the funding process and the voting system
- Data storage of campaign details and request details via Web3 Storage ( IPFS + Filecoin )
- All smart contracts are deployed on Polygon Mumbai

## Challenges we ran into
- IPFS sometimes takes so much time to get the data

## Accomplishments that we're proud of
- A working decentralized crowdfunding platform where  anyone can start a campaign without having to fill out lengthy forms and unnecessary KYC.  
- Users can send stablecoins to fund projects  
- Users without stablecoins can swap tokens into stablecoins to fund a project.  
- An easy-to-understand UX for non-tech savvy or non-web3 users.  

## Team
- Mourad Bouabdallah - Fullstack Web3 Developer - www.linkedin.com/in/mourad-bouabdallah/
- Florian Meiswinkel - Smart Contracts Developer - www.linkedin.com/in/florian-meiswinkel-33a727257/
- Wajih Jabeur - Front-end Developer - www.linkedin.com/in/wajih-jabeur-506965144/
- Stephen Ayeomotor - UI/UX Designer - www.linkedin.com/in/stephen-ayeomotor-19b474100/
- Anupriya Lathey - Front-end Developer - www.linkedin.com/in/anupriya-lathey-585071222/

## What's next for Coin rise
- We plan to implement on ramp feature on the platform. Where contributors can buy USDC directly from the platform using their credit card  
- Users can vote to get their funds back if the project does not go according to their wishes.  
- Users can mint their NFTs in the frontend and these are displayed on the website.  
- Make a community to approve submitted projects and filter spams where they can earn money from that  
- The Submitter and the users can decide to get yield while waiting to spend the tokens  
- Automating the funding process for the ChainlinkKeeper with the collected fees  

Youtube Video: https://youtu.be/9w6S-J6DpH0
