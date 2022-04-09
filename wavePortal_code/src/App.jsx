import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import "./App.css";
import abi from "./utils/WavePortal.json";

const contractABI = abi.abi;
const contractAddress = "0x8a2Cb43CC0C8D02cabd488F4F980360eD8c77DA7";

export default function App() {
  const { ethereum } = window;
  const [allWaves, setAllWaves] = useState([]);
  const [formData, setFormData] = useState("");
  const [seed, setSeed] = useState();

  const [currentAccount, setCurrentAccount] = useState();

  const checkIfWalletIsConnected = async () => {
    try {
      if (!ethereum) {
        console.log("Make sure you have metamask!");
        return;
      } else {
        console.log("We have the ethereum object", ethereum);
      }
      /*
       * Check if we're authorized to access the user's wallet
       */
      const accounts = await ethereum.request({ method: "eth_accounts" });

      if (accounts.length !== 0) {
        const account = accounts[0];
        console.log("Found an authorized account:", account);
        setCurrentAccount(account);
        getAllWaves();
      } else {
        console.log("No authorized account found");
      }
    } catch (error) {
      console.log(error);
    }
  };
  const connectWallet = async () => {
    try {
      if (!ethereum) {
        return alert("please istall metamask");
      }
      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });
      setCurrentAccount(accounts[0]);
      console.log("Account is:", accounts[0]);
    } catch (error) {
      console.log(error);
    }
  };

  const getTotalSeed = async () => {
    try {
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );

        const seed = await wavePortalContract.getTotalSeeds();
        const stringSeed = seed.toString();

        console.log(seed.toString());

        if (stringSeed <= 10) {
          setSeed(true);
        } else {
          setSeed(false);
        }
      } else {
        console.log("No ethereum object found");
      }
    } catch (error) {
      console.log(error);
    }
  };
  const getAllWaves = async () => {
    try {
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );

        const waves = await wavePortalContract.getAllWaves();

        let wavescleaned = [];

        waves.forEach((wave) => {
          wavescleaned.push({
            address: wave.waver,
            message: wave.message,
            timestamp: new Date(wave.timestamp * 1000),
          });
        });
        setAllWaves(wavescleaned);
        await getTotalSeed();
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    checkIfWalletIsConnected();
  }, []);

  useEffect(() => {
    let wavePortalContract;

    const onNewWave = (from, timestamp, message) => {
      console.log("NewWave", from, timestamp, message);
      setAllWaves((prevState) => [
        ...prevState,
        {
          address: from,
          timestamp: new Date(timestamp * 1000),
          message: message,
        },
      ]);
    };

    if (window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      wavePortalContract = new ethers.Contract(
        contractAddress,
        contractABI,
        signer
      );
      wavePortalContract.on("NewWave", onNewWave);
    }

    return () => {
      if (wavePortalContract) {
        wavePortalContract.off("NewWave", onNewWave);
      }
    };
  }, []);

  const wave = async () => {
    try {
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );

        let count = await wavePortalContract.getTotalWaves();
        console.log("Retrieved total wave count...", count.toNumber());

        const waveTxn = await wavePortalContract.wave(`${formData}`, {
          gasLimit: 300000,
        });
        console.log("Mining...", waveTxn.hash);

        await waveTxn.wait();
        console.log("Mined -- ", waveTxn.hash);

        count = await wavePortalContract.getTotalWaves();
        console.log("Retrieved total wave count...", count.toNumber());

        await getTotalSeed();
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="mainContainer">
      <div className="dataContainer">
        <div className="header">👋 Hey there!</div>

        <div className="bio" style={{ marginBottom: "20px" }}>
          Hi i am Heeze, i am a web3 developer and am looking to connect with
          other developers
        </div>
        <input
          placeholder="Enter message"
          style={{ justifyContent: "center" }}
          value={formData}
          onChange={(e) => setFormData(e.target.value)}
        />

        <button className="waveButton" onClick={wave}>
          Wave at Me
        </button>
        {!currentAccount && (
          <button onClick={connectWallet}>Connect Wallet</button>
        )}

        {allWaves.map((wave, index) => {
          return (
            <div
              key={index}
              style={{
                backgroundColor: "OldLace",
                marginTop: "16px",
                padding: "8px",
              }}
            >
              <div>
                Address:
                <a
                  href={`https://rinkeby.etherscan.io/address/${wave.address}`}
                  target="_target"
                  rel="norefferer "
                  style={{ color: "red" }}
                >
                  {wave.address}
                </a>
              </div>
              <div>Time: {wave.timestamp.toString()}</div>
              <div>Message: {wave.message}</div>
              {seed && <div>Won Prize 🎉</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
