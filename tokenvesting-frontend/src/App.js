import "./App.css";
import { ethers } from "ethers";
import { useState, useEffect } from "react";
import ContractAddress from "./contractData/contracts-address.json";
import ContractAbi from "./contractData/abi.json";
import Header from "./Components/Header";
function App() {
  const [vestingContract, setVestingContract] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false); //user login
  const [userAddress, setUserAddress] = useState("");
  const [userTokenBalance, setUserTokenBalance] = useState(0);
  const [totalVestingSchedules, setTotalVestingSchedules] = useState(0);
  const [allVestingSchedules, setAllVestingSchedules] = useState([]);
  const [releasedAmount, setReleasedAmount] = useState([]);
  const { ethereum } = window;
  const contract = ContractAddress.Token;
  const abi = ContractAbi.abi;
  //fetches current ethereum address to check if we are still using the same address or not
  const getCurrentAccount = async () => {
    try {
      if (!ethereum) {
        alert("Metamask not found");
        return;
      }
      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });
      if (accounts.length !== 0) {
        const account = accounts[0];
        if (account !== userAddress) {
          setUserAddress(account);
          setIsLoggedIn(true);
          console.log("Account: ", account);
        }
        return account;
      } else {
        console.log("No account available");
        setIsLoggedIn(false);
      }
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    getCurrentAccount();
  }, []);

  ethereum.on("accountsChanged", function (accounts) {
    getCurrentAccount();
  });

  // for contract
  useEffect(() => {
    const fetchNFTMetadata = async () => {
      try {
        console.log("fetching data...");
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const vestingContract = new ethers.Contract(contract, abi, signer);
        setVestingContract(() => vestingContract);
        let txn = await vestingContract.userBalance();
        const balance = (txn / Math.pow(10, 18)).toFixed(4);
        console.log("user bal:", balance);
        setUserTokenBalance(() => balance);

        txn = await vestingContract.getTotalVestingSchedules();
        const totalSchedule = txn.toNumber();
        console.log("Schedules:", totalSchedule);
        setTotalVestingSchedules(totalSchedule);
        const allSchedules = [];
        const releasedToken = [];
        for (let i = 0; i < totalSchedule; i++) {
          txn = await vestingContract.getVestingSchedule(i + 1);
          // console.log(txn);
          allSchedules.push(txn);
          txn = await vestingContract.releasedTokensAmount(
            allSchedules[i].beneficiary
          );
          releasedToken.push(txn);
        }

        setAllVestingSchedules(() => allSchedules);
        console.log(allSchedules);
        setReleasedAmount(() => releasedToken);
        console.log(releasedToken);
      } catch (error) {
        console.log(error);
      }
    };

    if (userAddress) {
      console.log("userAddress:", userAddress);
      fetchNFTMetadata();
    }
  }, [userAddress, isLoggedIn]);

  const login = async () => {
    await getCurrentAccount()
      .then(function () {
        setIsLoggedIn(true);
        console.log("logged in user:", userAddress);
        console.log(userAddress);
        setIsLoggedIn(true);
      })
      .catch(function (error) {
        console.log(error);
      });
  };

  const renderVestingSchedule = (vestingSchedule, index) => {
    return (
      <div className="vesting-row" key={index}>
        <div>
          {vestingSchedule.beneficiary.slice(0, 4) +
            "....." +
            vestingSchedule.beneficiary.slice(38, 43)}
        </div>
        <div>{vestingSchedule.duration.toNumber()}</div>
        <div>{vestingSchedule.totalAmount.toNumber()}</div>
        <div>{(releasedAmount[index] / Math.pow(10, 18)).toFixed(4)}</div>
        <div>
          {(vestingSchedule.amountWithdrawn / Math.pow(10, 18)).toFixed(4)}
        </div>
      </div>
    );
  };

  const renderMyVestingSchedule = () => {
    let hasVestingSchedule = false;
    let vestingSchedule = [];
    let index = 0;
    for (let i = 0; i < allVestingSchedules.length; i++) {
      if (
        allVestingSchedules[i].beneficiary.toLowerCase() ===
        userAddress.toLowerCase()
      ) {
        index = i;
        vestingSchedule = allVestingSchedules[i];
        hasVestingSchedule = true;
        break;
      }
    }
    return hasVestingSchedule ? (
      <div className="vesting-container">
        <div>Duration: {vestingSchedule.duration.toNumber()}</div>
        <div>Total Amount: {vestingSchedule.totalAmount.toNumber()}</div>
        <div>
          Released Amount:{" "}
          {(releasedAmount[index] / Math.pow(10, 18)).toFixed(4)}
        </div>
        <div>
          Withdrawn Amount:
          {(vestingSchedule.amountWithdrawn / Math.pow(10, 18)).toFixed(4)}
        </div>
        <div className="withdraw-button" onClick={() => withdrawTokens(index)}>
          Withdraw
        </div>
      </div>
    ) : (
      <div>You do not have a vesting Schedule!</div>
    );
  };

  const withdrawTokens = async (index) => {
    console.log("withdrawn in progress...");
    try {
      console.log(index);
      await vestingContract.withdrawTokens(userAddress, releasedAmount[index]);
    } catch (error) {
      console.log(error);
    }
    console.log("token withdrawn!");
  };
  return (
    <div className="App">
      <Header login={login} isLoggedIn={isLoggedIn} account={userAddress} />
      <div className="main-body">
        <span>Your Token Balance : {userTokenBalance}</span>
        <span style={{ marginTop: "3rem" }}>Vesting Details</span>
        <div className="vesting-table-header">
          <div>Address of Beneficiary</div>
          <div>Duration (in Seconds)</div>
          <div>Total Amount of Tokens</div>
          <div>Released Amount of Tokens</div>
          <div>Withdawn Amount</div>
        </div>
        <div className="vesting-table">
          {allVestingSchedules.map((vestingSchedule, index) =>
            renderVestingSchedule(vestingSchedule, index)
          )}
        </div>
        <div className="myVesting">Your Vesting Schedule</div>
        {renderMyVestingSchedule()}
      </div>
    </div>
  );
}

export default App;
