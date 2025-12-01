#!/usr/bin/env node

/**
 * Build Script for TharwahChat Web Component
 * Combines all modules into a single distribution file
 */

const fs = require('fs');
const path = require('path');

const SRC_DIR = __dirname;
const DIST_DIR = path.join(SRC_DIR, 'dist');

// Create dist directory if it doesn't exist
if (!fs.existsSync(DIST_DIR)) {
  fs.mkdirSync(DIST_DIR, { recursive: true });
}

// Files to combine in order
const files = [
  'styles/loader.js',
  'core/TharwahChatCore.js',
  'renderers/VanillaRenderer.js',
  'renderers/AssistantUIRenderer.js',
  'TharwahChatWebComponent.js',
  'TharwahChatBootstrap.js'
];

// Header for the distribution file
const header = `/**
 * TharwahChat Web Component
 * Universal chat widget for all frameworks
 *
 * @version 1.0.0
 * @author Tharwah
 * @license MIT
 *
 * Usage:
 * <tharwah-chat api-key="your-key" bot-id="1"></tharwah-chat>
 * <script src="tharwah-chat-webcomponent.js"></script>
 */

(function(window, document) {
  'use strict';

`;

// Footer for the distribution file
const footer = `
})(window, document);
`;

console.log('🔨 Building TharwahChat Web Component...');

try {
  let combinedContent = header;

  // Combine all files
  files.forEach(file => {
    const filePath = path.join(SRC_DIR, file);
    const content = fs.readFileSync(filePath, 'utf8');

    // Remove IIFE wrapper from individual files since we're wrapping everything
    const cleanedContent = content
      .replace(/^\(function\(window[^\)]*\)\{[\s\S]*?'use strict';\s*/, '')
      .replace(/\}\)\([^\)]*\);?\s*$/, '')
      .trim();

    combinedContent += '\n\n  // ========== ' + file.toUpperCase() + ' ==========\n\n';
    combinedContent += cleanedContent;
    combinedContent += '\n';
  });

  combinedContent += footer;

  const distFiles = [
    { name: 'tharwah-chat-webcomponent.js', content: combinedContent },
    { name: 'TharwahChat-V1.js', content: combinedContent }
  ];

  distFiles.forEach(({ name, content }) => {
    const outputPath = path.join(DIST_DIR, name);
    fs.writeFileSync(outputPath, content);
  });

  const distPath = path.join(DIST_DIR, 'tharwah-chat-webcomponent.js');

  // Get file size
  const stats = fs.statSync(distPath);
  const sizeKB = (stats.size / 1024).toFixed(1);

  console.log('✅ Build successful!');
  console.log(`📦 Output: ${distPath}`);
  console.log(`📊 Size: ${sizeKB} KB`);
  console.log('\n📋 Files combined:');
  files.forEach(file => console.log(`   - ${file}`));

  // Also create a minified version (simple minification)
  console.log('\n🗜️  Creating minified version...');

  let minifiedContent = combinedContent
    .replace(/\/\*[\s\S]*?\*\//g, '') // Remove block comments
    .replace(/\/\/.*$/gm, '') // Remove line comments
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .replace(/;\s*}/g, '}') // Remove unnecessary semicolons
    .replace(/;\s*else/g, '; else') // Fix else statements
    .trim();

  const minifiedFiles = [
    { name: 'tharwah-chat-webcomponent.min.js', content: minifiedContent },
    { name: 'TharwahChat-V1.min.js', content: minifiedContent }
  ];

  minifiedFiles.forEach(({ name, content }) => {
    const outputPath = path.join(DIST_DIR, name);
    fs.writeFileSync(outputPath, content);
  });

  const minifiedPath = path.join(DIST_DIR, 'tharwah-chat-webcomponent.min.js');

  const minifiedStats = fs.statSync(minifiedPath);
  const minifiedSizeKB = (minifiedStats.size / 1024).toFixed(1);
  const compressionRatio = ((1 - minifiedStats.size / stats.size) * 100).toFixed(1);

  console.log('✅ Minified version created!');
  console.log(`📦 Output: ${minifiedPath}`);
  console.log(`📊 Size: ${minifiedSizeKB} KB (${compressionRatio}% compression)`);

  // Create package.json for easy distribution
  const packageJson = {
    name: 'tharwah-chat-webcomponent',
    version: '1.0.0',
    description: 'Universal chat widget Web Component for Tharwah',
    main: 'tharwah-chat-webcomponent.js',
    files: [
      'tharwah-chat-webcomponent.js',
      'tharwah-chat-webcomponent.min.js',
      'TharwahChat-V1.js',
      'TharwahChat-V1.min.js'
    ],
    keywords: [
      'chat',
      'web-component',
      'tharwah',
      'universal',
      'widget',
      'css',
      'styles'
    ],
    author: 'Tharwah',
    license: 'MIT',
    repository: {
      type: 'git',
      url: 'https://github.com/tharwah/chat-widget'
    },
    homepage: 'https://tharwah.com',
    style: 'styles/main.css'
  };

  fs.writeFileSync(
    path.join(DIST_DIR, 'package.json'),
    JSON.stringify(packageJson, null, 2)
  );

  console.log('\n📋 Distribution files created:');
  console.log(`   - tharwah-chat-webcomponent.js (${sizeKB} KB)`);
  console.log(`   - tharwah-chat-webcomponent.min.js (${minifiedSizeKB} KB)`);
  console.log(`   - package.json`);
  console.log('\n🎉 Ready for distribution!');

  console.log('\n📚 Usage options:');
  console.log('1. Single file (self-contained):');
  console.log('   <script src="tharwah-chat-webcomponent.min.js"></script>');
  console.log('2. Separate styles (better performance):');
  console.log('   <script src="tharwah-chat-webcomponent.min.js"></script>');
  console.log('   <link rel="stylesheet" href="styles/main.css">');

} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}