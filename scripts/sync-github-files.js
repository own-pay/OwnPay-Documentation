const fs = require('fs');
const path = require('path');
const https = require('https');

const REPO_OWNER = 'own-pay';
const REPO_NAME = 'OwnPay';
const BRANCH = 'main';

const filesToSync = [
  {
    remotePath: 'CHANGELOG.md',
    localPath: 'user-guide/changelog.mdx',
    docUrl: '/user-guide/changelog'
  },
  {
    remotePath: 'docs/ARCHITECTURE.md',
    localPath: 'resources/architecture.mdx',
    docUrl: '/resources/architecture'
  },
  {
    remotePath: 'docs/FEATURES.md',
    localPath: 'resources/features.mdx',
    docUrl: '/resources/features'
  },
  {
    remotePath: 'docs/LOCAL_SETUP.md',
    localPath: 'resources/local-setup.mdx',
    docUrl: '/resources/local-setup'
  },
  {
    remotePath: 'CONTRIBUTING.md',
    localPath: 'resources/contributing.mdx',
    docUrl: '/resources/contributing'
  },
  {
    remotePath: 'ROADMAP.md',
    localPath: 'resources/roadmap.mdx',
    docUrl: '/resources/roadmap'
  },
  {
    remotePath: 'docs/TRANSLATIONS.md',
    localPath: 'developer/translations.mdx',
    docUrl: '/developer/translations'
  }
];

function fetchRawContent(remotePath) {
  const url = `https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/${BRANCH}/${remotePath}`;
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`Failed to fetch ${url} - Status Code: ${res.statusCode}`));
        return;
      }
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => resolve(body));
    }).on('error', reject);
  });
}

function extractFrontmatter(filePath) {
  if (!fs.existsSync(filePath)) {
    return '';
  }
  const content = fs.readFileSync(filePath, 'utf8');
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (match) {
    return match[0] + '\n\n';
  }
  return '';
}

function normalizePosixPath(p) {
  return p.replace(/\\/g, '/');
}

function rewriteMarkdownLinks(markdownContent, remoteFilePath) {
  // Matches markdown links [text](url)
  return markdownContent.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, text, url) => {
    // Ignore absolute URLs and anchor links
    if (/^(?:https?:\/\/|mailto:|#)/i.test(url)) {
      return match;
    }

    // Parse base directory of the remote file
    const remoteDir = path.posix.dirname(remoteFilePath);
    
    // Join and normalize path to get relative file location in the main repo
    const joinedPath = path.posix.join(remoteDir === '.' ? '' : remoteDir, url);
    const resolvedPath = path.posix.normalize(joinedPath);

    // Check if the resolved path corresponds to a synced documentation file
    const matchingSyncFile = filesToSync.find(f => f.remotePath === resolvedPath);
    if (matchingSyncFile) {
      return `[${text}](${matchingSyncFile.docUrl})`;
    }

    // Otherwise, point it to the main GitHub repository viewer
    const githubUrl = `https://github.com/${REPO_OWNER}/${REPO_NAME}/blob/${BRANCH}/${resolvedPath}`;
    return `[${text}](${githubUrl})`;
  });
}

async function sync() {
  console.log(`Starting documentation sync from ${REPO_OWNER}/${REPO_NAME} (${BRANCH} branch)...`);
  let hasErrors = false;

  for (const file of filesToSync) {
    const localFullPath = path.resolve(__dirname, '..', file.localPath);
    try {
      console.log(`Fetching remote: ${file.remotePath}`);
      let remoteContent = await fetchRawContent(file.remotePath);

      // Extract existing frontmatter to preserve title, description, and keywords
      const frontmatter = extractFrontmatter(localFullPath);

      // Convert angle bracket links <http://...> to valid markdown links [http://...](http://...)
      remoteContent = remoteContent.replace(/<(https?:\/\/[^\s>]+)>/gi, '[$1]($1)');

      // Rewrite relative links in the markdown content to preserve link health
      remoteContent = rewriteMarkdownLinks(remoteContent, file.remotePath);

      // Remove the markdown title if it duplicates the frontmatter title
      // (Mintlify automatically renders the frontmatter title as an H1)
      if (frontmatter) {
        // Match first header e.g. "# Title" or "# What is OwnPay?"
        remoteContent = remoteContent.replace(/^#\s+.*(\r?\n)+/, '');
      }

      let finalContent = frontmatter + remoteContent;
      // Never use em-dashes — anywhere in the docs repository
      finalContent = finalContent.replace(/—/g, '-');
      
      // Ensure the directory exists
      fs.mkdirSync(path.dirname(localFullPath), { recursive: true });
      fs.writeFileSync(localFullPath, finalContent, 'utf8');
      console.log(`Successfully synced and updated: ${file.localPath}`);
    } catch (error) {
      console.error(`Error syncing ${file.remotePath}: ${error.message}`);
      hasErrors = true;
    }
  }

  if (hasErrors) {
    process.exit(1);
  } else {
    console.log('Documentation sync completed successfully!');
  }
}

sync();
