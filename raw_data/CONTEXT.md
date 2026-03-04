# raw_data — Context

## Purpose
Contains the **original source data** obtained from the Victorian Government DataVic portal. These files are the immutable upstream inputs to the entire pipeline.

## Contents

| File | Format | Description |
|------|--------|-------------|
| `original_scats_data_oct_2006.xlsx` | Excel | Unmodified SCATS signal volume data as downloaded from DataVic |
| `modified_scats_data_oct_2006.xlsx` | Excel | Manually corrected version: coordinate fixes, column renames, or header cleanup |
| `modified_scats_data_oct_2006.csv` | CSV | CSV export of the modified Excel file — this is the **actual pipeline input** |

## Data Schema (CSV columns)

| Column | Type | Description |
|--------|------|-------------|
| `SCATS Number` | int | Unique intersection identifier (traffic signal controller ID) |
| `Location` | str | Approach-level label, e.g. `WARRIGAL_RD_N_of_TOORAK_RD` |
| `Date` | date | Observation date (Oct 2006 range) |
| `NB_LATITUDE` | float | Latitude of the SCATS site |
| `NB_LONGITUDE` | float | Longitude of the SCATS site |
| `V00`–`V95` | int | Traffic volume for each 15-min interval (96 columns = 24 h × 4 intervals/h) |

## Key Facts
- **Domain**: City of Boroondara, Melbourne, Victoria, Australia
- **Temporal scope**: October 2006 (with some November gaps to be predicted)
- **Granularity**: 15-minute intervals → `interval_id` 0–95 per day per location
- **Missingness**: Some locations have full days missing — handled downstream by the inference pipeline

## Downstream Usage
`src/data_preprocessing/clean_data.py` reads `modified_scats_data_oct_2006.csv` as its entry point and produces `processed_data/preprocessed_data/cleaned_data.csv`.

## Do Not Modify
These files represent the raw ground truth. Any corrections must be versioned and documented; never overwrite silently.
