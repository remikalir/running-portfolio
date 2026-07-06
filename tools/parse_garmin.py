#!/usr/bin/env python3
"""
parse_garmin.py — Running-portfolio data pipeline (Phase 2 rebuild).

Reads a Garmin Connect GDPR export (DI-Connect-Fitness summarizedActivities)
and produces the aggregated figures that drive run.remikalir.com.

DEFINITION OF "A RUN" (locked with Remi, July 5 2026):
    All running activity counts — outdoor 'running', 'treadmill_running',
    'indoor_running', 'track_running'. Applied uniformly across all years.
    Record begins December 2016 (first Garmin watch, gift from Ebony).

Garmin GDPR unit conventions (undocumented in the export):
    distance      : centimeters
    duration      : milliseconds
    elevationGain : centimeters
    avgSpeed      : cm/ms   (== *10 -> m/s)
    hrTimeInZone_*: milliseconds
    startTimeLocal/startTimeGmt : epoch milliseconds
"""
import json, os, glob
from datetime import datetime, timezone
from collections import defaultdict, Counter

CM_PER_MI = 160934.4
RUN_TYPES = {"running", "treadmill_running", "indoor_running", "track_running"}
FITNESS_DIR = os.path.join(os.path.dirname(__file__), "..", "raw", "Fitness", "DI-Connect-Fitness")


def load_activities():
    acts = []
    for f in sorted(glob.glob(os.path.join(FITNESS_DIR, "*summarizedActivities.json"))):
        acts += json.load(open(f))[0]["summarizedActivitiesExport"]
    return acts


def local_dt(a):
    ts = a.get("startTimeLocal") or a.get("startTimeGmt")
    return datetime.fromtimestamp(ts / 1000, tz=timezone.utc)  # local-ms as wall clock


def is_run(a):
    return a.get("activityType") in RUN_TYPES


def miles(a):
    return a.get("distance", 0) / CM_PER_MI


def hours(a):
    return a.get("duration", 0) / 3600000.0


def pace_min_per_mi(a):
    mi = miles(a)
    if mi <= 0:
        return None
    return (a.get("duration", 0) / 60000.0) / mi  # minutes per mile


def load_runs():
    # Exclude zero-distance recording artifacts (mis-fires: 0.0 mi, ~0 min).
    # They are not runs and would only pad counts; documented, reversible.
    runs = [a for a in load_activities() if is_run(a) and a.get("distance", 0) > 0]
    runs.sort(key=local_dt)
    return runs


if __name__ == "__main__":
    runs = load_runs()
    d0, d1 = local_dt(runs[0]), local_dt(runs[-1])
    tot_mi = sum(miles(a) for a in runs)
    tot_hr = sum(hours(a) for a in runs)
    print(f"Runs: {len(runs)}  |  {d0.date()} -> {d1.date()}")
    print(f"Miles: {tot_mi:,.0f}  |  Hours: {tot_hr:,.0f}")
    print("Types:", dict(Counter(a["activityType"] for a in runs)))
