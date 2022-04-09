//5K83KJ8roLt-gHT6K64ovhL6C4UE5_7s
// 0xd79b1585531e57A8d239ADc5262398279b4F5c91

require("@nomiclabs/hardhat-waffle");


// module.exports = {
//   solidity: "0.8.4",
// };

module.exports = {
  solidity: "0.8.0",
  networks: {
    rinkeby: {
      url: process.env.ALCHEMY_API_KEY,
      accounts: [process.env.PRIVATE_KEY],
    },
  },
};
