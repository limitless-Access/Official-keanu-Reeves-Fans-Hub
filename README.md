# Official Keanu Reeves Fans Hub

Static site for **GitHub Pages** + **JSONBin** (no Cloudflare needed).

Includes:
- Main website (`index.html`)
- Admin dashboard (`admin.html`) — password: `202030`
- All membership / form pages
- Direct JSONBin connection

---

## 1. JSONBin setup (required)

1. Go to https://jsonbin.io and log in  
2. Open your bin (or create one)  
3. Set the bin to:
   - **Public read** = ON  
   - **Public write** = ON  
4. Put this starter content in the bin (or leave `{}`):

```json
{
  "applications": [],
  "payments": [],
  "quizScores": [],
  "accessCodes": [],
  "gift_photos": [],
  "messages": []
}
```

5. Copy your **Bin ID**

6. Edit these two files and put your Bin ID:
   - `assets/jsonbin-config.js`
   - `jsonbin-config.js`

```js
window.JSONBIN_CONFIG = {
  binId: "YOUR_BIN_ID_HERE"
};
window.HUB_PROXY_URL = "";
```

---

## 2. Deploy on GitHub Pages

1. Create a new GitHub repository (example name: `keanu-fans-hub`)
2. Upload **all files in this folder** into the repo (not inside another folder)
3. On GitHub:
   - **Settings** → **Pages**
   - Source: **Deploy from a branch**
   - Branch: `main` (or `master`), folder: `/ (root)`
   - Save
4. Wait 1–2 minutes
5. Your site URL will be like:
   `https://YOUR_USERNAME.github.io/keanu-fans-hub/`

---

## 3. Admin

Open:
`https://YOUR_USERNAME.github.io/keanu-fans-hub/admin.html`

Password: **`202030`**

Submit a test form on the site, then refresh Admin — it should appear under Applications / Payments.

---

## 4. Notes

- No Master Key is stored in these files (safe for public GitHub).
- Public write means anyone who knows the Bin ID could write data. For stronger security later, add a Cloudflare/Vercel proxy.
- If forms do not save, check: Bin ID is correct + Public Write is ON.
