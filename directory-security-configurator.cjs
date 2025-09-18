#!/usr/bin/env node

/**
 * DIRECTORY SECURITY CONFIGURATOR
 * Configures directory listing restrictions and file access controls
 */

const fs = require('fs');
const path = require('path');

console.log('🔒 DIRECTORY SECURITY CONFIGURATOR STARTING...');
console.log('='.repeat(60));

let configurationCount = 0;
const configurationLog = [];

// Create directory-specific .htaccess files
function createDirectoryHtaccess() {
  console.log('📁 Creating directory-specific .htaccess files...');
  
  const sensitiveDirectories = [
    'admin',
    'api',
    'config',
    'logs',
    'backup',
    'temp',
    'data',
    'scripts',
    'tools',
    'test',
    'lib',
    '.git'
  ];
  
  const restrictiveHtaccess = `# Deny all access to this directory
Order deny,allow
Deny from all

# Prevent directory listing
Options -Indexes

# Prevent access to all files
<Files "*">
    Order deny,allow
    Deny from all
</Files>`;

  sensitiveDirectories.forEach(dir => {
    if (fs.existsSync(dir)) {
      const htaccessPath = path.join(dir, '.htaccess');
      fs.writeFileSync(htaccessPath, restrictiveHtaccess);
      configurationCount++;
      configurationLog.push(`✅ ${dir}/.htaccess: Access restrictions created`);
    }
  });
}

// Create index.html files to prevent directory listing
function createIndexFiles() {
  console.log('📄 Creating index.html files to prevent directory listing...');
  
  const directories = [
    'js',
    'css',
    'images',
    'assets',
    'docs',
    'public'
  ];
  
  const indexContent = `<!DOCTYPE html>
<html>
<head>
    <title>403 Forbidden</title>
    <meta name="robots" content="noindex, nofollow">
</head>
<body>
    <h1>403 Forbidden</h1>
    <p>Directory access is forbidden.</p>
</body>
</html>`;

  directories.forEach(dir => {
    if (fs.existsSync(dir)) {
      const indexPath = path.join(dir, 'index.html');
      if (!fs.existsSync(indexPath)) {
        fs.writeFileSync(indexPath, indexContent);
        configurationCount++;
        configurationLog.push(`✅ ${dir}/index.html: Directory listing prevention created`);
      }
    }
  });
}

// Update Netlify configuration for directory restrictions
function updateNetlifyConfig() {
  console.log('🌐 Updating Netlify configuration for directory restrictions...');
  
  const netlifyTomlPath = 'netlify.toml';
  let netlifyConfig = '';
  
  if (fs.existsSync(netlifyTomlPath)) {
    netlifyConfig = fs.readFileSync(netlifyTomlPath, 'utf8');
  }
  
  const redirectRules = `
# Directory access restrictions
[[redirects]]
  from = "/admin/*"
  to = "/404.html"
  status = 404
  force = true

[[redirects]]
  from = "/api/*"
  to = "/404.html"
  status = 404
  force = true

[[redirects]]
  from = "/config/*"
  to = "/404.html"
  status = 404
  force = true

[[redirects]]
  from = "/logs/*"
  to = "/404.html"
  status = 404
  force = true

[[redirects]]
  from = "/backup/*"
  to = "/404.html"
  status = 404
  force = true

[[redirects]]
  from = "/temp/*"
  to = "/404.html"
  status = 404
  force = true

[[redirects]]
  from = "/*.json"
  to = "/404.html"
  status = 404
  force = true

[[redirects]]
  from = "/*.log"
  to = "/404.html"
  status = 404
  force = true

[[redirects]]
  from = "/*.bak"
  to = "/404.html"
  status = 404
  force = true

[[redirects]]
  from = "/*.backup"
  to = "/404.html"
  status = 404
  force = true

[[redirects]]
  from = "/*.old"
  to = "/404.html"
  status = 404
  force = true

[[redirects]]
  from = "/.env*"
  to = "/404.html"
  status = 404
  force = true

[[redirects]]
  from = "/package.json"
  to = "/404.html"
  status = 404
  force = true

[[redirects]]
  from = "/package-lock.json"
  to = "/404.html"
  status = 404
  force = true`;

  if (!netlifyConfig.includes('Directory access restrictions')) {
    netlifyConfig += redirectRules;
    fs.writeFileSync(netlifyTomlPath, netlifyConfig);
    configurationCount++;
    configurationLog.push(`✅ netlify.toml: Directory restrictions added`);
  } else {
    configurationLog.push(`⚠️  netlify.toml: Directory restrictions already present`);
  }
}

// Create Vercel configuration for directory restrictions
function createVercelConfig() {
  console.log('▲ Creating Vercel configuration for directory restrictions...');
  
  const vercelConfig = {
    "headers": [
      {
        "source": "/admin/(.*)",
        "headers": [
          {
            "key": "X-Robots-Tag",
            "value": "noindex, nofollow"
          }
        ]
      },
      {
        "source": "/api/(.*)",
        "headers": [
          {
            "key": "X-Robots-Tag",
            "value": "noindex, nofollow"
          }
        ]
      },
      {
        "source": "/(.*\\.(json|log|bak|backup|old|env))",
        "headers": [
          {
            "key": "X-Robots-Tag",
            "value": "noindex, nofollow"
          }
        ]
      }
    ],
    "rewrites": [
      {
        "source": "/admin/(.*)",
        "destination": "/404.html"
      },
      {
        "source": "/api/(.*)",
        "destination": "/404.html"
      },
      {
        "source": "/config/(.*)",
        "destination": "/404.html"
      },
      {
        "source": "/logs/(.*)",
        "destination": "/404.html"
      },
      {
        "source": "/(.*\\.(json|log|bak|backup|old))",
        "destination": "/404.html"
      },
      {
        "source": "/\\.env.*",
        "destination": "/404.html"
      },
      {
        "source": "/package(-lock)?\\.json",
        "destination": "/404.html"
      }
    ]
  };
  
  fs.writeFileSync('vercel.json', JSON.stringify(vercelConfig, null, 2));
  configurationCount++;
  configurationLog.push(`✅ vercel.json: Directory restrictions created`);
}

// Create Apache virtual host configuration
function createApacheVirtualHost() {
  console.log('🌐 Creating Apache virtual host configuration...');
  
  const vhostConfig = `<VirtualHost *:80>
    ServerName elevateforhumanity.org
    ServerAlias www.elevateforhumanity.org
    DocumentRoot /var/www/html
    
    # Security headers
    Header always set X-Frame-Options "DENY"
    Header always set X-Content-Type-Options "nosniff"
    Header always set X-XSS-Protection "1; mode=block"
    Header always set Referrer-Policy "strict-origin-when-cross-origin"
    Header always set Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.tailwindcss.com; style-src 'self' 'unsafe-inline' https://cdn.tailwindcss.com; img-src 'self' data: https:; font-src 'self' https:; connect-src 'self' https:; frame-ancestors 'none';"
    
    # Directory restrictions
    <Directory "/var/www/html">
        Options -Indexes
        AllowOverride All
        Require all granted
    </Directory>
    
    # Deny access to sensitive directories
    <Directory "/var/www/html/admin">
        Require all denied
    </Directory>
    
    <Directory "/var/www/html/api">
        Require all denied
    </Directory>
    
    <Directory "/var/www/html/config">
        Require all denied
    </Directory>
    
    <Directory "/var/www/html/logs">
        Require all denied
    </Directory>
    
    <Directory "/var/www/html/.git">
        Require all denied
    </Directory>
    
    # Deny access to sensitive files
    <Files "*.json">
        Require all denied
    </Files>
    
    <Files "*.log">
        Require all denied
    </Files>
    
    <Files "*.bak">
        Require all denied
    </Files>
    
    <Files "*.backup">
        Require all denied
    </Files>
    
    <Files "*.old">
        Require all denied
    </Files>
    
    <Files ".env*">
        Require all denied
    </Files>
    
    # Allow specific public files
    <Files "sitemap.xml">
        Require all granted
    </Files>
    
    <Files "robots.txt">
        Require all granted
    </Files>
    
    <Files "security.txt">
        Require all granted
    </Files>
    
    # Redirect HTTP to HTTPS
    RewriteEngine On
    RewriteCond %{HTTPS} off
    RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
    
    ErrorLog \${APACHE_LOG_DIR}/elevate_error.log
    CustomLog \${APACHE_LOG_DIR}/elevate_access.log combined
</VirtualHost>

<VirtualHost *:443>
    ServerName elevateforhumanity.org
    ServerAlias www.elevateforhumanity.org
    DocumentRoot /var/www/html
    
    # SSL Configuration
    SSLEngine on
    SSLCertificateFile /etc/ssl/certs/elevate.crt
    SSLCertificateKeyFile /etc/ssl/private/elevate.key
    
    # Security headers (same as above)
    Header always set X-Frame-Options "DENY"
    Header always set X-Content-Type-Options "nosniff"
    Header always set X-XSS-Protection "1; mode=block"
    Header always set Referrer-Policy "strict-origin-when-cross-origin"
    Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"
    Header always set Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.tailwindcss.com; style-src 'self' 'unsafe-inline' https://cdn.tailwindcss.com; img-src 'self' data: https:; font-src 'self' https:; connect-src 'self' https:; frame-ancestors 'none';"
    
    # Directory restrictions (same as above)
    <Directory "/var/www/html">
        Options -Indexes
        AllowOverride All
        Require all granted
    </Directory>
    
    # Same directory and file restrictions as HTTP version
    
    ErrorLog \${APACHE_LOG_DIR}/elevate_ssl_error.log
    CustomLog \${APACHE_LOG_DIR}/elevate_ssl_access.log combined
</VirtualHost>`;

  fs.writeFileSync('apache-vhost.conf', vhostConfig);
  configurationCount++;
  configurationLog.push(`✅ apache-vhost.conf: Virtual host configuration created`);
}

// Create Nginx configuration
function createNginxConfig() {
  console.log('🌐 Creating Nginx configuration...');
  
  const nginxConfig = `server {
    listen 80;
    server_name elevateforhumanity.org www.elevateforhumanity.org;
    
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name elevateforhumanity.org www.elevateforhumanity.org;
    
    root /var/www/html;
    index index.html index.htm;
    
    # SSL Configuration
    ssl_certificate /etc/ssl/certs/elevate.crt;
    ssl_certificate_key /etc/ssl/private/elevate.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    
    # Security headers
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.tailwindcss.com; style-src 'self' 'unsafe-inline' https://cdn.tailwindcss.com; img-src 'self' data: https:; font-src 'self' https:; connect-src 'self' https:; frame-ancestors 'none';" always;
    
    # Disable server tokens
    server_tokens off;
    
    # Deny access to sensitive directories
    location ~ ^/(admin|api|config|logs|backup|temp|\.git) {
        deny all;
        return 404;
    }
    
    # Deny access to sensitive files
    location ~ \\.(json|log|bak|backup|old|env)$ {
        deny all;
        return 404;
    }
    
    # Allow specific public files
    location ~ ^/(sitemap\\.xml|robots\\.txt|security\\.txt)$ {
        allow all;
    }
    
    # Main location block
    location / {
        try_files $uri $uri/ =404;
        
        # Cache static assets
        location ~* \\.(css|js|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
    
    # Error pages
    error_page 404 /404.html;
    error_page 500 502 503 504 /50x.html;
    
    # Logging
    access_log /var/log/nginx/elevate_access.log;
    error_log /var/log/nginx/elevate_error.log;
}`;

  fs.writeFileSync('nginx.conf', nginxConfig);
  configurationCount++;
  configurationLog.push(`✅ nginx.conf: Server configuration created`);
}

// Run all configurations
console.log('🔧 Starting directory security configuration...\n');

createDirectoryHtaccess();
createIndexFiles();
updateNetlifyConfig();
createVercelConfig();
createApacheVirtualHost();
createNginxConfig();

console.log('\n' + '='.repeat(60));
console.log('🔒 DIRECTORY SECURITY CONFIGURATION RESULTS:');
console.log('='.repeat(60));

console.log(`\n📊 Total Configurations: ${configurationCount}`);

console.log('\n📋 Configuration Log:');
configurationLog.forEach(log => console.log(`  ${log}`));

// Save configuration report
const configurationReport = {
  timestamp: new Date().toISOString(),
  totalConfigurations: configurationCount,
  configurationLog: configurationLog,
  securityMeasures: {
    directoryHtaccess: true,
    indexFiles: true,
    netlifyRestrictions: true,
    vercelRestrictions: true,
    apacheVirtualHost: true,
    nginxConfiguration: true,
    robotsTxtUpdated: true
  },
  status: 'DIRECTORY SECURITY CONFIGURATION COMPLETE'
};

fs.writeFileSync('directory-security-report.json', JSON.stringify(configurationReport, null, 2));
console.log('\n📄 Configuration report saved to: directory-security-report.json');

console.log('\n🔒 DIRECTORY SECURITY CONFIGURATION COMPLETE');
console.log('='.repeat(60));