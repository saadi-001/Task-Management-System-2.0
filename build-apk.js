const { spawnSync, execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log("==============================================================");
console.log("TMS - Automated Cloud APK Build & Download");
console.log("==============================================================\n");

const rootDir = __dirname;
const mobileDir = path.join(rootDir, 'mobile');

if (!fs.existsSync(mobileDir)) {
    console.error("❌ Error: Could not find 'mobile' directory. Please run from the project root.");
    process.exit(1);
}

process.chdir(mobileDir);

// 1. Check Login

console.log("Checking Expo login status...");
try {
    execSync('eas.cmd whoami', { stdio: 'ignore' });
    console.log("? Logged in successfully.\n");
} catch (e) {
    console.error("\n? Error: You are not logged in to Expo.");
    console.error("Please run 'eas login' manually in your terminal, then try again.\n");
    process.exit(1);
}

// 2. Start Build
console.log("==============================================================");
console.log("Initiating Cloud Build for APK. This will take a few minutes...");
console.log("Please do not close this window until the process is finished.\n");

const buildRes = spawnSync('eas.cmd', ['build', '-p', 'android', '--profile', 'preview'], { stdio: 'inherit', shell: true });

if (buildRes.status !== 0) {
    console.error("\n❌ Error: EAS Build failed or was interrupted.");
    process.exit(1);
}

console.log("\n✅ Build finished on Expo servers. Fetching artifact URL...");

// 3. Fetch URL and Download
try {
    // using eas.cmd is faster and has less warnings than npx
    const listOutput = execSync('eas.cmd build:list --limit 1 --status finished --platform android --json', { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'ignore'] });
    
    // Safe extraction of the JSON array
    const jsonMatch = listOutput.match(/\[\s*\{.*\}\s*\]/s);
    if (!jsonMatch) {
        console.error("DEBUG output from EAS CLI:", listOutput);
        throw new Error("Could not parse build list output as JSON.");
    }

    const builds = JSON.parse(jsonMatch[0]);
    
    if (builds && builds.length > 0 && builds[0].artifacts && builds[0].artifacts.buildUrl) {
        const apkUrl = builds[0].artifacts.buildUrl;
        console.log(`🔗 Artifact URL found: ${apkUrl}`);
        
        const buildsDir = path.join(mobileDir, 'builds');
        if (!fs.existsSync(buildsDir)) {
            fs.mkdirSync(buildsDir, { recursive: true });
        }
        
        let filename = 'TMS.apk';
        let apkPath = path.join(buildsDir, filename);
        if (fs.existsSync(apkPath)) {
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            filename = `TMS_${timestamp}.apk`;
            apkPath = path.join(buildsDir, filename);
            console.log(`⚠️ TMS.apk already exists. Saving as ${filename}`);
        }

        console.log(`\n⏳ Downloading APK to ${apkPath} ...\n`);
        
        // Use curl.exe specifically to avoid powershell alias issues, -L follows redirects
        execSync(`curl.exe -L -o "${apkPath}" "${apkUrl}"`, { stdio: 'inherit' });
        
        if (fs.existsSync(apkPath)) {
            const stats = fs.statSync(apkPath);
            if (stats.size > 0) {
                console.log("\n==============================================================");
                console.log("✅ APK BUILD COMPLETED SUCCESSFULLY");
                console.log("==============================================================");
                console.log(`APK saved at:\n${apkPath}\n`);
                
                // Open folder
                execSync(`explorer.exe "${buildsDir}"`);
            } else {
                console.error("\n❌ Error: APK downloaded but file size is 0 bytes.");
                fs.unlinkSync(apkPath);
            }
        } else {
             console.error("\n❌ Error: Failed to save the downloaded APK.");
        }
    } else {
        console.error("\n❌ Error: Could not find build URL in EAS history. It might have failed or not produced an APK.");
    }
} catch (err) {
    console.error("\n❌ Error retrieving build artifacts:");
    console.error(err.message);
}
