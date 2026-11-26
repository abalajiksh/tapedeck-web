/* The Linux packages, as the openSUSE Build Service publishes them.
 *
 * Hand-maintained against the OBS project home:abksh:tapedeck — the Jenkins
 * job in the app repo publishes a version there on every release tag, but the
 * list of repositories only changes when packaging/obs/ in the app repo does.
 * If a repository is added or dropped on OBS, change it here too: the download
 * tree at BASE is the thing to check against. */

export const BASE = 'https://download.opensuse.org/repositories/home:/abksh:/tapedeck';
export const OBS_PACKAGE = 'https://build.opensuse.org/package/show/home:abksh:tapedeck/tapedeck';
export const ONE_CLICK =
	'https://software.opensuse.org/download.html?project=home:abksh:tapedeck&package=tapedeck';

// Every repository is signed by the parent project's key — home:abksh, not
// home:abksh:tapedeck — so this is the same on every distribution.
export const KEY_FPR = 'A61C52E4D6143F8B39BFC36A3DDBB9C7336FE66A';
export const KEY_FPR_SPACED = KEY_FPR.match(/.{4}/g).join(' ');

/** Each distribution is a section on /install/. `repos` are the OBS
 *  repository names; more than one gets a picker, and `commands(repo)`
 *  produces the terminal lines for whichever is selected. */
export const DISTROS = [
	{
		id: 'opensuse',
		name: 'openSUSE',
		repos: [
			{ label: 'Tumbleweed', repo: 'openSUSE_Tumbleweed', arch: 'x86_64' },
			{ label: 'Tumbleweed on ARM', repo: 'openSUSE_Factory_ARM', arch: 'aarch64' },
			{ label: 'Leap 16.0', repo: '16.0', arch: 'x86_64, aarch64' }
		],
		commands: (repo) => [
			`sudo zypper addrepo ${BASE}/${repo}/home:abksh:tapedeck.repo`,
			'sudo zypper refresh',
			'sudo zypper install tapedeck'
		],
		note: "zypper asks whether to trust the repository key on the refresh. Check the fingerprint against the one at the foot of this page, then answer a to trust it always. openSUSE's rctapedeck shortcut is installed too."
	},
	{
		id: 'fedora',
		name: 'Fedora',
		repos: [
			{ label: 'Fedora 44', repo: 'Fedora_44', arch: 'x86_64, aarch64' },
			{ label: 'Fedora 43', repo: 'Fedora_43', arch: 'x86_64, aarch64' },
			{ label: 'Rawhide', repo: 'Fedora_Rawhide', arch: 'x86_64' }
		],
		commands: (repo) => [
			`sudo dnf config-manager addrepo --from-repofile=${BASE}/${repo}/home:abksh:tapedeck.repo`,
			'sudo dnf install tapedeck'
		],
		note: 'This is the dnf5 syntax Fedora has shipped since 41. dnf asks to import the repository key on the first install; the fingerprint is at the foot of this page.'
	},
	{
		id: 'debian',
		name: 'Debian',
		repos: [{ label: 'Debian 13 “trixie”', repo: 'Debian_13', arch: 'amd64, arm64' }],
		commands: (repo) => [
			`sudo curl -fsSL ${BASE}/${repo}/Release.key -o /etc/apt/keyrings/tapedeck.asc`,
			`echo "deb [signed-by=/etc/apt/keyrings/tapedeck.asc] ${BASE}/${repo}/ /" | sudo tee /etc/apt/sources.list.d/tapedeck.list`,
			'sudo apt update',
			'sudo apt install tapedeck'
		],
		note: 'Raspberry Pi OS on trixie is Debian 13, so a Pi running the 64-bit image takes the arm64 package as it is — nothing to compile on the Pi. The key is trusted for this one repository only, rather than dropped into trusted.gpg.d where apt would accept it for all of them. Debian 12 is not built: its Rust is older than the 1.88 Tapedeck needs.'
	},
	{
		id: 'ubuntu',
		name: 'Ubuntu',
		repos: [{ label: 'Ubuntu 26.04', repo: 'xUbuntu_26.04', arch: 'amd64' }],
		commands: (repo) => [
			`sudo curl -fsSL ${BASE}/${repo}/Release.key -o /etc/apt/keyrings/tapedeck.asc`,
			`echo "deb [signed-by=/etc/apt/keyrings/tapedeck.asc] ${BASE}/${repo}/ /" | sudo tee /etc/apt/sources.list.d/tapedeck.list`,
			'sudo apt update',
			'sudo apt install tapedeck'
		],
		note: '22.04 and 24.04 are not built — their Rust is older than the 1.88 Tapedeck needs. On those, build from source.'
	},
	{
		id: 'arch',
		name: 'Arch Linux',
		repos: [{ label: 'Arch', repo: 'Arch', arch: 'x86_64' }],
		commands: (repo) => [
			`curl -fsSL ${BASE}/${repo}/x86_64/home_abksh_tapedeck_Arch.key | sudo pacman-key --add -`,
			`sudo pacman-key --lsign-key ${KEY_FPR}`,
			`printf '\\n[home_abksh_tapedeck_Arch]\\nServer = ${BASE}/${repo}/$arch\\n' | sudo tee -a /etc/pacman.conf`,
			'sudo pacman -Syu tapedeck'
		],
		note: 'The section name has to be home_abksh_tapedeck_Arch exactly — pacman looks for a database file of that name. The fingerprint in the second line is the key OBS signs with; the first line only fetches it, and nothing trusts it until the second.'
	}
];

/** Where the package puts things. Paths are the same on every distribution. */
export const PATHS = [
	['/usr/bin/tapedeck', 'The binary, with the web UI embedded'],
	['/etc/tapedeck/tapedeck.env', 'Infrastructure settings, read by the service. Kept across upgrades'],
	['/var/lib/tapedeck', 'Databases, the credential key tapedeck.key, uploaded scans'],
	['/var/log/tapedeck', 'Log files, alongside the journal'],
	['/usr/share/doc/tapedeck/env.example', 'Every setting there is, and what it is for']
];

/* The container images, as .github/workflows/docker.yml publishes them.
 *
 * Shipped in Tapedeck v0.134.0; the Postgres image joined it in v0.135.0. The
 * workflow runs on the GitHub mirror rather than in Jenkins — a v* tag
 * reaching it builds each backend on each architecture natively and joins the
 * two digests per backend under that backend's tags.
 *
 * Keep BACKENDS in step with the workflow, not with whatever the latest
 * release happens to be: `latest`, `postgres` and the two-part series tags
 * move on their own, so only the shape documented here has to be right. The
 * moving Postgres tag is `:postgres`, not `:latest-postgres`. */
export const DOCKER = {
	image: 'ghcr.io/abalajiksh/tapedeck',
	registry: 'https://github.com/abalajiksh/tapedeck/pkgs/container/tapedeck',
	arches: 'linux/amd64, linux/arm64',
	run: [
		'docker run -d --name tapedeck -p 8080:8080 \\',
		'  -v tapedeck-data:/data \\',
		'  -e MUSICBRAINZ_CONTACT=you@your.domain \\',
		'  ghcr.io/abalajiksh/tapedeck'
	],
	/* One image per backend, from the same Dockerfile: the backend is fixed when
	 * the binary is compiled, so it cannot be a runtime switch. */
	backends: [
		{
			name: 'SQLite',
			lede: 'The default, and the whole install — one container, one volume, no database to run beside it.',
			tags: [
				['latest', 'The newest release. Moves on every stable tag'],
				['0.135', 'The series. Takes patch releases, never a new minor'],
				['0.135.0', 'Exactly that release, and it never moves']
			]
		},
		{
			name: 'Postgres',
			lede: 'For an existing Postgres, or several users on one. It needs DATABASE_URL and a database beside it; compose.postgres.yaml in the repository runs both.',
			tags: [
				['postgres', 'The newest release. Moves on every stable tag'],
				['0.135-postgres', 'The series. Takes patch releases, never a new minor'],
				['0.135.0-postgres', 'Exactly that release, and it never moves']
			]
		}
	],
	/* Each of these is a real consequence of how the images are built, and the
	 * first two are the only ways to lose data with them. */
	notes: [
		{
			title: 'Keep the volume',
			body: 'Every path Tapedeck writes defaults onto /data — the databases, the uploads, and above all tapedeck.key, the key every stored credential is encrypted with. On the container’s own layer that key would be minted afresh by the next container and orphan every credential you had saved. Mount /data and back it up. On Postgres the history lives in the database instead, so back that up with pg_dump — and keep /data anyway, for the key.'
		},
		{
			title: 'Pick the backend at install time',
			body: 'Nothing moves a SQLite history into Postgres yet, so the Postgres image pointed at an empty database starts empty. Each image refuses the other’s URL outright rather than guessing — a Postgres build handed the image’s default sqlite: path says so and stops before it connects.'
		},
		{
			title: 'No ffmpeg in the images',
			body: 'A report Mixdown plays in the browser, but exporting one as a video needs ffmpeg, which the images deliberately do not carry. The repository README shows how to add it if you want the export.'
		},
		{
			title: 'Non-root, and health-checked',
			body: 'It runs as uid 10001 and declares a HEALTHCHECK on /health, so Docker and Kubernetes both know when it is actually up rather than merely started.'
		},
		{
			title: 'A static build on Alpine',
			body: 'musl, with the certificate roots and the time-zone database compiled in and DNS resolved in-process — no OpenSSL anywhere in the tree. The runtime image adds nothing to Alpine, which is the point: there is very little in it for a vulnerability scan to find.'
		}
	]
};
