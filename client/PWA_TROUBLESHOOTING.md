# PWA Install Troubleshooting Guide

## Why "Install App" Might Not Be Working

### 1. **HTTPS Requirement**
- PWAs require HTTPS in production (or localhost for development)
- If testing on a network IP (not localhost), the browser won't show the install prompt
- **Solution**: Use `http://localhost:5173` instead of `http://192.168.x.x:5173`

### 2. **Browser Support**
- Chrome/Edge: Full support
- Firefox: Limited support (may not show install prompt)
- Safari: iOS Safari supports "Add to Home Screen" but not the install prompt API
- **Solution**: Test in Chrome or Edge for best results

### 3. **PWA Requirements Not Met**
The browser checks these requirements:
- ✅ Valid manifest.json (configured in vite.config.js)
- ✅ Service worker registered (handled by vite-plugin-pwa)
- ✅ HTTPS or localhost
- ✅ Icons provided (192x192 and 512x512)
- ✅ User has interacted with the site

### 4. **Already Installed**
- If the app is already installed, the prompt won't appear
- **Check**: Look for the app in your installed apps or browser menu

### 5. **Development Mode Issues**
- In dev mode, the service worker might not register properly
- **Solution**: 
  1. Build the app: `npm run build`
  2. Preview: `npm run preview`
  3. Or test in production build

## How to Test PWA Installation

### Step 1: Build the App
```bash
cd client
npm run build
```

### Step 2: Preview Production Build
```bash
npm run preview
```

### Step 3: Open in Chrome
- Navigate to `http://localhost:4173` (or the preview port)
- Open Chrome DevTools (F12)
- Go to "Application" tab
- Check "Manifest" section - should show UniEvent manifest
- Check "Service Workers" section - should show registered worker

### Step 4: Test Install Prompt
- The install button should appear in the address bar
- Or click the "Install app" button in the UI
- The `beforeinstallprompt` event should fire

## Common Issues and Fixes

### Issue: Install button is disabled
**Cause**: `beforeinstallprompt` event hasn't fired yet
**Fix**: 
- Wait a few seconds after page load
- Check browser console for errors
- Ensure you're on localhost or HTTPS

### Issue: "Install prompt becomes available when supported"
**Cause**: Browser doesn't support PWA install or requirements not met
**Fix**:
- Use Chrome/Edge browser
- Ensure manifest is valid
- Check service worker is registered

### Issue: Service worker not registering
**Fix**:
1. Clear browser cache
2. Unregister old service workers in DevTools → Application → Service Workers
3. Hard refresh (Ctrl+Shift+R)
4. Rebuild the app

## Manual Installation (Chrome/Edge)

If the prompt doesn't appear, you can manually install:

1. Click the menu (three dots) in Chrome
2. Look for "Install UniEvent" option
3. Or go to Settings → Apps → Install this site as an app

## Debugging Steps

1. **Check Console for Errors**
   ```javascript
   // Open browser console and check for:
   - Service worker registration errors
   - Manifest errors
   - beforeinstallprompt event
   ```

2. **Verify Manifest**
   - Open DevTools → Application → Manifest
   - Should show "UniEvent - Personalized Event Planning"
   - Check all icons are loaded

3. **Check Service Worker**
   - DevTools → Application → Service Workers
   - Should show "activated and running"
   - If not, click "Update" or "Unregister" and refresh

4. **Test Install Prompt Event**
   ```javascript
   // In browser console:
   window.addEventListener('beforeinstallprompt', (e) => {
     console.log('Install prompt available!', e);
   });
   ```

## Production Deployment

For production, ensure:
- ✅ HTTPS is enabled
- ✅ Manifest is accessible at `/manifest.webmanifest`
- ✅ Service worker is registered
- ✅ Icons are properly sized and accessible
- ✅ Start URL is correct

## Current Configuration

- **Manifest Name**: UniEvent - Personalized Event Planning
- **Short Name**: UniEvent
- **Theme Color**: #1e3a8a
- **Icons**: 192x192, 512x512, maskable
- **Service Worker**: Auto-update enabled
- **Cache Strategy**: NetworkFirst for API, CacheFirst for assets

