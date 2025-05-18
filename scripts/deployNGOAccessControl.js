const hre = require("hardhat");

async function main() {
    const [deployer] = await hre.ethers.getSigners();
    console.log("Deploying NGOAccessControl with the account:", deployer.address);

    const NGOAccessControl = await hre.ethers.getContractFactory("NGOAccessControl");
    const ngoAccessControl = await NGOAccessControl.deploy();
    await ngoAccessControl.waitForDeployment();
    const ngoAccessControlAddress = await ngoAccessControl.getAddress();
    console.log("NGOAccessControl deployed to:", ngoAccessControlAddress);

    // Wait for block confirmations
    await ngoAccessControl.deploymentTransaction().wait(5);

    // Verify the contract
    try {
        await hre.run("verify:verify", {
            address: ngoAccessControlAddress,
            constructorArguments: [],
        });
        console.log("NGOAccessControl verified");
    } catch (error) {
        console.error("Error verifying NGOAccessControl:", error);
    }

    console.log("NGOAccessControl deployment completed successfully!");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
}); 