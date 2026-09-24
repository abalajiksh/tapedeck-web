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
