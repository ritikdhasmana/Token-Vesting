const main = async () => {
  const tokenContractFactory = await hre.ethers.getContractFactory(
    "VestingToken"
  );
  const tokenContract = await tokenContractFactory.deploy();
  await tokenContract.deployed();
  console.log("Token Contract deployed to:", tokenContract.address);

  const vestingContractFactory = await hre.ethers.getContractFactory(
    "TokenVesting"
  );
  const vestingContract = await vestingContractFactory.deploy(
    tokenContract.address
  );
  await vestingContract.deployed();
  console.log("vesting Contract deployed to:", vestingContract.address);

  let txn;
  txn = await tokenContract.mintTokens(
    vestingContract.address,
    BigInt("100000000000000000000000000")
  );
  await txn.wait();
  console.log("tokens minted");
  txn = await vestingContract.createVestingSchedule([
    "0x09068F74c7D549e312e0964e074F0e0604cc2b6f",
    "0xd5Da3129D02a005e3C7Ff86826c603b2e06F2049",
    "0x09750ad360fdb7a2ee23669c4503c974d86d8694",
    "0xc915eC7f4CFD1C0A8Aba090F03BfaAb588aEF9B4",
    "0x7F85A82a2da50540412F6E526F1D00A0690a77B8",
    "0xBc8b85b1515E45Fb2d74333310A1d37B879732c0",
    "0xBBF84F9b823c42896c9723C0BE4D5f5eDe257b52",
    "0xD5cE086A9d4987Adf088889A520De98299E10bb5",
    "0x6B5C35d525D2d94c68Ab5c5AF9729092fc8771Dd",
    "0x0a00Fb2e074Ffaaf6c561164C6458b5C448120FC",
  ]);
  await txn.wait();
  console.log("vesting Schedules created!");
};

const runMain = async () => {
  try {
    await main();
    process.exit(0);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

runMain();
