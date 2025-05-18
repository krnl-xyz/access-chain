const hre = require("hardhat");

async function main() {
    const [deployer] = await hre.ethers.getSigners();
    console.log("Using account:", deployer.address);

    // Get the NGOAccessControl contract
    const NGOAccessControl = await hre.ethers.getContractFactory("NGOAccessControl");
    const ngoAccessControl = await NGOAccessControl.attach("0x0Af2AD4D613673c2BDe677b0dA3FeF939C609519"); // Your deployed contract address

    // The address you want to add as admin
    const adminAddress = deployer.address; // Use the current signer's address

    console.log("Adding admin:", adminAddress);
    
    try {
        // Check if already an admin
        const isAdmin = await ngoAccessControl.isAuthorizedAdmin(adminAddress);
        console.log("Is already admin:", isAdmin);
        
        if (isAdmin) {
            console.log("Address is already an admin");
            return;
        }

        // Estimate gas
        const gasEstimate = await ngoAccessControl.addAdmin.estimateGas(adminAddress);
        console.log("Estimated gas:", gasEstimate.toString());

        // Add admin with explicit gas limit
        const tx = await ngoAccessControl.addAdmin(adminAddress, {
            gasLimit: gasEstimate.mul(120).div(100) // Add 20% buffer
        });
        console.log("Transaction hash:", tx.hash);
        
        // Wait for the transaction to be mined
        const receipt = await tx.wait();
        console.log("Transaction receipt:", receipt);
        
        // Verify the admin was added
        const isAdminNow = await ngoAccessControl.isAuthorizedAdmin(adminAddress);
        console.log("Is admin now:", isAdminNow);
    } catch (error) {
        console.error("Error adding admin:", error);
        if (error.data) {
            console.error("Error data:", error.data);
        }
        if (error.reason) {
            console.error("Error reason:", error.reason);
        }
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
}); 