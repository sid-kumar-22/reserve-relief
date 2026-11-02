# ReServe Relief

A responsive, static frontend for discovering surplus food and free community meals. It is inspired by the supplied ReServe Relief reference page and is ready to host on GitHub Pages.

## Run locally

Open `index.html` in a browser, or serve this folder with any static web server. There is no build step or package install.

## GitHub Pages

The workflow in `.github/workflows/pages.yml` publishes the site from the repository root when changes land on `main`. In the repository settings, set **Pages → Build and deployment → Source** to **GitHub Actions**.

## Demo behavior

Meal search, filters, list/map views, partner forms, reservations, pickup passes, and sponsorship dialogs run in the browser. Payment and onboarding are demo flows; no payment is taken and form details are not sent to a server. Connect these interactions to production services before using them with real customers.
