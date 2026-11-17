# Mirador Arbolino

A responsive Spanish-language website presenting Mirador Arbolino, a nature accommodation project in Ulloa, Huila, Colombia. It introduces the treehouse and cabin, the surrounding landscape, experiences, and WhatsApp enquiries.

## Technologies

- HTML5 for page structure and accessible content.
- CSS3 for responsive layouts, typography, transitions, and visual styling.
- Vanilla JavaScript for navigation, media controls, and enquiry interactions.
- Local images, SVG graphics, and MP4 video.
- Google Fonts (DM Sans and Italiana), plus links to WhatsApp and Google Maps.

The CSS and JavaScript are embedded in `dist/index.html`. This is a static website: no framework, package manager, build step, or database is required by this copy.

## Project structure

```text
mirador-arbolino/
├── dist/
│   ├── index.html       # HTML, embedded CSS, and JavaScript
│   └── assets/          # Images, SVG graphics, and video
├── .gitignore
└── README.md
```

`dist/` is the editable website source in this repository and is intentionally tracked.

## Run locally

Install Python 3, open a terminal in the project folder, and run:

```sh
python3 -m http.server 8000 --directory dist
```

Visit http://localhost:8000. Press Ctrl+C to stop the server. You can also use the Visual Studio Code Live Server extension to serve `dist/`.

Local assets are included. Google Fonts, WhatsApp, and Google Maps require an internet connection. Enquiry interactions open WhatsApp; this repository does not provide a reservation backend.

## Development in Visual Studio Code

Open this repository folder in Visual Studio Code. Edit `dist/index.html` and add or replace resources in `dist/assets/`, preserving the paths used by the page. Refresh the local browser preview to check your changes, including mobile layouts and enquiry links.

Before starting a new work session, synchronize your local branch:

```sh
git pull --ff-only origin main
```

After reviewing and testing your changes:

```sh
git status
git diff
git add dist README.md .gitignore
git diff --cached
git commit -m "Describe the website update"
git push origin main
```

Review new files for secrets before staging. Keep passwords, tokens, service credentials, and local environment files out of Git.

## Hosting and original export

To host this website separately, serve the contents of `dist/` on a static hosting provider. No deployment automation is configured here. Pushing to this repository does not update the existing ChatGPT Sites publication.

This development copy was prepared from the original downloaded project. Historical `deployment*.tar.gz` archives and the original Sites configuration are backed up separately and excluded from this repository. The original download is preserved. No Supabase database changes are required or performed.

## Rights

No open-source license is granted by this repository. Confirm the rights to project code, branding, and media before redistributing them.
