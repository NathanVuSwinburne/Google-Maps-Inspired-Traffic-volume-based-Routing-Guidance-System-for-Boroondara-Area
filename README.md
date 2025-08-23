# 🚦 AI-Powered Traffic Route Guidance System (Boroondara 2006)

An **end-to-end traffic prediction & routing** project that fuses **deep learning time-series forecasting** with **heuristic graph search** to deliver **congestion-aware routes**.  
Built on **real-world SCATS traffic signal volume data (City of Boroondara, 2006)** from the Victorian Government DataVic portal.

<p align="left">
  <img alt="Python" src="https://img.shields.io/badge/Python-3.10+-blue">
  <img alt="Streamlit" src="https://img.shields.io/badge/Streamlit-app-red">
  <img alt="TensorFlow" src="https://img.shields.io/badge/TensorFlow-Deep%20Learning-orange">
  <img alt="License" src="https://img.shields.io/badge/License-MIT-green">
</p>

---

## ✨ Key Features

- **Time-Series ML**: LSTM, GRU, BiLSTM, CNN-BiLSTM, CNN-BiGRU (TensorFlow/Keras).
- **Feature Engineering**: Lag features (15m/1h/1d), sin/cos encodings (DoW/ToD), weekend & gap flags, location embeddings, baseline averages.
- **Heuristic Routing**: A*, UCS, BFS, DFS, GBFS, Fringe Search; **Haversine** heuristic; **travel-time weighted edges** from ML predictions.
- **Interactive App**: Streamlit + Folium with **color-coded congestion maps**, multi-model/multi-algorithm comparisons, sub-10s responses on complex routes.
- **Robustness**: 10+ structured system tests (isolated nodes, long routes, rush hour vs off-peak, date bounds).

---

## 📊 Results (Boroondara 2006)

| Model        | MAE    | RMSE   | R²     |
|--------------|--------|--------|--------|
| LSTM         | 13.16  | 18.88  | 0.9521 |
| GRU          | 13.51  | 18.63  | 0.9534 |
| BiLSTM       | 12.64  | 18.42  | 0.9544 |
| CNN-BiLSTM   | 16.87  | 11.25  | 0.9617 |
| **CNN-BiGRU**| **16.83** | **11.23** | **0.9620** |

> **Takeaway:** Hybrid CNN-BiGRU delivers **lowest RMSE** & **highest R²**, capturing peaks and fluctuations more reliably while remaining efficient.

---

## 🗺️ Data

- **Source**: Victorian Government **DataVic** — Traffic Signal Volume Data  
  https://discover.data.vic.gov.au/dataset/traffic-signal-volume-data
- **Scope**: **City of Boroondara**, **Oct–Nov 2006**, **15-minute intervals** (SCATS sites).
- **Note**: Historical, geographically bounded dataset → realistic **missingness**, **seasonality**, **domain constraints**.

---

## 🧰 Tech Stack

- **Python**: pandas, NumPy, scikit-learn, **TensorFlow/Keras**
- **App & Viz**: **Streamlit**, **Folium**, Matplotlib
- **Algorithms**: LSTM/GRU/BiLSTM, CNN-BiLSTM, CNN-BiGRU; **A\***, UCS, BFS, DFS, GBFS, Fringe
- **Other**: Haversine, StandardScaler, early stopping, LR scheduling, checkpointing

---


## 🌐 Live Demo

You can try out the system here:  
👉 [Google Maps Inspired AI-Powered Traffic Route Guidance System](https://traffic-based-route-guidance-system.streamlit.app/)

⚠️ *Note*: The app is hosted on **Streamlit Cloud**, so if you’re the first visitor in a while, it may take **2–3 minutes (cold start)** to spin up. Thanks for your patience! Once it’s loaded, everything should run smoothly 🚀.



---
## 📦 Installation

```bash
git clone https://github.com/NathanVuSwinburne/Traffic-volume-based-Routing-Guidance-System-for-Boroondara-Area.git
pip install -r requirements.txt
streamlit run app.py

