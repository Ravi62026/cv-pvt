# Deployment Guide

This guide covers deploying ChainVerdict to various platforms and environments.

## Prerequisites

- Node.js 16+ installed
- Git installed
- Account on chosen hosting platform
- Domain name (optional)

## Environment Variables

Create a `.env` file in the frontend directory:

```env
# API Configuration
VITE_API_URL=https://api.chainverdict.com
VITE_SOCKET_URL=https://api.chainverdict.com

# External Services
VITE_RECAPTCHA_SITE_KEY=your_recaptcha_site_key
VITE_GOOGLE_ANALYTICS_ID=your_ga_id

# Feature Flags
VITE_ENABLE_BLOCKCHAIN=false
VITE_ENABLE_PAYMENTS=false
```

## Frontend Deployment

### Vercel (Recommended)

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy from project root**
   ```bash
   cd frontend
   vercel --prod
   ```

4. **Configure build settings in vercel.json**
   ```json
   {
     "builds": [
       {
         "src": "package.json",
         "use": "@vercel/static-build",
         "config": {
           "distDir": "dist"
         }
       }
     ],
     "routes": [
       {
         "handle": "filesystem"
       },
       {
         "src": "/.*",
         "dest": "/index.html"
       }
     ]
   }
   ```

### Netlify

1. **Build the project**
   ```bash
   cd frontend
   npm run build
   ```

2. **Deploy via Netlify CLI**
   ```bash
   npm install -g netlify-cli
   netlify login
   netlify deploy --prod --dir=dist
   ```

3. **Configure redirects in `public/_redirects`**
   ```
   /*    /index.html   200
   ```

### GitHub Pages

1. **Install gh-pages**
   ```bash
   cd frontend
   npm install --save-dev gh-pages
   ```

2. **Add deploy script to package.json**
   ```json
   {
     "scripts": {
       "deploy": "gh-pages -d dist"
     }
   }
   ```

3. **Build and deploy**
   ```bash
   npm run build
   npm run deploy
   ```

### AWS S3 + CloudFront

1. **Build the project**
   ```bash
   cd frontend
   npm run build
   ```

2. **Create S3 bucket**
   ```bash
   aws s3 mb s3://chainverdict-frontend
   ```

3. **Upload files**
   ```bash
   aws s3 sync dist/ s3://chainverdict-frontend --delete
   ```

4. **Configure CloudFront distribution**
   - Origin: S3 bucket
   - Default root object: index.html
   - Error pages: 404 → /index.html (for SPA routing)

## Backend Deployment (Future)

### Heroku

1. **Create Heroku app**
   ```bash
   heroku create chainverdict-api
   ```

2. **Set environment variables**
   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set MONGODB_URI=your_mongodb_uri
   heroku config:set JWT_SECRET=your_jwt_secret
   ```

3. **Deploy**
   ```bash
   git push heroku main
   ```

### Railway

1. **Install Railway CLI**
   ```bash
   npm install -g @railway/cli
   ```

2. **Login and deploy**
   ```bash
   railway login
   railway deploy
   ```

### DigitalOcean App Platform

1. **Create app.yaml**
   ```yaml
   name: chainverdict-api
   services:
   - name: api
     source_dir: backend
     github:
       repo: yourusername/chainverdict
       branch: main
     run_command: npm start
     environment_slug: node-js
     instance_count: 1
     instance_size_slug: basic-xxs
     envs:
     - key: NODE_ENV
       value: production
   ```

2. **Deploy via CLI or web interface**

## Database Setup

### MongoDB Atlas

1. **Create cluster**
   - Go to MongoDB Atlas
   - Create new cluster
   - Choose region and tier

2. **Configure network access**
   - Add IP addresses
   - Create database user

3. **Get connection string**
   ```
   mongodb+srv://username:password@cluster.mongodb.net/chainverdict
   ```

### Local MongoDB

1. **Install MongoDB**
   ```bash
   # macOS
   brew install mongodb-community

   # Ubuntu
   sudo apt-get install mongodb
   ```

2. **Start MongoDB**
   ```bash
   mongod --dbpath /path/to/data/directory
   ```

## SSL/TLS Configuration

### Let's Encrypt (Free SSL)

1. **Install Certbot**
   ```bash
   sudo apt-get install certbot
   ```

2. **Generate certificate**
   ```bash
   sudo certbot certonly --standalone -d chainverdict.com
   ```

3. **Configure auto-renewal**
   ```bash
   sudo crontab -e
   # Add: 0 12 * * * /usr/bin/certbot renew --quiet
   ```

## Domain Configuration

### DNS Settings

```
Type    Name    Value                   TTL
A       @       your_server_ip          300
A       www     your_server_ip          300
CNAME   api     api.chainverdict.com    300
```

### Subdomain Setup

- **Frontend**: chainverdict.com
- **API**: api.chainverdict.com
- **Admin**: admin.chainverdict.com
- **Docs**: docs.chainverdict.com

## Performance Optimization

### CDN Configuration

1. **CloudFlare Setup**
   - Add domain to CloudFlare
   - Configure caching rules
   - Enable minification
   - Set up page rules

2. **AWS CloudFront**
   - Create distribution
   - Configure origins
   - Set cache behaviors
   - Configure error pages

### Caching Strategy

```javascript
// Service Worker caching
const CACHE_NAME = 'chainverdict-v1';
const urlsToCache = [
  '/',
  '/static/css/main.css',
  '/static/js/main.js'
];
```

## Monitoring Setup

### Application Monitoring

1. **Sentry for Error Tracking**
   ```bash
   npm install @sentry/react
   ```

2. **Google Analytics**
   ```javascript
   // Add GA tracking code
   gtag('config', 'GA_MEASUREMENT_ID');
   ```

### Infrastructure Monitoring

1. **Uptime monitoring**
   - UptimeRobot
   - Pingdom
   - StatusCake

2. **Performance monitoring**
   - New Relic
   - DataDog
   - AppDynamics

## Backup Strategy

### Database Backups

1. **Automated MongoDB backups**
   ```bash
   mongodump --uri="mongodb://..." --out=/backup/$(date +%Y%m%d)
   ```

2. **S3 backup storage**
   ```bash
   aws s3 sync /backup/ s3://chainverdict-backups/
   ```

### File Backups

1. **User uploads backup**
2. **Configuration backups**
3. **SSL certificate backups**

## Security Checklist

- [ ] HTTPS enabled
- [ ] Security headers configured
- [ ] Environment variables secured
- [ ] Database access restricted
- [ ] API rate limiting enabled
- [ ] Input validation implemented
- [ ] File upload restrictions
- [ ] Regular security updates

## Rollback Strategy

### Blue-Green Deployment

1. **Maintain two environments**
   - Blue (current production)
   - Green (new version)

2. **Switch traffic gradually**
   ```bash
   # Route 10% traffic to green
   # Monitor metrics
   # Route 100% traffic to green
   ```

### Database Migration Rollback

1. **Backup before migration**
2. **Test rollback procedures**
3. **Document rollback steps**

## Troubleshooting

### Common Issues

1. **Build failures**
   - Check Node.js version
   - Clear npm cache
   - Verify dependencies

2. **Deployment failures**
   - Check environment variables
   - Verify build output
   - Check deployment logs

3. **Runtime errors**
   - Check application logs
   - Verify API connectivity
   - Check database connection

### Debug Commands

```bash
# Check build output
npm run build -- --verbose

# Test production build locally
npm run preview

# Check environment variables
printenv | grep VITE_

# Test API connectivity
curl -I https://api.chainverdict.com/health
```
