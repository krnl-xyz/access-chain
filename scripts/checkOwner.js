const hre = require("hardhat");

async function main() {
    // Get the NGOAccessControl contract
    const NGOAccessControl = await hre.ethers.getContractFactory("NGOAccessControl");
    const ngoAccessControl = await NGOAccessControl.attach("0x0Af2AD4D613673c2BDe677b0dA3FeF939C609519");

    try {
        const owner = await ngoAccessControl.owner();
        console.log("Contract owner:", owner);
        
        // Check if the current signer is the owner
        const [signer] = await hre.ethers.getSigners();
        console.log("Current signer:", signer.address);
        console.log("Is current signer owner:", owner.toLowerCase() === signer.address.toLowerCase());
    } catch (error) {
        console.error("Error checking owner:", error);
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
}); 