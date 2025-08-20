const fs = require('fs');
const path = require('path');

async function updateFrontendConfig() {
    console.log('🔧 Updating Frontend Configuration');
    console.log('==================================');
    
    // Load deployment info
    let deploymentInfo;
    try {
        deploymentInfo = JSON.parse(fs.readFileSync('deployment-info.json', 'utf8'));
        console.log('📋 Loaded deployment info for program:', deploymentInfo.programId);
    } catch (error) {
        console.error('❌ Failed to load deployment info. Run deploy script first.');
        process.exit(1);
    }
    
    // Update config.ts
    const configPath = path.join('frontend', 'src', 'lib', 'config.ts');
    
    if (!fs.existsSync(configPath)) {
        console.error('❌ Frontend config file not found:', configPath);
        process.exit(1);
    }
    
    console.log('📝 Updating', configPath);
    
    let configContent = fs.readFileSync(configPath, 'utf8');
    
    // Update program ID
    configContent = configContent.replace(
        /export const UNIVERSAL_NFT_PROGRAM_ID = '[^']*'/,
        `export const UNIVERSAL_NFT_PROGRAM_ID = '${deploymentInfo.programId}'`
    );
    
    // Update program state PDA
    configContent = configContent.replace(
        /export const PROGRAM_STATE_PDA = '[^']*'/,
        `export const PROGRAM_STATE_PDA = '${deploymentInfo.programStatePda}'`
    );
    
    // Update deployment info
    const deploymentInfoSection = `
// Program Information
export const DEPLOYMENT_INFO = {
  programId: '${deploymentInfo.programId}',
  programStatePda: '${deploymentInfo.programStatePda}',
  cluster: 'devnet',
  deployedAt: '${deploymentInfo.deployedAt}',
  initialized: ${deploymentInfo.initialized || false},
  authority: '${deploymentInfo.authority || ''}',
  gateway: '${deploymentInfo.gateway || 'ZETAjseVjuFsxdRxo6MmTCvqFwb3ZHUx56Co3vCmGis'}',
  version: '2.0.0',
  status: 'DEPLOYED',
  features: [
    'Cross-chain NFT transfers via ZetaChain',
    'Universal token ID system',
    'Origin tracking across chains',
    'Metaplex-compatible metadata',
    'Comprehensive error handling',
    'Real-time logging and monitoring'
  ]
};`;
    
    // Replace or add deployment info
    if (configContent.includes('export const DEPLOYMENT_INFO')) {
        configContent = configContent.replace(
            /export const DEPLOYMENT_INFO = \{[^}]*\};/s,
            deploymentInfoSection.trim() + ';'
        );
    } else {
        configContent += '\n' + deploymentInfoSection;
    }
    
    // Write updated config
    fs.writeFileSync(configPath, configContent);
    console.log('✅ Frontend config updated successfully');
    
    // Generate IDL file for frontend
    console.log('📄 Generating IDL for frontend...');
    
    const idlSourcePath = path.join('target', 'idl', 'universal_nft.json');
    const idlDestPath = path.join('frontend', 'src', 'lib', 'universal_nft.json');
    
    if (fs.existsSync(idlSourcePath)) {
        // Copy IDL to frontend
        const idlContent = fs.readFileSync(idlSourcePath, 'utf8');
        const idl = JSON.parse(idlContent);
        
        // Update program ID in IDL
        if (!idl.metadata) {
            idl.metadata = {};
        }
        idl.metadata.address = deploymentInfo.programId;
        
        // Ensure frontend lib directory exists
        const frontendLibDir = path.dirname(idlDestPath);
        if (!fs.existsSync(frontendLibDir)) {
            fs.mkdirSync(frontendLibDir, { recursive: true });
        }
        
        fs.writeFileSync(idlDestPath, JSON.stringify(idl, null, 2));
        console.log('✅ IDL copied to frontend');
        
        // Display instruction discriminators from IDL
        console.log('\n📋 IDL Instructions:');
        if (idl.instructions) {
            idl.instructions.forEach(instruction => {
                console.log(`  ${instruction.name}: ${instruction.discriminator || 'N/A'}`);
            });
        }
    } else {
        console.warn('⚠️ IDL file not found. Run anchor build first.');
    }
    
    // Update package.json scripts if needed
    const packageJsonPath = path.join('frontend', 'package.json');
    if (fs.existsSync(packageJsonPath)) {
        console.log('📦 Checking frontend package.json...');
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        
        // Add useful scripts if they don't exist
        if (!packageJson.scripts) {
            packageJson.scripts = {};
        }
        
        const newScripts = {
            'dev': 'next dev',
            'build': 'next build',
            'start': 'next start',
            'test:integration': 'node ../test-cross-chain-integration.js'
        };
        
        let updated = false;
        Object.entries(newScripts).forEach(([script, command]) => {
            if (!packageJson.scripts[script]) {
                packageJson.scripts[script] = command;
                updated = true;
            }
        });
        
        if (updated) {
            fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
            console.log('✅ Frontend package.json updated');
        }
    }
    
    console.log('\n🎉 FRONTEND CONFIGURATION COMPLETE!');
    console.log('===================================');
    console.log('Program ID:', deploymentInfo.programId);
    console.log('Config file:', configPath);
    console.log('IDL file:', idlDestPath);
    
    console.log('\n📋 Frontend is now configured with:');
    console.log('✅ Updated program ID');
    console.log('✅ Updated program state PDA');
    console.log('✅ Latest IDL file');
    console.log('✅ Deployment information');
    
    console.log('\n🚀 Ready to test frontend integration!');
}

// Test configuration
async function testConfiguration() {
    console.log('\n🧪 Testing Configuration');
    console.log('========================');
    
    const configPath = path.join('frontend', 'src', 'lib', 'config.ts');
    const idlPath = path.join('frontend', 'src', 'lib', 'universal_nft.json');
    
    // Test config file
    if (fs.existsSync(configPath)) {
        console.log('✅ Config file exists');
        const configContent = fs.readFileSync(configPath, 'utf8');
        
        // Check for required exports
        const requiredExports = [
            'UNIVERSAL_NFT_PROGRAM_ID',
            'PROGRAM_STATE_PDA',
            'DEPLOYMENT_INFO'
        ];
        
        requiredExports.forEach(exportName => {
            if (configContent.includes(exportName)) {
                console.log(`✅ ${exportName} found in config`);
            } else {
                console.log(`❌ ${exportName} missing from config`);
            }
        });
    } else {
        console.log('❌ Config file not found');
    }
    
    // Test IDL file
    if (fs.existsSync(idlPath)) {
        console.log('✅ IDL file exists');
        try {
            const idl = JSON.parse(fs.readFileSync(idlPath, 'utf8'));
            console.log(`✅ IDL is valid JSON with ${idl.instructions?.length || 0} instructions`);
            console.log(`✅ Program ID in IDL: ${idl.metadata?.address || 'N/A'}`);
        } catch (error) {
            console.log('❌ IDL file is invalid JSON');
        }
    } else {
        console.log('❌ IDL file not found');
    }
}

async function main() {
    try {
        await updateFrontendConfig();
        await testConfiguration();
    } catch (error) {
        console.error('❌ Update failed:', error);
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}

module.exports = { updateFrontendConfig, testConfiguration };