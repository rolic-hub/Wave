

require("@nomiclabs/hardhat-waffle");
import dotenv from "dotenv";
dotenv.config();

module.exports = {
  solidity: "0.8.0",
  networks: {
    rinkeby: {
      url: process.env.ALCHEMY_API_KEY,
      accounts: [process.env.PRIVATE_KEY],
    },
  },
};
