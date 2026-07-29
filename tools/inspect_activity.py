#!/usr/bin/env python3
"""
inspect_activity.py — one-time diagnostic. Dumps the raw Garmin fields for the
four featured-race activities so per-race metrics (HR, cadence, stride, steps,
calories, training effect, VO2, max pace, time-in-zone) can be emitted from the
pipeline instead of hand-authored.

Run:  python3 tools/inspect_activity.py
Then: paste the output back so the exact field names can be wired up.
"""
import sys, os
sys.path.insert(0, os.path.dirname(__file__))
from parse_garmin import load_activities

FEATURED = {
    "22249863855": "Asheville Marathon",
    "20795217749": "Fonta Flora 50K",
    "17710808922": "Mistletoe Half",
    "17152917951": "Salem Lake 30K",
}

ID_KEYS = ("activityId", "activityIdStr", "beginTimestamp", "activity_id")


def get_id(a):
    for k in ID_KEYS:
        if a.get(k) is not None:
            return str(a[k])
    return None


def main():
    acts = load_activities()
    print(f"Loaded {len(acts)} activities.\n")

    found = {}
    for a in acts:
        aid = get_id(a)
        if aid in FEATURED:
            found[aid] = a

    if not found:
        # id field name unknown — show the keys of one activity so we can find it
        print("No featured activity matched by id. Keys on a sample activity:")
        for k in sorted(acts[0].keys()):
            v = acts[0][k]
            if isinstance(v, (int, float, str, bool)) or v is None:
                print(f"  {k}: {v}")
        return

    for aid, name in FEATURED.items():
        a = found.get(aid)
        print("=" * 72)
        print(f"{name}   (id {aid})")
        print("=" * 72)
        if not a:
            print("  NOT FOUND\n")
            continue
        # scalar fields only (skip large nested structures)
        for k in sorted(a.keys()):
            v = a[k]
            if isinstance(v, (int, float, str, bool)) or v is None:
                print(f"  {k}: {v}")
        print()


if __name__ == "__main__":
    main()
