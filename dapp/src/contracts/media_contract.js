import web3 from "../lib/web3";
import contractAbi from "./abi/mediaAbi.json";

const contract_address = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
const mediaContract = new web3.eth.Contract(contractAbi, contract_address);

export default mediaContract;