# Version Control Summary

Repository: https://github.com/chiqqo/FloraDesigner-Final

This project was developed as an individual bachelor project. The main development progress is represented through milestone commits on the `main` branch, while final documentation cleanup is prepared through a separate branch and pull request workflow.

## Development Milestones

| Commit | Milestone |
|---|---|
| `60afec1` | Initial FloraDesigner full-stack project structure |
| `9565e9f` | API documentation and backend smoke test added |
| `7c8a562` | Georgian home page copy polished |
| `f818ccb` | AI Designer chips, product image scoring, real product photos, and Georgian product catalog updates |
| `1a259fb` | AI chip Georgian labels and smoke test product count check |
| `a48f340` | English order history plural labels fixed |
| `521fbfc` | Technical report and user manual added |
| `083e546` | Bachelor defense presentation outline added |
| `371db0f` | Admin authentication strengthened with signed expiring tokens |
| `36bad4f` | Final repository link cleanup |

## Branching and Pull Request Workflow

The final submission repository uses:

- `main` - stable branch used for final submission
- `docs/version-control-summary` - documentation branch prepared for a pull request into `main`

The pull request from `docs/version-control-summary` to `main` documents the final review step before submission. It keeps source code unchanged and adds this version-control summary for evaluators.

## Review Focus

The most important parts to inspect in the repository are:

- `backend/` - Express API, MongoDB models, controllers, middleware, smoke test
- `frontend/` - React UI, cart context, language context, pages, API service
- `API_DOCUMENTATION.md` - REST endpoint documentation
- `TECHNICAL_REPORT.md` - architecture and implementation report
- `USER_MANUAL.md` - customer/admin usage guide
- `DEMO_GUIDE.md` - live demo flow

## Submission Notes

Real secrets are intentionally excluded from GitHub. The repository includes `.env.example` for configuration, while real values such as MongoDB connection strings and API keys remain local.
