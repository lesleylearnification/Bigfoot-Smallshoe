# GitHub Pages Deployment

## Upload

Upload the contents of this folder to the root of a GitHub repository.

The repository root should contain:

```text
index.html
404.html
.nojekyll
assets/
css/
js/
docs/
tests/
README.md
```

Do not upload the enclosing `bigfoot-smallshoe-build-6-final` folder as a single nested directory unless you intend the game to appear at that path.

## Enable Pages

1. Open the repository on GitHub.
2. Select **Settings**.
3. Select **Pages**.
4. Under **Build and deployment**, choose **Deploy from a branch**.
5. Select the `main` branch.
6. Select the `/root` folder.
7. Save.

GitHub will provide the public URL after deployment.

## Local testing

From the project folder:

```bash
python -m http.server 8000
```

Open:

```text
http://localhost:8000
```

## Automated tests

With Node.js installed:

```bash
npm test
```

No package installation is required.

## Save behavior

Progress is stored in the player's browser using localStorage. Progress does not transfer between browsers or devices.

## Sound behavior

Browsers require a user click or keypress before ambient audio can start. This is expected browser behavior.
