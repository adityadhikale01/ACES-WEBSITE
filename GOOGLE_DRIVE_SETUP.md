# ACES KBTCOE — Google Drive API Media Integration Guide

This guide documents the architecture, configuration steps, and security guidelines for integrating Google Drive as a secondary or auxiliary media asset store for the **ACES KBTCOE** departmental website.

---

## 1. Architecture Overview

```
               ┌────────────────────────────────────────────────────────┐
               │              ACES KBTCOE Web Application               │
               └──────────────────────────┬─────────────────────────────┘
                                          │
                  ┌───────────────────────┴───────────────────────┐
                  ▼                                               ▼
     ┌────────────────────────┐                      ┌────────────────────────┐
     │  Cloudinary CDN Engine │                      │    Google Drive API    │
     │  (Optimized Delivery)  │                      │   (Auxiliary Archive)  │
     └────────────────────────┘                      └────────────────────────┘
```

1. **Cloudinary CDN (Primary):** Serves real-time optimized, responsive, modern WebP/AVIF images and streaming video clips directly to students and visitors.
2. **Google Drive API (Auxiliary/Archive):** Allows departmental faculty coordinators and student media leads to synchronize raw, high-resolution DSLR photos directly from Google Drive folders without needing to upload gigabytes through web forms.

---

## 2. Google Cloud Platform (GCP) Setup Steps

### Step 1: Create a Google Cloud Project
1. Navigate to the [Google Cloud Console](https://console.cloud.google.com/).
2. Click **Select a project** > **New Project**.
3. Set **Project Name** to: `ACES-KBTCOE-Media`.
4. Click **Create**.

### Step 2: Enable the Google Drive API
1. In the GCP Console navigation menu, go to **APIs & Services** > **Library**.
2. Search for **Google Drive API**.
3. Select it and click **Enable**.

### Step 3: Create a Service Account
1. Go to **APIs & Services** > **Credentials**.
2. Click **Create Credentials** > **Service Account**.
3. Provide service account details:
   - **Service account name**: `aces-drive-uploader`
   - **Service account ID**: `aces-drive-uploader@aces-kbtcoe-media.iam.gserviceaccount.com`
   - **Description**: `ACES KBTCOE automated gallery media sync agent`
4. Click **Create and Continue**, then click **Done**.

### Step 4: Generate Service Account Key (JSON)
1. In the **Service Accounts** list, click on the newly created service account.
2. Go to the **Keys** tab > **Add Key** > **Create new key**.
3. Select **JSON** and click **Create**.
4. A `.json` credentials file will download to your machine.
5. **Security Precaution:** Never commit this JSON file to version control. Keep it in `server/credentials/google-service-account.json` (which is included in `.gitignore`).

---

## 3. Google Drive Folder Delegation

To grant the service account read and upload access to the club's Google Drive folder:

1. Open [Google Drive](https://drive.google.com/) with the departmental club account (`aces.kbtcoe@gmail.com`).
2. Create a dedicated folder: `ACES Website Gallery Media`.
3. Right-click the folder > **Share**.
4. In the "Add people or groups" field, paste the **Service Account Email**:
   ```
   aces-drive-uploader@aces-kbtcoe-media.iam.gserviceaccount.com
   ```
5. Set permission role to **Editor** (to allow both reading and uploading).
6. Copy the **Folder ID** from the browser URL:
   ```
   https://drive.google.com/drive/folders/1aBcDeFgHiJkLmNoPqRsTuVwXyZ123456
                                           └─── THIS IS YOUR FOLDER_ID ───┘
   ```

---

## 4. Environment Variables Configuration

Add the following keys to your `server/.env` file:

```env
# Google Drive API Auxiliary Integration
GOOGLE_DRIVE_FOLDER_ID="1aBcDeFgHiJkLmNoPqRsTuVwXyZ123456"
GOOGLE_APPLICATION_CREDENTIALS="credentials/google-service-account.json"
```

---

## 5. Security & Best Practices

1. **Least Privilege:** Limit the Service Account's access only to the dedicated `ACES Website Gallery Media` folder. Do not grant access to institution-wide folders.
2. **Access Control:** Do not expose raw Google Drive file IDs or service account tokens to frontend visitors.
3. **Caching:** Always cache fetched asset URLs to avoid hitting Google Drive API rate limits (12,000 queries/minute per project).
