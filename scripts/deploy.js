const hre = require("hardhat");

async function main() {
    const [deployer] = await hre.ethers.getSigners();
    console.log("Deploying contracts with the account:", deployer.address);

    // Deploy NGOAccessControl first since it's used by RequestRegistry
    const NGOAccessControl = await hre.ethers.getContractFactory("NGOAccessControl");
    const ngoAccessControl = await NGOAccessControl.deploy();
    await ngoAccessControl.waitForDeployment();
    console.log("NGOAccessControl deployed to:", await ngoAccessControl.getAddress());

    // Deploy RequestRegistry with NGOAccessControl address
    const RequestRegistry = await hre.ethers.getContractFactory("RequestRegistry");
    const requestRegistry = await RequestRegistry.deploy(await ngoAccessControl.getAddress());
    await requestRegistry.waitForDeployment();
    console.log("RequestRegistry deployed to:", await requestRegistry.getAddress());

    // Deploy AccessGrant with NGOAccessControl address
    const AccessGrant = await hre.ethers.getContractFactory("AccessGrant");
    const accessGrant = await AccessGrant.deploy(await ngoAccessControl.getAddress());
    await accessGrant.waitForDeployment();
    console.log("AccessGrant deployed to:", await accessGrant.getAddress());

    // Deploy AccessToken
    const AccessToken = await hre.ethers.getContractFactory("AccessToken");
    const accessToken = await AccessToken.deploy(await ngoAccessControl.getAddress());
    await accessToken.waitForDeployment();
    console.log("AccessToken deployed to:", await accessToken.getAddress());

    // Deploy AccessNFT
    const AccessNFT = await hre.ethers.getContractFactory("AccessNFT");
    const accessNFT = await AccessNFT.deploy();
    await accessNFT.waitForDeployment();
    console.log("AccessNFT deployed to:", await accessNFT.getAddress());

    // Deploy AccessDAO with the AccessToken address
    const AccessDAO = await hre.ethers.getContractFactory("AccessDAO");
    const accessDAO = await AccessDAO.deploy(await accessToken.getAddress());
    await accessDAO.waitForDeployment();
    console.log("AccessDAO deployed to:", await accessDAO.getAddress());

    // Save contract addresses to a JSON file
    const fs = require("fs");
    const contractAddresses = {
        NGOAccessControl: await ngoAccessControl.getAddress(),
        RequestRegistry: await requestRegistry.getAddress(),
        AccessGrant: await accessGrant.getAddress(),
        AccessToken: await accessToken.getAddress(),
        AccessNFT: await accessNFT.getAddress(),
        AccessDAO: await accessDAO.getAddress()
    };
    fs.writeFileSync("./contract-addresses.json", JSON.stringify(contractAddresses, null, 2));

    console.log("\nWaiting for block confirmations...");
    await ngoAccessControl.deploymentTransaction().wait(5);
    await requestRegistry.deploymentTransaction().wait(5);
    await accessGrant.deploymentTransaction().wait(5);
    await accessToken.deploymentTransaction().wait(5);
    await accessNFT.deploymentTransaction().wait(5);
    await accessDAO.deploymentTransaction().wait(5);

    console.log("\nVerifying contracts...");
    try {
        await hre.run("verify:verify", {
            address: await ngoAccessControl.getAddress(),
            constructorArguments: [],
        });
        console.log("NGOAccessControl verified");

        await hre.run("verify:verify", {
            address: await requestRegistry.getAddress(),
            constructorArguments: [await ngoAccessControl.getAddress()],
        });
        console.log("RequestRegistry verified");

        await hre.run("verify:verify", {
            address: await accessGrant.getAddress(),
            constructorArguments: [await ngoAccessControl.getAddress()],
        });
        console.log("AccessGrant verified");

        await hre.run("verify:verify", {
            address: await accessToken.getAddress(),
            constructorArguments: [await ngoAccessControl.getAddress()],
        });
        console.log("AccessToken verified");

        await hre.run("verify:verify", {
            address: await accessNFT.getAddress(),
            constructorArguments: [],
        });
        console.log("AccessNFT verified");

        await hre.run("verify:verify", {
            address: await accessDAO.getAddress(),
            constructorArguments: [await accessToken.getAddress()],
        });
        console.log("AccessDAO verified");
    } catch (error) {
        console.error("Error verifying contracts:", error);
    }

    console.log("\nAll contracts deployed and verified successfully!");
    console.log("Contract addresses saved to contract-addresses.json");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
