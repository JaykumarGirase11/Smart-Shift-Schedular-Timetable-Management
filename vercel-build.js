// This is a custom build script for Vercel deployment
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('⚙️ Starting Vercel custom build process...');

// Ensure we're in the frontend directory
const frontendDir = __dirname;
console.log(`📁 Working in directory: ${frontendDir}`);

// Delete any unexpected backend files that might have been copied to frontend
const filesToCheck = [
  path.join(frontendDir, 'src', 'index.ts'),
  path.join(frontendDir, 'src', 'routes'),
  path.join(frontendDir, 'src', 'models')
];

filesToCheck.forEach(filePath => {
  try {
    if (fs.existsSync(filePath)) {
      console.log(`🗑️ Removing unexpected file/dir: ${filePath}`);
      if (fs.lstatSync(filePath).isDirectory()) {
        fs.rmdirSync(filePath, { recursive: true });
      } else {
        fs.unlinkSync(filePath);
      }
    }
  } catch (err) {
    console.error(`❌ Error checking/removing ${filePath}:`, err.message);
  }
});

try {
  // Install dependencies if node_modules doesn't exist
  if (!fs.existsSync(path.join(frontendDir, 'node_modules'))) {
    console.log('📦 Installing dependencies...');
    execSync('npm install', { stdio: 'inherit', cwd: frontendDir });
  }

  // Run the build
  console.log('🏗️ Building the React application...');
  execSync('npm run build', { stdio: 'inherit', cwd: frontendDir });
  
  console.log('✅ Build completed successfully!');
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}