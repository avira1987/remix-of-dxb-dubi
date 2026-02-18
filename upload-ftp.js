import { Client } from 'basic-ftp';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const FTP_CONFIG = {
    host: 'services.gen2.chabokan.net',
    user: 'react-t5biio',
    password: 'zyn59aKVyNuO',
    port: 21
};

const DIST_FOLDER = path.join(__dirname, 'dist');

async function uploadDirectory(client, localDir, remoteDir = '/') {
    console.log(`📁 Uploading directory: ${localDir} -> ${remoteDir}`);
    
    try {
        // Ensure remote directory exists
        await client.ensureDir(remoteDir);
        
        const items = fs.readdirSync(localDir, { withFileTypes: true });
        
        for (const item of items) {
            const localPath = path.join(localDir, item.name);
            const remotePath = path.join(remoteDir, item.name).replace(/\\/g, '/');
            
            if (item.isDirectory()) {
                await uploadDirectory(client, localPath, remotePath);
            } else {
                console.log(`  📄 Uploading: ${item.name}`);
                await client.uploadFrom(localPath, remotePath);
            }
        }
        
        console.log(`✅ Completed: ${remoteDir}`);
    } catch (error) {
        console.error(`❌ Error uploading ${localDir}:`, error.message);
        throw error;
    }
}

async function uploadToFTP() {
    const client = new Client();
    
    try {
        console.log('🔌 Connecting to FTP server...');
        await client.access(FTP_CONFIG);
        console.log('✅ Connected successfully!');
        
        console.log('\n🚀 Starting upload process...\n');
        
        // Upload all files from dist folder
        await uploadDirectory(client, DIST_FOLDER, '/');
        
        console.log('\n✨ Upload completed successfully!');
        
    } catch (error) {
        console.error('❌ Upload failed:', error.message);
        process.exit(1);
    } finally {
        client.close();
    }
}

uploadToFTP();
