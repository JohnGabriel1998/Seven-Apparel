# 🌐 GitHub Pages Custom Domain Setup Guide

## Seven Apparel - DNS Configuration

### ✅ **ISSUE RESOLVED: Repository Structure Fixed**

The main issue was that your website files were in the `client/` folder, but GitHub Pages expects them in the root directory. This has been fixed by copying the built files to the root.

### 🔧 **DNS Configuration Steps**

Since you're getting "InvalidDNSError", follow these steps **exactly**:

#### **Step 1: DNS Records Setup**

Go to your domain registrar (where you bought seven-appareal.com) and set up these DNS records:

**For Root Domain (seven-appareal.com):**

```
Type: A
Name: @ (or leave blank)
Value: 185.199.108.153

Type: A
Name: @ (or leave blank)
Value: 185.199.109.153

Type: A
Name: @ (or leave blank)
Value: 185.199.110.153

Type: A
Name: @ (or leave blank)
Value: 185.199.111.153
```

**For WWW Subdomain (www.seven-appareal.com):**

```
Type: CNAME
Name: www
Value: johngabriel1998.github.io
```

#### **Step 2: Remove Conflicting Records**

- Delete any old A, AAAA, or CNAME records for your domain
- Remove any "forwarding" or "redirection" rules
- Make sure there are no conflicting records

#### **Step 3: Common DNS Provider Instructions**

**GoDaddy:**

1. Go to DNS Management
2. Click "Add" for each A record
3. Select "A" type, leave Host field blank, enter GitHub IPs in Points to field

**Namecheap:**

1. Go to Advanced DNS
2. Add A records with Host "@" and GitHub IPs as Value
3. Add CNAME with Host "www" and Value "johngabriel1998.github.io"

**Cloudflare:**

1. Go to DNS tab
2. Add A records with Name "@" and Content as GitHub IPs
3. Add CNAME with Name "www" and Target "johngabriel1998.github.io"

#### **Step 4: Verify DNS Propagation**

Use these tools to check if DNS is working:

- https://whatsmydns.net
- https://dnschecker.org
- Command line: `nslookup www.seven-appareal.com`

#### **Step 5: GitHub Pages Configuration**

1. Go to your repository: https://github.com/JohnGabriel1998/Seven-Apparel
2. Click Settings → Pages
3. Make sure:
   - Source: "Deploy from a branch"
   - Branch: "main"
   - Folder: "/ (root)"
   - Custom domain: "www.seven-appareal.com"
4. Wait for the green checkmark next to your domain

### 🚀 **Automated Deployment**

Use the provided `deploy-to-pages.ps1` script for future updates:

```powershell
.\deploy-to-pages.ps1
```

This script will:

1. Build your project
2. Copy files to root directory
3. Commit and push changes
4. Deploy to GitHub Pages automatically

### 🔍 **Troubleshooting**

**"DNS record could not be retrieved":**

- Double-check DNS records are exactly as specified above
- Wait 24-48 hours for full DNS propagation
- Use incognito/private browsing to avoid cache issues

**Site shows 404 error:**

- Make sure `index.html` exists in root directory ✅ (Fixed)
- Check that GitHub Pages is enabled in repository settings

**HTTPS not available:**

- Wait for DNS to fully propagate first
- GitHub will automatically provide SSL certificate once DNS is verified

### 📞 **Need Help?**

If DNS issues persist:

1. Contact your domain registrar's support
2. Show them this exact DNS configuration
3. Ask them to verify the records are set correctly

### 🎯 **Expected Timeline**

- DNS changes: 5 minutes to 48 hours
- GitHub Pages deployment: 5-10 minutes after push
- SSL certificate: Available once DNS is verified

Your site should be live at: **https://www.seven-appareal.com** once DNS propagates!
