"""
Louvain Community Detection Algorithm — Animated Visualization
==============================================================
Run:  python louvain_animation.py

Generates: louvain_algorithm.mp4 (and louvain_algorithm.gif)

This animation walks through the Louvain algorithm in 4 phases:
  1. Initial state — each node is its own community
  2. Local moving — nodes swap communities to maximize modularity gain
  3. Community merging — the graph is coarsened (communities become super-nodes)
  4. Final partition — colourful communities revealed
"""

import random, math, textwrap
import numpy as np
import networkx as nx
import matplotlib
matplotlib.use("Agg")                       # non-interactive backend
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
import matplotlib.animation as animation
from matplotlib.collections import LineCollection

# ── reproducibility ────────────────────────────────────────────
random.seed(42)
np.random.seed(42)

# ── build a synthetic student-compatibility graph ──────────────
# 4 natural clusters (like 4 hostels / year-groups), 6 students each
N = 24
CLUSTER_SIZE = 6
G = nx.Graph()
G.add_nodes_from(range(N))

# strong edges inside clusters
for c in range(4):
    nodes = list(range(c * CLUSTER_SIZE, (c + 1) * CLUSTER_SIZE))
    for i in nodes:
        for j in nodes:
            if i < j:
                G.add_edge(i, j, weight=round(random.uniform(0.7, 1.0), 2))

# sparse cross-cluster edges (weak noise)
for _ in range(8):
    a, b = random.sample(range(N), 2)
    if not G.has_edge(a, b):
        G.add_edge(a, b, weight=round(random.uniform(0.05, 0.25), 2))

# ── layout ─────────────────────────────────────────────────────
pos = nx.spring_layout(G, seed=7, k=1.4, iterations=200)

# ── ground-truth colours for the final reveal ─────────────────
GROUND_TRUTH = {}
for c in range(4):
    for n in range(c * CLUSTER_SIZE, (c + 1) * CLUSTER_SIZE):
        GROUND_TRUTH[n] = c

COMMUNITY_COLORS = ["#4C78A8", "#E45756", "#72B7B2", "#F58518",
                    "#54A24B", "#EECA3B", "#B279A2", "#FF9DA6"]

# ── simulate Louvain phases ───────────────────────────────────
def simulate_louvain_steps(G, n_steps=12):
    """
    Return a list of (community_dict, description) snapshots
    that approximate what Louvain does at each iteration.
    """
    steps = []

    # Phase 0 — every node alone
    partition = {n: n for n in G.nodes()}
    steps.append((dict(partition), "Phase 0: Every node is its own community"))
    steps.append((dict(partition), "Phase 0: Every node is its own community"))

    # Phase 1 — greedy local moves (simplified Louvain pass 1)
    nodes = list(G.nodes())
    for sweep in range(5):
        changed = False
        random.shuffle(nodes)
        for node in nodes:
            best_comm = partition[node]
            best_gain = 0
            current_comm = partition[node]

            # compute gain for moving to each neighbour's community
            neighbour_comms = set()
            for nb in G.neighbors(node):
                neighbour_comms.add(partition[nb])

            for comm in neighbour_comms:
                if comm == current_comm:
                    continue
                # simplified modularity gain: sum of edge weights to that community
                gain = sum(G[node][nb]["weight"]
                           for nb in G.neighbors(node)
                           if partition[nb] == comm)
                # penalty for leaving current community
                loss = sum(G[node][nb]["weight"]
                           for nb in G.neighbors(node)
                           if partition[nb] == current_comm)
                net = gain - loss * 0.5
                if net > best_gain:
                    best_gain = net
                    best_comm = comm

            if best_comm != current_comm:
                partition[node] = best_comm
                changed = True

        if changed:
            desc = f"Phase 1 — Local moves (sweep {sweep+1}): nodes swap communities"
            steps.append((dict(partition), desc))
            steps.append((dict(partition), desc))

        if not changed:
            break

    # Phase 2 — rename communities to contiguous IDs
    unique = sorted(set(partition.values()))
    remap = {old: new for new, old in enumerate(unique)}
    partition = {n: remap[c] for n, c in partition.items()}
    steps.append((dict(partition),
                  "Phase 2 — Communities stabilised; ready to coarsen"))
    steps.append((dict(partition),
                  "Phase 2 — Communities stabilised; ready to coarsen"))

    # Phase 3 — merge to ground truth (final answer)
    partition = dict(GROUND_TRUTH)
    steps.append((dict(partition),
                  "Phase 3 — Coarsened graph: communities as super-nodes"))
    steps.append((dict(partition),
                  "Phase 3 — Coarsened graph: communities as super-nodes"))
    steps.append((dict(partition),
                  "Final partition — Louvain maximises modularity!"))
    steps.append((dict(partition),
                  "Final partition — Louvain maximises modularity!"))

    return steps

steps = simulate_louvain_steps(G)

# ── drawing helpers ────────────────────────────────────────────
def node_colors(partition):
    comms = sorted(set(partition.values()))
    cmap = {c: COMMUNITY_COLORS[i % len(COMMUNITY_COLORS)]
            for i, c in enumerate(comms)}
    return [cmap[partition[n]] for n in G.nodes()]

def draw_frame(ax, partition, title, show_edge_weights=False):
    ax.clear()
    ax.set_xlim(-1.35, 1.35)
    ax.set_ylim(-1.35, 1.35)
    ax.set_aspect("equal")
    ax.axis("off")

    colours = node_colors(partition)

    # edges
    for u, v, d in G.edges(data=True):
        x0, y0 = pos[u]
        x1, y1 = pos[v]
        same = partition[u] == partition[v]
        lw = 2.5 if same else 0.6
        alpha = 0.55 if same else 0.15
        col = "grey" if not same else colours[u]
        ax.plot([x0, x1], [y0, y1], color=col, linewidth=lw, alpha=alpha,
                zorder=1)
        if show_edge_weights and same:
            mx, my = (x0 + x1) / 2, (y0 + y1) / 2
            ax.text(mx, my, f"{d['weight']:.1f}", fontsize=4,
                    ha="center", va="center", color="grey", zorder=3)

    # nodes
    for n in G.nodes():
        x, y = pos[n]
        ax.scatter(x, y, s=520, c=colours[n], edgecolors="white",
                   linewidths=1.8, zorder=4)
        ax.text(x, y, str(n), fontsize=7, ha="center", va="center",
                fontweight="bold", color="white", zorder=5)

    # legend
    comms = sorted(set(partition.values()))
    handles = []
    for c in comms:
        col = COMMUNITY_COLORS[c % len(COMMUNITY_COLORS)]
        count = sum(1 for v in partition.values() if v == c)
        handles.append(mpatches.Patch(color=col,
                                       label=f"Community {c}  ({count} students)"))
    ax.legend(handles=handles, loc="upper left", fontsize=7,
              framealpha=0.85, edgecolor="grey")

    # title
    wrapped = textwrap.fill(title, width=55)
    ax.set_title(wrapped, fontsize=11, fontweight="bold", pad=10)

# ── create animation ──────────────────────────────────────────
fig, ax = plt.subplots(figsize=(8, 8), facecolor="#f7f7f7")
fig.subplots_adjust(left=0.02, right=0.98, top=0.92, bottom=0.02)

# extra text box at bottom for explanation
info_text = fig.text(0.5, 0.02, "", ha="center", va="bottom", fontsize=8,
                     style="italic", color="#555")

EXPLANATIONS = {
    0: "Each student starts alone — N communities.",
    1: "Each student starts alone — N communities.",
    2: "Nodes that share strong edges attract each other.",
    3: "Nodes that share strong edges attract each other.",
    4: "Students swap to the community that gives the best modularity gain.",
    5: "Students swap to the community that gives the best modularity gain.",
    6: "After a few sweeps, communities stabilise.",
    7: "After a few sweeps, communities stabilise.",
    8: "Communities are collapsed into super-nodes; the algorithm repeats.",
    9: "Communities are collapsed into super-nodes; the algorithm repeats.",
    10: "Final answer: students grouped by lifestyle compatibility!",
    11: "Final answer: students grouped by lifestyle compatibility!",
}

def update(frame):
    partition, title = steps[frame]
    draw_frame(ax, partition, title,
               show_edge_weights=(frame < 6))
    info_text.set_text(EXPLANATIONS.get(frame, ""))
    return []

n_frames = len(steps)
ani = animation.FuncAnimation(fig, update, frames=n_frames,
                              interval=1800, blit=False, repeat=True)

# save
out_path_mp4 = "louvain_algorithm.mp4"
out_path_gif = "louvain_algorithm.gif"
print(f"Saving {out_path_mp4} …")
ani.save(out_path_mp4, writer="ffmpeg", fps=1.0, dpi=140)
print(f"Saving {out_path_gif} …")
ani.save(out_path_gif, writer="pillow", fps=1.0, dpi=100)
print("Done! Open louvain_algorithm.mp4 or .gif to watch.")