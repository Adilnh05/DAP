## Packages
framer-motion | Complex page transitions and step animations
recharts | Data visualization for risk dashboards and metrics
clsx | Utility for constructing className strings conditionally
tailwind-merge | Utility for merging Tailwind CSS classes
lucide-react | Icon set (already in base but ensuring version consistency)

## Notes
- Uploads use FormData (multipart/form-data) to /api/datasets/upload
- PII Detection visualization requires mapping confidence scores to UI elements
- Anonymization configuration needs a complex form state managing rules per column
- Job polling is required for checking anonymization status
