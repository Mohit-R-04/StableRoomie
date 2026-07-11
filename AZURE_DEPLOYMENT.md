# StableRoomie - Azure Deployment Guide

This guide describes how to deploy the entire **StableRoomie** application stack (PostgreSQL database, Spring Boot Java backend, and Flask Python microservice) onto a single Linux Virtual Machine on **Microsoft Azure** using your **Azure for Students** credits.

---

## Prerequisites
1. An active Azure account (Access the [Azure Portal](https://portal.azure.com)).
2. A Google Cloud Console project with OAuth credentials set up.

---

## Step 1: Create a Linux Virtual Machine on Azure

1. Log into the [Azure Portal](https://portal.azure.com).
2. Click **Create a resource** and select **Virtual machine** (or search for "Virtual machines" in the top search bar).
3. Fill in the **Basics** tab:
   * **Subscription:** Select your Azure for Students subscription.
   * **Resource Group:** Click *Create new* (e.g., `stableroomie-rg`).
   * **Virtual machine name:** `stableroomie-server`.
   * **Region:** Select a region close to you (e.g., `East US` or `South India`).
   * **Availability options:** No infrastructure redundancy required.
   * **Security type:** Standard.
   * **Image:** `Ubuntu Server 22.04 LTS - x64 Gen2` (or `Ubuntu Server 20.04 LTS`).
   * **Size:** Select `Standard_B1ms` (2 GB RAM) or `Standard_B2s` (4 GB RAM, recommended). B-series VMs are very cost-efficient.
4. **Administrator account:**
   * **Authentication type:** Select **SSH public key** (recommended) or **Password**.
   * **Username:** `azureuser` (or a username of your choice).
   * If using SSH public key, select **Generate new key pair** and note down the key pair name.
5. **Inbound port rules:**
   * **Public inbound ports:** Allow selected ports.
   * **Select inbound ports:** Select **SSH (22)**. (We will add the other ports in the next step).
6. Click **Review + create**, and when validation passes, click **Create**.
7. If prompted, download the private key file (`.pem`) to your local machine and keep it secure.

---

## Step 2: Configure Network Ports (Firewall) on Azure

Once the VM is created, we need to allow web traffic to ports `8080` (Java backend) and `5000` (Flask API):

1. Go to your Virtual Machine in the Azure portal.
2. In the left-hand menu, under **Settings**, click on **Networking** (or **Network settings**).
3. Click on **Add inbound port rule**:
   * **Source:** Any
   * **Source port ranges:** `*`
   * **Destination:** Any
   * **Service:** Custom
   * **Destination port ranges:** `8080,5000`
   * **Protocol:** TCP
   * **Action:** Allow
   * **Priority:** `1010` (or any value below 65000)
   * **Name:** `Allow_Web_Ports`
4. Click **Add**.

---

## Step 3: SSH into your Virtual Machine

Open a terminal on your local computer and run:

```bash
# 1. Set read-only permissions on the private key file
chmod 400 /path/to/your/downloaded-key.pem

# 2. Connect to the VM using its Public IP address (found on the VM overview page in Azure)
ssh -i /path/to/your/downloaded-key.pem azureuser@<VM_PUBLIC_IP>
```

---

## Step 4: Clone the Project and Run the Deployment Script

Once logged into your Azure VM terminal, execute the following commands to install Docker and prepare the deployment:

```bash
# 1. Clone your repository (replace with your actual GitHub URL)
git clone https://github.com/<your-username>/StableRoomie.git

# 2. Navigate to the project root
cd StableRoomie

# 3. Make the deploy script executable and run it
chmod +x deploy/deploy-azure.sh
./deploy/deploy-azure.sh
```

The script will update the system, install Docker/Docker Compose, and generate a template `.env` file for you.

---

## Step 5: Configure Credentials and Start the App

1. Open the `.env` file to configure your real Google OAuth Credentials:
   ```bash
   nano .env
   ```
2. Replace `your_real_google_client_id` and `your_real_google_client_secret` with your actual Google OAuth keys.
3. Save and close the editor (Press `Ctrl+O`, `Enter`, and then `Ctrl+X`).
4. Start the stack:
   ```bash
   docker compose up -d --build
   ```

To verify the services are running, run `docker compose ps`. The app will be accessible at:
* Java Backend: `http://<VM_PUBLIC_IP>:8080`
* Flask API: `http://<VM_PUBLIC_IP>:5000`

---

## Step 6: Update Google OAuth Redirect URIs

You must authorize your new VM's Public IP/Domain in the Google Cloud Console so users can log in:

1. Go to the [Google Cloud Console Credentials Page](https://console.cloud.google.com/apis/credentials).
2. Edit your OAuth 2.0 Web Client.
3. Under **Authorized JavaScript origins**, add:
   * `http://<VM_PUBLIC_IP>:8080`
4. Under **Authorized redirect URIs**, add:
   * `http://<VM_PUBLIC_IP>:8080/login/oauth2/code/google`
5. Click **Save**. Note that Google can take a few minutes to apply redirect changes.
