<h1 align="center">NodePay</h1>
<p align="center">
Networkless Peer-to-Peer Digital Payments
</p>

<p align="center">
Digital payments that work even when the internet doesn't.
</p>

<p align="center">
Device-to-Device • Mesh Networking • Offline Tokens • Cryptographic Security
</p>

<p align="center">
<img src="https://img.shields.io/badge/status-research-blue">
<img src="https://img.shields.io/badge/type-protocol-green">
<img src="https://img.shields.io/badge/network-mesh-orange">
<img src="https://img.shields.io/badge/payments-offline-purple">
</p>

# Why?

Current digital payment systems depend on:

* Internet connectivity
* Centralized servers
* Banking infrastructure

When connectivity fails, digital payments stop working.

NodePay proposes an alternative architecture where **devices communicate directly** and exchange value securely.

---

# Traditional Payment Model

```
Sender Device
      ↓
Internet
      ↓
Payment Gateway
      ↓
Bank Server
      ↓
Receiver Device
```

---

# NodePay Model (Networkless)

```
Sender Device
      ↓
Bluetooth / NFC
      ↓
Receiver Device
```

For larger distances, payments propagate through **mesh routing**.

```
Device A → Device B → Device C → Device D
```

Each device acts as a **network node and wallet**.

---

# Core Features

• Offline peer-to-peer payments
• Device-to-device communication
• Mesh routing for extended range
• Secure digital token transfer
• Cryptographic transaction verification
• Offline ledger storage
• Synchronization when connectivity returns

---

# System Architecture

```
+-----------------------------------+
|             Mobile UI             |
|   Wallet balance / send payment   |
+-----------------------------------+
|            Wallet Engine          |
|   Token storage and management    |
+-----------------------------------+
|         Transaction Manager       |
|    Create & verify transactions   |
+-----------------------------------+
|         Mesh Routing Engine       |
|   Multi-hop device communication  |
+-----------------------------------+
|        Bluetooth / NFC Layer      |
|   Device-to-device connectivity   |
+-----------------------------------+
|           Security Module         |
|    Cryptographic verification     |
+-----------------------------------+
```

Each device functions as:

* Wallet
* Transaction processor
* Network node

---

# Digital Token Lifecycle

```
Token Minting
      ↓
Stored in Wallet
      ↓
Token Transfer
      ↓
Receiver Verification
      ↓
Ledger Update
      ↓
Bank Synchronization
```

Transactions can occur **fully offline**, with reconciliation happening later.

---

# Offline Payment Protocol

Transaction flow:

1. Device discovery
2. Secure key exchange
3. Transaction packet creation
4. Packet transmission
5. Signature verification
6. Local ledger storage

Example transaction packet:

```
Transaction Packet

Sender ID
Receiver ID
Token Amount
Timestamp
Digital Signature
Checksum
```

---

# Mesh Routing Model

When devices are not directly connected, payments can travel through nearby nodes.

```
       Node B
       /   \
Node A     Node C
       \   /
       Node D
```

This creates a **distributed payment network** without centralized infrastructure.

---

# Security Model

NodePay protects against several threats.

### Double Spending

Prevented through token verification and ledger reconciliation.

### Replay Attacks

Mitigated using timestamps and nonce values.

### Malicious Nodes

Detected using cryptographic signatures.

---

# Prototype Architecture

A working prototype can be built using:

Mobile Devices

* Android / iOS wallet application
* Bluetooth Low Energy
* Secure cryptographic libraries

Relay Nodes

* Raspberry Pi mesh nodes
* Transaction relay and storage

```
Phone Wallet App
      ↓
Bluetooth / NFC
      ↓
Raspberry Pi Relay Node
      ↓
Local Ledger
      ↓
Internet Sync Server
```

Relay nodes extend network coverage and enable delayed synchronization.

---

# Potential Applications

• Disaster-resilient payments
• Rural financial inclusion
• Military communication networks
• Offline commerce
• Autonomous device-to-device transactions

---

# Project Status

This repository currently contains:

* system architecture
* protocol design
* research documentation

Future updates may include **prototype implementations and simulations**.

---

# Author

C. Kumaran
Computer Science – Data Science
VIT Chennai

---

# License

MIT License
