# DeWeb Deployment Configuration

This file contains the configuration for deploying AutoRoll to Massa's DeWeb.

## DeWeb.json Configuration

```json
{
  "name": "autoroll-payroll",
  "description": "Smart Payroll System on Massa Blockchain",
  "version": "1.0.0",
  "website": {
    "domain": "autoroll.massa",
    "index": "index.html",
    "assets": "./dist"
  },
  "metadata": {
    "author": "AutoRoll Team",
    "tags": ["payroll", "defi", "autonomous", "massa"],
    "category": "finance"
  }
}
```

## Deployment Steps

1. **Build the frontend:**
   ```bash
   cd frontend
   npm run build
   ```

2. **Install massa-web CLI:**
   ```bash
   npm install -g @massalabs/massa-web
   ```

3. **Deploy to DeWeb:**
   ```bash
   massa-web deploy ./frontend/dist
   ```

4. **Verify deployment:**
   - Check the returned DeWeb URL
   - Test all functionality in the live environment

## DeWeb Features Used

- **Static File Hosting**: HTML, CSS, JavaScript files
- **Custom Domain**: autoroll.massa (if available)
- **Decentralized Storage**: All files stored on Massa network
- **No Server Required**: Fully client-side application

## Post-Deployment Checklist

- [ ] Verify wallet connection works
- [ ] Test contract interaction
- [ ] Check responsive design
- [ ] Validate all user flows
- [ ] Update documentation with live URL

## Troubleshooting DeWeb

1. **Build Issues**: Ensure all TypeScript compiles without errors
2. **Asset Loading**: Check relative paths in HTML/CSS
3. **Wallet Integration**: Verify Massa Wallet compatibility
4. **Contract Calls**: Test with both buildnet and mainnet

## DeWeb Advantages for AutoRoll

- **Decentralized**: No single point of failure
- **Censorship Resistant**: Cannot be taken down
- **Cost Effective**: No ongoing hosting fees
- **Integrated**: Native integration with Massa ecosystem
