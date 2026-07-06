#!/usr/bin/env python3
"""
locations.py — Resolve each run to (city, state, country). LABEL-FIRST design.

PRINCIPLE (settled with Remi, July 5 2026): a place label should hold the truth
of the run — ground AND intent. Garmin's own geocoder is well-grained, so we
TRUST its city label where present, resolve the STATE by coordinate (so ambiguous
name-strings like "Camden" land in the right state), fall back to nearest anchor
for unlabeled runs, and apply a small OVERRIDE table for places where Garmin's
label misrepresents the run:

  - Altadena/Pasadena : runs started in Altadena and ran into Pasadena (Rose Bowl);
                        the hybrid holds both location and intent. Garmin drifted
                        this spot's label Pasadena -> "Los Angeles County" over time.
  - Sachuest Point    : two runs Garmin called "Middletown" were actually at
                        Sachuest Point National Wildlife Refuge, RI. Ground truth.
  - Camden-Wyoming    : Garmin's ambiguous "Camden" is Camden-Wyoming, DE (NOT NJ).
  - Shanghai          : the Pudong-district run reads as Shanghai for display.

Coordinates are authoritative for STATE/COUNTRY; labels+overrides set the CITY.
"""
from math import radians, sin, cos, asin, sqrt

ASSIGN_KM = 60.0  # metro-scale; flag anything farther from every anchor

# city, state, country, lat, lon  (anchors carry the state/country truth)
ANCHORS = [
    ("Denver", "Colorado", "United States", 39.74, -104.97),
    ("Boulder", "Colorado", "United States", 40.01, -105.27),
    ("Littleton", "Colorado", "United States", 39.59, -105.01),
    ("Aurora", "Colorado", "United States", 39.81, -104.75),
    ("Cherry Hills Village", "Colorado", "United States", 39.64, -104.94),
    ("Sheridan", "Colorado", "United States", 39.65, -105.02),
    ("Rollinsville", "Colorado", "United States", 39.91, -105.63),
    ("Winston-Salem", "North Carolina", "United States", 36.10, -80.26),
    ("Asheville", "North Carolina", "United States", 35.60, -82.55),
    ("Burke County", "North Carolina", "United States", 35.76, -81.90),
    ("High Point", "North Carolina", "United States", 36.00, -79.95),
    ("Surry County", "North Carolina", "United States", 36.34, -80.46),
    ("Cambridge", "Massachusetts", "United States", 42.37, -71.11),
    ("Boston", "Massachusetts", "United States", 42.35, -71.06),
    ("Altadena", "California", "United States", 34.17, -118.12),
    ("Garden Grove", "California", "United States", 33.79, -117.92),
    ("San Diego", "California", "United States", 32.72, -117.16),
    ("San Francisco", "California", "United States", 37.78, -122.42),
    ("El Cerrito", "California", "United States", 37.90, -122.30),
    ("Camden-Wyoming", "Delaware", "United States", 39.10, -75.56),
    ("Fort Worth", "Texas", "United States", 32.72, -97.36),
    ("Ocean City", "Maryland", "United States", 38.40, -75.06),
    ("Annapolis", "Maryland", "United States", 38.98, -76.49),
    ("New York", "New York", "United States", 40.76, -73.97),
    ("Troy", "New York", "United States", 42.73, -73.69),
    ("Chicago", "Illinois", "United States", 41.89, -87.65),
    ("Nashville", "Tennessee", "United States", 36.15, -86.79),
    ("Ann Arbor", "Michigan", "United States", 42.28, -83.74),
    ("St. Louis", "Missouri", "United States", 38.61, -90.20),
    ("Pottstown", "Pennsylvania", "United States", 40.25, -75.63),
    ("Edgmont", "Pennsylvania", "United States", 39.95, -75.45),
    ("Sachuest Point", "Rhode Island", "United States", 41.49, -71.28),
    ("Albuquerque", "New Mexico", "United States", 35.18, -106.66),
    ("Fredericksburg", "Virginia", "United States", 38.30, -77.46),
    ("Lexington", "Kentucky", "United States", 38.10, -84.50),
    ("Toronto", "Ontario", "Canada", 43.69, -79.44),
    ("Niagara Falls", "Ontario", "Canada", 43.09, -79.06),
    ("Vancouver", "British Columbia", "Canada", 49.28, -123.13),
    ("Dublin", "Leinster", "Ireland", 53.33, -6.28),
    ("Galway", "Connacht", "Ireland", 53.28, -9.03),
    ("Shanghai", "Shanghai", "China", 31.24, 121.49),
    ("Suzhou", "Jiangsu", "China", 31.42, 120.89),
]

# coordinate box (lat_min, lat_max, lon_min, lon_max) -> forced city label
OVERRIDES = [
    (34.10, 34.25, -118.20, -118.05, "Altadena/Pasadena"),  # crosses city lines by intent
    (41.45, 41.53, -71.32, -71.24, "Sachuest Point"),        # not "Middletown"
    (39.05, 39.15, -75.62, -75.50, "Camden-Wyoming"),        # not NJ
    (31.15, 31.30, 121.40, 121.60, "Shanghai"),              # Pudong district
]


def _haversine(lat1, lon1, lat2, lon2):
    r = 6371.0
    dlat, dlon = radians(lat2 - lat1), radians(lon2 - lon1)
    a = sin(dlat / 2) ** 2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon / 2) ** 2
    return 2 * r * asin(sqrt(a))


def _nearest(lat, lon):
    best, bestd = None, 1e9
    for city, state, country, alat, alon in ANCHORS:
        d = _haversine(lat, lon, alat, alon)
        if d < bestd:
            best, bestd = (city, state, country), d
    return best, bestd


def resolve_place(lat, lon, garmin_label):
    """Return (city, state, country, dist_km) or None for a run with no GPS."""
    if lat is None or lon is None:
        return None
    (anchor_city, state, country), dist = _nearest(lat, lon)
    # 1) explicit override boxes win
    for la0, la1, lo0, lo1, name in OVERRIDES:
        if la0 <= lat <= la1 and lo0 <= lon <= lo1:
            return (name, state, country, dist)
    # 2) trust Garmin's city label, except vague county-level labels
    if garmin_label and garmin_label != "Los Angeles County":
        return (garmin_label, state, country, dist)
    # 3) fall back to nearest anchor city (unlabeled runs)
    return (anchor_city, state, country, dist)
