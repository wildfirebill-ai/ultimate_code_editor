// Script to combine and sort all extensions alphabetically
const fs = require('fs');
const path = require('path');

// Read the current ExtensionsPanel.tsx to extract existing extensions
const filePath = path.join(__dirname, '..', 'src', 'renderer', 'components', 'Sidebar', 'ExtensionsPanel.tsx');
const content = fs.readFileSync(filePath, 'utf8');

// Extract existing extensions
const extMatch = content.match(/const ALL_EXTENSIONS: ExtensionItem\[\] = \[([\s\S]*?)\];/);
if (!extMatch) {
  console.error('Could not find ALL_EXTENSIONS array');
  process.exit(1);
}

// Parse existing extensions
const existingExtStr = extMatch[1];
const existingExts = [];
const extRegex = /\{\s*id:\s*'([^']+)',\s*name:\s*'([^']+)',\s*description:\s*'([^']+)',\s*publisher:\s*'([^']+)',\s*version:\s*'([^']+)',\s*installed:\s*(true|false),\s*category:\s*'([^']+)',\s*downloads:\s*'([^']+)',\s*rating:\s*(\d+)\s*\}/g;

let match;
while ((match = extRegex.exec(existingExtStr)) !== null) {
  existingExts.push({
    id: match[1],
    name: match[2],
    description: match[3],
    publisher: match[4],
    version: match[5],
    installed: match[6] === 'true',
    category: match[7],
    downloads: match[8],
    rating: parseInt(match[9])
  });
}

console.log(`Found ${existingExts.length} existing extensions`);

// New extensions to add (200+)
const newExts = [
  // Gaming (new category)
  { id: '3fps.phaser-snippets', name: 'Phaser Snippets', description: 'Phaser.js game snippets', publisher: '3FPS', version: '0.5.0', installed: false, category: 'Gaming', downloads: '200K', rating: 4 },
  { id: 'a327ex.raylib', name: 'Raylib', description: 'Raylib game dev', publisher: 'a327ex', version: '0.2.0', installed: false, category: 'Gaming', downloads: '300K', rating: 4 },
  { id: 'alarm-bot.love2d', name: 'Love2D Support', description: 'Love2D game engine', publisher: 'alarm-bot', version: '1.0.0', installed: false, category: 'Gaming', downloads: '500K', rating: 4 },
  { id: 'beegle-gl.ogre', name: 'Ogre3D', description: 'Ogre3D engine support', publisher: 'Beegle', version: '0.1.0', installed: false, category: 'Gaming', downloads: '100K', rating: 3 },
  { id: 'beto-core.ct-js', name: 'CT.JS', description: 'CT.JS game maker', publisher: 'Beto', version: '1.0.0', installed: false, category: 'Gaming', downloads: '200K', rating: 4 },
  { id: 'dracula-theme.theme-godot', name: 'Godot Dracula', description: 'Godot Dracula theme', publisher: 'Dracula', version: '0.1.0', installed: false, category: 'Gaming', downloads: '100K', rating: 4 },
  { id: 'eskimo.pygame', name: 'Pygame', description: 'Pygame Python support', publisher: 'Eskimo', version: '0.3.0', installed: false, category: 'Gaming', downloads: '400K', rating: 4 },
  { id: 'firebelley.unity-tools', name: 'Unity Tools', description: 'Unity development tools', publisher: 'Firebelley', version: '2.1.0', installed: false, category: 'Gaming', downloads: '1M', rating: 4 },
  { id: 'gamedevs.renpy', name: 'RenPy', description: 'RenPy visual novels', publisher: 'GameDevs', version: '0.5.0', installed: false, category: 'Gaming', downloads: '300K', rating: 4 },
  { id: 'godot-ide.godot-tools', name: 'Godot IDE', description: 'Godot engine support', publisher: 'Godot IDE', version: '2.0.0', installed: false, category: 'Gaming', downloads: '2M', rating: 5 },
  { id: 'haxe-foundation.haxe', name: 'Haxe', description: 'Haxe language support', publisher: 'Haxe Foundation', version: '1.0.0', installed: false, category: 'Gaming', downloads: '500K', rating: 4 },
  { id: 'jayssonerra.stencyl', name: 'Stencyl', description: 'Stencyl game creator', publisher: 'Jayssonerra', version: '1.0.0', installed: false, category: 'Gaming', downloads: '200K', rating: 3 },
  { id: 'katsumoto.roguelike', name: 'Roguelike Tools', description: 'Roguelike dev tools', publisher: 'Katsumoto', version: '0.2.0', installed: false, category: 'Gaming', downloads: '100K', rating: 3 },
  { id: 'love2d-support.love', name: 'Love2D', description: 'Love2D complete support', publisher: 'Love2D', version: '0.8.0', installed: false, category: 'Gaming', downloads: '600K', rating: 4 },
  { id: 'mario-fl-20.mario', name: 'Mario Game', description: 'Mario game template', publisher: 'Mario FL', version: '1.0.0', installed: false, category: 'Gaming', downloads: '100K', rating: 3 },
  { id: 'nttor.roblox-lua', name: 'Roblox Lua', description: 'Roblox Luau/Lua', publisher: 'nttor', version: '1.2.0', installed: false, category: 'Gaming', downloads: '1M', rating: 4 },
  { id: 'papyrus-skyrim.papyrus', name: 'Papyrus', description: 'Skyrim Papyrus scripts', publisher: 'Papyrus', version: '0.3.0', installed: false, category: 'Gaming', downloads: '300K', rating: 4 },
  { id: 'pixel-byte.pico-8', name: 'PICO-8', description: 'PICO-8 fantasy console', publisher: 'Pixel Byte', version: '0.5.0', installed: false, category: 'Gaming', downloads: '400K', rating: 4 },
  { id: 'playcanvas.playcanvas', name: 'PlayCanvas', description: 'PlayCanvas WebGL', publisher: 'PlayCanvas', version: '1.0.0', installed: false, category: 'Gaming', downloads: '300K', rating: 4 },
  { id: 'rpg-maker.rpg-mv', name: 'RPG Maker', description: 'RPG Maker MV support', publisher: 'RPG Maker', version: '1.0.0', installed: false, category: 'Gaming', downloads: '500K', rating: 4 },
  { id: 'sibly.love-2d', name: 'Love 2D Helper', description: 'Love2D snippets', publisher: 'Sibly', version: '0.4.0', installed: false, category: 'Gaming', downloads: '200K', rating: 3 },
  { id: 'stencyl-lang.stencyl', name: 'Stencyl Lang', description: 'Stencyl language', publisher: 'Stencyl', version: '0.2.0', installed: false, category: 'Gaming', downloads: '100K', rating: 3 },
  { id: 'unity-technologies.unity', name: 'Unity', description: 'Unity full support', publisher: 'Unity', version: '1.0.0', installed: false, category: 'Gaming', downloads: '5M', rating: 5 },
  { id: 'unreal-engine.ue4', name: 'Unreal Engine', description: 'UE4/UE5 support', publisher: 'Unreal', version: '0.5.0', installed: false, category: 'Gaming', downloads: '2M', rating: 4 },
  { id: 'vscode-roblox.roblox', name: 'Roblox Studio', description: 'Roblox Studio support', publisher: 'vscode-roblox', version: '0.3.0', installed: false, category: 'Gaming', downloads: '800K', rating: 4 },
  // Languages
  { id: 'andrewek.hlang', name: 'HLSL', description: 'HLSL shader language', publisher: 'andrewek', version: '0.2.0', installed: false, category: 'Languages', downloads: '1M', rating: 4 },
  { id: 'davidlyons.nim', name: 'Nim (David)', description: 'Nim language server', publisher: 'David Lyons', version: '1.0.0', installed: false, category: 'Languages', downloads: '500K', rating: 4 },
  { id: 'elm-tooling.elm', name: 'Elm', description: 'Elm language support', publisher: 'Elm Tooling', version: '2.0.0', installed: false, category: 'Languages', downloads: '1M', rating: 4 },
  { id: 'fsharp.fsharp', name: 'F#', description: 'F# language support', publisher: 'F#', version: '5.0.0', installed: false, category: 'Languages', downloads: '2M', rating: 4 },
  { id: 'golang.go-test', name: 'Go Test', description: 'Go testing tools', publisher: 'Google', version: '0.2.0', installed: false, category: 'Languages', downloads: '3M', rating: 4 },
  { id: 'haskell.haskell', name: 'Haskell (Official)', description: 'Haskell support', publisher: 'Haskell', version: '2.0.0', installed: false, category: 'Languages', downloads: '1M', rating: 4 },
  { id: 'idleberg.swift', name: 'Swift', description: 'Swift language', publisher: 'idleberg', version: '1.0.0', installed: false, category: 'Languages', downloads: '2M', rating: 4 },
  { id: 'jbyuki.inlay-hints', name: 'Inlay Hints', description: 'Inlay hints for code', publisher: 'jbyuki', version: '0.1.0', installed: false, category: 'Languages', downloads: '500K', rating: 3 },
  { id: 'justusadam.language-haskell', name: 'Haskell (Justus)', description: 'Haskell highlighting', publisher: 'Justus Adam', version: '3.5.0', installed: false, category: 'Languages', downloads: '800K', rating: 4 },
  { id: 'lobster.language-lobster', name: 'Lobster', description: 'Lobster language', publisher: 'Lobster', version: '0.1.0', installed: false, category: 'Languages', downloads: '100K', rating: 3 },
  { id: 'matklad.rust-analyzer-nightly', name: 'rust-analyzer Nightly', description: 'Nightly builds', publisher: 'matklad', version: '0.5.0', installed: false, category: 'Languages', downloads: '1M', rating: 4 },
  { id: 'mesonbuild.meson', name: 'Meson', description: 'Meson build system', publisher: 'Meson', version: '0.3.0', installed: false, category: 'Languages', downloads: '300K', rating: 3 },
  { id: 'nicolo-ribaudo.ocaml', name: 'OCaml (Nicolo)', description: 'OCaml support', publisher: 'Nicolò Ribaudo', version: '0.2.0', installed: false, category: 'Languages', downloads: '200K', rating: 3 },
  { id: 'perl.perl', name: 'Perl', description: 'Perl language', publisher: 'Perl', version: '1.0.0', installed: false, category: 'Languages', downloads: '500K', rating: 3 },
  { id: 'prolog.prolog', name: 'Prolog', description: 'Prolog language', publisher: 'Prolog', version: '0.2.0', installed: false, category: 'Languages', downloads: '200K', rating: 3 },
  { id: 'rust-lang.rust', name: 'Rust (Simple)', description: 'Basic Rust support', publisher: 'rust-lang', version: '0.10.0', installed: false, category: 'Languages', downloads: '2M', rating: 3 },
  { id: 'scheme.scheme', name: 'Scheme', description: 'Scheme language', publisher: 'Scheme', version: '0.1.0', installed: false, category: 'Languages', downloads: '100K', rating: 3 },
  { id: 'vlang.vlang', name: 'V Language', description: 'V language support', publisher: 'V', version: '0.3.0', installed: false, category: 'Languages', downloads: '400K', rating: 4 },
  { id: 'ziglang.vscode-zig', name: 'Zig', description: 'Zig language support', publisher: 'Zig', version: '0.3.0', installed: false, category: 'Languages', downloads: '1M', rating: 4 },
  { id: 'abelavier.swift-lang', name: 'Swift Language', description: 'Swift language server', publisher: 'Abel Avram', version: '0.5.0', installed: false, category: 'Languages', downloads: '1M', rating: 4 },
  { id: 'clojure-lsp.clojure-lsp', name: 'Clojure LSP', description: 'Clojure support', publisher: 'Clojure', version: '0.2.0', installed: false, category: 'Languages', downloads: '300K', rating: 4 },
  { id: 'dart-code.dart-nightly', name: 'Dart Nightly', description: 'Dart nightly build', publisher: 'Dart', version: '3.101.0', installed: false, category: 'Languages', downloads: '1M', rating: 4 },
  { id: 'erlang.erlang', name: 'Erlang (Official)', description: 'Erlang support', publisher: 'Erlang', version: '1.0.0', installed: false, category: 'Languages', downloads: '300K', rating: 4 },
  { id: 'glsl-canvas.glsl', name: 'GLSL', description: 'GLSL shader language', publisher: 'GLSL Canvas', version: '0.3.0', installed: false, category: 'Languages', downloads: '1M', rating: 4 },
  { id: 'idris-hub.idris', name: 'Idris', description: 'Idris language', publisher: 'Idris Hub', version: '0.1.0', installed: false, category: 'Languages', downloads: '100K', rating: 3 },
  // AI
  { id: 'anthropic.claude', name: 'Claude AI', description: 'Claude AI assistant', publisher: 'Anthropic', version: '1.0.0', installed: false, category: 'AI', downloads: '500K', rating: 5 },
  { id: 'deepseek.deepseek-coder', name: 'DeepSeek Coder', description: 'DeepSeek coding AI', publisher: 'DeepSeek', version: '1.0.0', installed: false, category: 'AI', downloads: '300K', rating: 4 },
  { id: 'gemini.gemini-vscode', name: 'Gemini', description: 'Google Gemini AI', publisher: 'Google', version: '1.0.0', installed: false, category: 'AI', downloads: '400K', rating: 4 },
  { id: 'github.copilot-nightly', name: 'Copilot Nightly', description: 'Copilot nightly builds', publisher: 'GitHub', version: '1.241.0', installed: false, category: 'AI', downloads: '5M', rating: 4 },
  { id: 'mistral.mistral-ai', name: 'Mistral AI', description: 'Mistral AI coding', publisher: 'Mistral', version: '1.0.0', installed: false, category: 'AI', downloads: '200K', rating: 4 },
  { id: 'openai.openai-vscode', name: 'OpenAI', description: 'OpenAI integration', publisher: 'OpenAI', version: '1.0.0', installed: false, category: 'AI', downloads: '300K', rating: 4 },
  { id: 'qodo.qodo', name: 'Qodo AI', description: 'Qodo coding assistant', publisher: 'Qodo', version: '1.2.0', installed: false, category: 'AI', downloads: '200K', rating: 4 },
  { id: 'refact.refact', name: 'Refact', description: 'AI code refactoring', publisher: 'Refact', version: '2.0.0', installed: false, category: 'AI', downloads: '100K', rating: 4 },
  { id: 'replit.replit', name: 'Replit', description: 'Replit integration', publisher: 'Replit', version: '1.0.0', installed: false, category: 'AI', downloads: '200K', rating: 4 },
  // Themes
  { id: 'akamud.vscode-theme-onelight', name: 'One Light', description: 'Atom One Light', publisher: 'akamud', version: '1.1.0', installed: false, category: 'Themes', downloads: '5M', rating: 5 },
  { id: 'bradgashler.tomorrow-theme', name: 'Tomorrow Theme', description: 'Tomorrow theme pack', publisher: 'Brad Gashler', version: '0.1.0', installed: false, category: 'Themes', downloads: '2M', rating: 4 },
  { id: 'chaseadamsio.theme-winter-is-coming', name: 'Winter Is Coming', description: 'Winter theme', publisher: 'Chase Adams', version: '2.0.0', installed: false, category: 'Themes', downloads: '3M', rating: 4 },
  { id: 'daylerees.color-themes', name: 'Color Themes', description: '200+ color themes', publisher: 'Dayle Rees', version: '5.7.0', installed: false, category: 'Themes', downloads: '3M', rating: 4 },
  { id: 'DustinMcDermott.theme-panda', name: 'Panda Theme', description: 'Panda syntax theme', publisher: 'Dustin McDermott', version: '1.0.0', installed: false, category: 'Themes', downloads: '2M', rating: 4 },
  { id: 'fisheva.eva-theme', name: 'Eva Theme', description: 'Eva theme pack', publisher: 'fisheva', version: '1.2.0', installed: false, category: 'Themes', downloads: '1M', rating: 4 },
  { id: 'gerane.Theme-3024', name: '3024 Theme', description: '3024 color scheme', publisher: 'gerane', version: '0.0.1', installed: false, category: 'Themes', downloads: '500K', rating: 3 },
  { id: 'hrp.kimbie-dark', name: 'Kimbie Dark', description: 'Kimbie dark theme', publisher: 'hrp', version: '0.0.1', installed: false, category: 'Themes', downloads: '1M', rating: 4 },
  { id: 'jaredkirby.light-plus', name: 'Light Plus', description: 'Light+ theme', publisher: 'Jared Kirby', version: '1.0.0', installed: false, category: 'Themes', downloads: '2M', rating: 4 },
  { id: 'lafe.theme-80s', name: '80s Neon', description: '80s neon theme', publisher: 'lafe', version: '1.0.0', installed: false, category: 'Themes', downloads: '1M', rating: 4 },
  { id: 'liviuschera.noctis', name: 'Noctis', description: 'Noctis theme family', publisher: 'Liviu Şerbănescu', version: '1.0.0', installed: false, category: 'Themes', downloads: '3M', rating: 5 },
  { id: 'max-ss.current-line', name: 'Current Line', description: 'Highlight current line', publisher: 'max-ss', version: '0.0.1', installed: false, category: 'Themes', downloads: '500K', rating: 3 },
  { id: 'muhammadabdurrafi.theme-monokai-dusk', name: 'Monokai Dusk', description: 'Monokai dusk theme', publisher: 'Muhammad', version: '1.0.0', installed: false, category: 'Themes', downloads: '1M', rating: 4 },
  { id: 'rifi2k.putih', name: 'Putih Theme', description: 'Minimalist light', publisher: 'rifi2k', version: '1.0.0', installed: false, category: 'Themes', downloads: '500K', rating: 3 },
  { id: 'robertohuertas.theme-sunset', name: 'Sunset Theme', description: 'Sunset color theme', publisher: 'Roberto Huertas', version: '1.0.0', installed: false, category: 'Themes', downloads: '1M', rating: 4 },
  { id: 'sallar.vscode-duotone', name: 'Duotone', description: 'Duotone theme', publisher: 'Sallar', version: '2.0.0', installed: false, category: 'Themes', downloads: '2M', rating: 4 },
  { id: 'samrap.komodo', name: 'Komodo', description: 'Komodo theme', publisher: 'samrap', version: '1.0.0', installed: false, category: 'Themes', downloads: '500K', rating: 3 },
  { id: 'thomaspink.theme-pastel', name: 'Pastel Theme', description: 'Pastel colors', publisher: 'Thomas Pink', version: '1.0.0', installed: false, category: 'Themes', downloads: '1M', rating: 4 },
  { id: 'wondracek.theme-spring', name: 'Spring Theme', description: 'Spring colors', publisher: 'wondracek', version: '1.0.0', installed: false, category: 'Themes', downloads: '500K', rating: 3 },
  { id: 'zhuangtongfa.material-theme-ocean', name: 'Material Ocean', description: 'Ocean color theme', publisher: 'Binaryify', version: '1.0.0', installed: false, category: 'Themes', downloads: '2M', rating: 4 },
  // Productivity
  { id: 'alefragnani.bookmarks-nightly', name: 'Bookmarks Nightly', description: 'Bookmarks nightly', publisher: 'Alessandro Fragnani', version: '13.6.0', installed: false, category: 'Productivity', downloads: '1M', rating: 4 },
  { id: 'bradymholt.pomodoro', name: 'Pomodoro Timer', description: 'Pomodoro technique', publisher: 'Brady Holton', version: '1.0.0', installed: false, category: 'Productivity', downloads: '3M', rating: 4 },
  { id: 'burkeholland.power-mode', name: 'Power Mode', description: 'Typing effects', publisher: 'Burke Holland', version: '2.0.0', installed: false, category: 'Productivity', downloads: '5M', rating: 4 },
  { id: 'chrisv.daily-notes', name: 'Daily Notes', description: 'Daily notes tracker', publisher: 'Chris V', version: '1.0.0', installed: false, category: 'Productivity', downloads: '2M', rating: 4 },
  { id: 'cliffordfajardo.github-traffic', name: 'GitHub Traffic', description: 'GitHub traffic stats', publisher: 'Clifford Fajardo', version: '1.0.0', installed: false, category: 'Productivity', downloads: '500K', rating: 3 },
  { id: 'codezombiech.gitignore-advanced', name: 'gitignore Advanced', description: 'Advanced gitignore', publisher: 'codezombiech', version: '1.0.0', installed: false, category: 'Productivity', downloads: '1M', rating: 4 },
  { id: 'col47.todo-tasks', name: 'Todo Tasks', description: 'Todo task manager', publisher: 'col47', version: '1.0.0', installed: false, category: 'Productivity', downloads: '2M', rating: 4 },
  { id: 'daleeg.comments', name: 'Comments+', description: 'Enhanced comments', publisher: 'Dale E G', version: '1.0.0', installed: false, category: 'Productivity', downloads: '1M', rating: 4 },
  { id: 'davidhouchin.wordcount', name: 'Word Count+', description: 'Detailed word stats', publisher: 'David Houchin', version: '1.0.0', installed: false, category: 'Productivity', downloads: '1M', rating: 3 },
  { id: 'donjayamanne.java-extension-pack', name: 'Java Pack', description: 'Java extension pack', publisher: 'Don Jayamanne', version: '0.2.0', installed: false, category: 'Productivity', downloads: '5M', rating: 4 },
  { id: 'esbenp.no-git', name: 'No Git', description: 'Hide git features', publisher: 'Esben', version: '1.0.0', installed: false, category: 'Productivity', downloads: '500K', rating: 3 },
  { id: 'fabiospampinato.vscode-commands', name: 'Commands', description: 'Command runner', publisher: 'Fabio Spampinato', version: '0.3.0', installed: false, category: 'Productivity', downloads: '1M', rating: 4 },
  { id: 'gizak.timeout', name: 'Timeout', description: 'Break reminder', publisher: 'gizak', version: '1.0.0', installed: false, category: 'Productivity', downloads: '2M', rating: 4 },
  { id: 'golang.go-extension-pack', name: 'Go Pack', description: 'Go extension pack', publisher: 'Google', version: '0.1.0', installed: false, category: 'Productivity', downloads: '3M', rating: 4 },
  { id: 'hansv.terminal-commands', name: 'Terminal Commands', description: 'Run terminal cmds', publisher: 'hansv', version: '1.0.0', installed: false, category: 'Productivity', downloads: '1M', rating: 3 },
  { id: 'humao.rest-client', name: 'REST Client', description: 'REST API testing', publisher: 'Huachao Mao', version: '0.25.0', installed: false, category: 'Productivity', downloads: '10M', rating: 5 },
  { id: 'igordvl.perfect-light', name: 'Perfect Light', description: 'Light theme variant', publisher: 'Igor', version: '1.0.0', installed: false, category: 'Productivity', downloads: '500K', rating: 3 },
  { id: 'jakob101.theme-cobalt2', name: 'Cobalt2', description: 'Cobalt2 theme', publisher: 'Jakob101', version: '1.0.0', installed: false, category: 'Productivity', downloads: '2M', rating: 4 },
  { id: 'johnstoncode.svn-scm', name: 'SVN', description: 'SVN version control', publisher: 'Johnston', version: '2.0.0', installed: false, category: 'Productivity', downloads: '2M', rating: 4 },
  { id: 'krizzdewizz.quick-select', name: 'Quick Select', description: 'Quick text selection', publisher: 'krizzdewizz', version: '1.0.0', installed: false, category: 'Productivity', downloads: '500K', rating: 3 },
  { id: 'lannonbr.vscode-repo-manager', name: 'Repo Manager', description: 'Manage repos', publisher: 'Brandon Lannon', version: '0.1.0', installed: false, category: 'Productivity', downloads: '1M', rating: 4 },
  { id: 'maxvtr.wakatime-nightly', name: 'WakaTime Nightly', description: 'Nightly build', publisher: 'Max', version: '24.7.0', installed: false, category: 'Productivity', downloads: '500K', rating: 3 },
  { id: 'mikaelhm.osx-like', name: 'OSX Like', description: 'macOS-like theme', publisher: 'Mikael', version: '1.0.0', installed: false, category: 'Productivity', downloads: '1M', rating: 4 },
  { id: 'nickheal.timer', name: 'Timer', description: 'Simple timer', publisher: 'Nick Heal', version: '1.0.0', installed: false, category: 'Productivity', downloads: '1M', rating: 3 },
  { id: 'octref.vetur', name: 'Vetur', description: 'Vue tooling', publisher: 'Octref', version: '0.37.0', installed: false, category: 'Productivity', downloads: '15M', rating: 5 },
  { id: 'patrys.vscode-code-outline', name: 'Code Outline', description: 'Code structure view', publisher: 'Patrys', version: '0.3.0', installed: false, category: 'Productivity', downloads: '3M', rating: 4 },
  { id: 'peterbenoit.small-talk', name: 'Small Talk', description: 'Small Talk lang', publisher: 'Peter Benoit', version: '0.1.0', installed: false, category: 'Productivity', downloads: '100K', rating: 3 },
  { id: 'pranaygp.vscode-css-peek', name: 'CSS Peek', description: 'Peek CSS definitions', publisher: 'Pranay', version: '4.0.0', installed: false, category: 'Productivity', downloads: '5M', rating: 4 },
  { id: 'ritwickdey.emmet-live', name: 'Emmet Live', description: 'Emmet live edit', publisher: 'Ritwick Dey', version: '1.0.0', installed: false, category: 'Productivity', downloads: '3M', rating: 4 },
  { id: 'robertohuertas.vscode-icons-pack', name: 'Icons Pack', description: 'Icon themes pack', publisher: 'Roberto', version: '1.0.0', installed: false, category: 'Productivity', downloads: '2M', rating: 4 },
  { id: 'savagepix.wallaby', name: 'Wallaby', description: 'JS test runner', publisher: 'SavagePix', version: '1.0.0', installed: false, category: 'Productivity', downloads: '1M', rating: 4 },
  { id: 'shaharkazaz.angular-language-service', name: 'Angular Language', description: 'Angular language tools', publisher: 'Shahar Kazaz', version: '0.1.0', installed: false, category: 'Productivity', downloads: '1M', rating: 4 },
  { id: 'sibiraj-s.vscode-swap', name: 'Swap', description: 'Swap selections', publisher: 'Sibiraj', version: '1.0.0', installed: false, category: 'Productivity', downloads: '500K', rating: 3 },
  { id: 'stkb.rewrap', name: 'Rewrap', description: 'Word wrap comments', publisher: 'stkb', version: '1.15.0', installed: false, category: 'Productivity', downloads: '5M', rating: 5 },
  { id: 'tomoki1207.copy-file', name: 'Copy File', description: 'Copy file path', publisher: 'Tomoki', version: '1.0.0', installed: false, category: 'Productivity', downloads: '1M', rating: 4 },
  { id: 'tyriar.luna-paint', name: 'Luna Paint', description: 'Image editor', publisher: 'Tyriar', version: '0.2.0', installed: false, category: 'Productivity', downloads: '2M', rating: 4 },
  { id: 'vincaslt.advanced-new-file', name: 'Advanced New File', description: 'Quick file creation', publisher: 'vincaslt', version: '1.0.0', installed: false, category: 'Productivity', downloads: '2M', rating: 4 },
  { id: 'wix.glean', name: 'Glean', description: 'TS/JS linter', publisher: 'Wix', version: '4.0.0', installed: false, category: 'Productivity', downloads: '3M', rating: 4 },
  { id: 'yatki.vscode-surround', name: 'Surround', description: 'Surround selections', publisher: 'yatki', version: '1.0.0', installed: false, category: 'Productivity', downloads: '2M', rating: 4 },
  { id: 'zjcomtr.zj-extension', name: 'ZJ Extension', description: 'Utility pack', publisher: 'zjcomtr', version: '1.0.0', installed: false, category: 'Productivity', downloads: '500K', rating: 3 },
  // Git
  { id: 'eamodio.gitlens-insiders', name: 'GitLens Insiders', description: 'Insiders build', publisher: 'GitKraken', version: '16.4.0', installed: false, category: 'Git', downloads: '2M', rating: 4 },
  { id: 'gitduck.gitduck', name: 'GitDuck', description: 'Code walkthroughs', publisher: 'GitDuck', version: '1.0.0', installed: false, category: 'Git', downloads: '500K', rating: 3 },
  { id: 'mhutchie.git-graph-nightly', name: 'Git Graph Nightly', description: 'Nightly builds', publisher: 'mhutchie', version: '1.31.0', installed: false, category: 'Git', downloads: '1M', rating: 4 },
  { id: 'nicolo-ribaudo.git-branches', name: 'Git Branches', description: 'Branch management', publisher: 'Nicolò Ribaudo', version: '1.0.0', installed: false, category: 'Git', downloads: '500K', rating: 3 },
  { id: 'waderyan.gitblame-nightly', name: 'Git Blame Nightly', description: 'Nightly build', publisher: 'Wade Ryan', version: '11.3.0', installed: false, category: 'Git', downloads: '500K', rating: 3 },
  // DevOps
  { id: 'aws-toolkit-vscode.aws-lambda', name: 'AWS Lambda', description: 'Lambda support', publisher: 'Amazon', version: '1.0.0', installed: false, category: 'DevOps', downloads: '3M', rating: 4 },
  { id: 'azuredevops.azure-devops', name: 'Azure DevOps', description: 'Azure DevOps tools', publisher: 'Microsoft', version: '1.0.0', installed: false, category: 'DevOps', downloads: '5M', rating: 4 },
  { id: 'circleci.circleci', name: 'CircleCI', description: 'CircleCI integration', publisher: 'CircleCI', version: '1.0.0', installed: false, category: 'DevOps', downloads: '2M', rating: 4 },
  { id: 'codeship.codeship', name: 'CodeShip', description: 'CodeShip CI/CD', publisher: 'CodeShip', version: '1.0.0', installed: false, category: 'DevOps', downloads: '500K', rating: 3 },
  { id: 'gitlab.gitlab-workflow', name: 'GitLab', description: 'GitLab integration', publisher: 'GitLab', version: '4.0.0', installed: false, category: 'DevOps', downloads: '5M', rating: 4 },
  { id: 'hashicorp.waypoint', name: 'Waypoint', description: 'Waypoint by HashiCorp', publisher: 'HashiCorp', version: '0.2.0', installed: false, category: 'DevOps', downloads: '500K', rating: 3 },
  { id: 'ms-azuretools.vscode-azurecli', name: 'Azure CLI', description: 'Azure CLI tools', publisher: 'Microsoft', version: '0.3.0', installed: false, category: 'DevOps', downloads: '3M', rating: 4 },
  { id: 'ms-kubernetes-tools.vscode-kubernetes-aks', name: 'Azure AKS', description: 'AKS management', publisher: 'Microsoft', version: '0.2.0', installed: false, category: 'DevOps', downloads: '1M', rating: 3 },
  { id: 'travis-ci.travis-ci', name: 'Travis CI', description: 'Travis CI integration', publisher: 'Travis CI', version: '1.0.0', installed: false, category: 'DevOps', downloads: '1M', rating: 3 },
  // Debugging
  { id: 'andrewek.debug-hlsl', name: 'Debug HLSL', description: 'HLSL shader debug', publisher: 'andrewek', version: '0.1.0', installed: false, category: 'Debugging', downloads: '200K', rating: 3 },
  { id: 'darrenvong.pegjs', name: 'PEG.js', description: 'PEG grammar debug', publisher: 'Darren Vong', version: '0.1.0', installed: false, category: 'Debugging', downloads: '100K', rating: 3 },
  { id: 'donjayamanne.debugger-for-chrome-nightly', name: 'Chrome Debug Nightly', description: 'Nightly build', publisher: 'Don Jayamanne', version: '4.13.0', installed: false, category: 'Debugging', downloads: '1M', rating: 4 },
  { id: 'firefox-devtools.vscode-firefox-debug-nightly', name: 'Firefox Debug Nightly', description: 'Nightly build', publisher: 'Firefox', version: '2.10.0', installed: false, category: 'Debugging', downloads: '500K', rating: 3 },
  { id: 'ms-vscode.js-debug-nightly', name: 'JS Debug Nightly', description: 'JS debugger nightly', publisher: 'Microsoft', version: '1.95.0', installed: false, category: 'Debugging', downloads: '5M', rating: 4 },
  { id: 'webfreak.debug-nightly', name: 'Native Debug Nightly', description: 'Nightly build', publisher: 'webfreak', version: '0.28.0', installed: false, category: 'Debugging', downloads: '500K', rating: 3 },
  // Databases
  { id: 'cweijan.vscode-mysql2', name: 'MySQL2', description: 'MySQL client v2', publisher: 'cweijan', version: '1.0.0', installed: false, category: 'Databases', downloads: '1M', rating: 4 },
  { id: 'derek.jobbredis', name: 'Redis Explorer', description: 'Redis GUI', publisher: 'Derek', version: '0.5.0', installed: false, category: 'Databases', downloads: '500K', rating: 3 },
  { id: 'firefox-devtools.firebase', name: 'Firebase', description: 'Firebase support', publisher: 'Firefox DevTools', version: '1.0.0', installed: false, category: 'Databases', downloads: '2M', rating: 4 },
  { id: 'ms-dbatools.sql-assistant', name: 'SQL Assistant', description: 'SQL helper tools', publisher: 'Microsoft', version: '1.0.0', installed: false, category: 'Databases', downloads: '1M', rating: 4 },
  { id: 'oracle.oracle', name: 'Oracle DB', description: 'Oracle database', publisher: 'Oracle', version: '1.0.0', installed: false, category: 'Databases', downloads: '1M', rating: 4 },
  // Cloud
  { id: 'amazonwebservices.aws-lambda-tools', name: 'Lambda Tools', description: 'Lambda dev tools', publisher: 'Amazon', version: '1.0.0', installed: false, category: 'Cloud', downloads: '2M', rating: 4 },
  { id: 'digitalocean.digitalocean', name: 'DigitalOcean', description: 'DO integration', publisher: 'DigitalOcean', version: '1.0.0', installed: false, category: 'Cloud', downloads: '1M', rating: 4 },
  { id: 'googlecloud.google-cloud-source', name: 'Cloud Source', description: 'Cloud Source Repo', publisher: 'Google', version: '1.0.0', installed: false, category: 'Cloud', downloads: '500K', rating: 3 },
  { id: 'heroku.heroku', name: 'Heroku', description: 'Heroku CLI tools', publisher: 'Heroku', version: '1.0.0', installed: false, category: 'Cloud', downloads: '2M', rating: 4 },
  { id: 'linode.linode', name: 'Linode', description: 'Linode manager', publisher: 'Linode', version: '1.0.0', installed: false, category: 'Cloud', downloads: '500K', rating: 3 },
  // Education
  { id: 'algorithm-visualizer.algorithm', name: 'Algorithm Visualizer', description: 'Visualize algorithms', publisher: 'Algorithm', version: '1.0.0', installed: false, category: 'Education', downloads: '2M', rating: 4 },
  { id: 'codecademy.codecademy', name: 'Codecademy', description: 'Learn to code', publisher: 'Codecademy', version: '1.0.0', installed: false, category: 'Education', downloads: '1M', rating: 4 },
  { id: 'coding-game.codingame', name: 'Coding Game', description: 'Learn by gaming', publisher: 'Coding Game', version: '1.0.0', installed: false, category: 'Education', downloads: '500K', rating: 3 },
  { id: 'freecodecamp.freecodecamp', name: 'freeCodeCamp', description: 'FCC curriculum', publisher: 'freeCodeCamp', version: '1.0.0', installed: false, category: 'Education', downloads: '3M', rating: 5 },
  { id: 'khan-academy.khan', name: 'Khan Academy', description: 'Learn anything', publisher: 'Khan', version: '1.0.0', installed: false, category: 'Education', downloads: '1M', rating: 4 },
  { id: 'leetcode.leetcode-plus', name: 'LeetCode+', description: 'Enhanced LeetCode', publisher: 'LeetCode', version: '1.0.0', installed: false, category: 'Education', downloads: '2M', rating: 4 },
  { id: 'udemy.udemy', name: 'Udemy', description: 'Online courses', publisher: 'Udemy', version: '1.0.0', installed: false, category: 'Education', downloads: '1M', rating: 3 },
  // Security
  { id: 'checkmarx.checkmarx-one', name: 'Checkmarx One', description: 'Advanced SAST', publisher: 'Checkmarx', version: '1.0.0', installed: false, category: 'Security', downloads: '1M', rating: 4 },
  { id: 'github.advanced-security', name: 'Advanced Security', description: 'GitHub Sec features', publisher: 'GitHub', version: '1.0.0', installed: false, category: 'Security', downloads: '2M', rating: 4 },
  { id: 'microsoft.security-essentials', name: 'Security Essentials', description: 'MS security tools', publisher: 'Microsoft', version: '1.0.0', installed: false, category: 'Security', downloads: '1M', rating: 4 },
  { id: 'owasp.owasp', name: 'OWASP', description: 'OWASP tools', publisher: 'OWASP', version: '1.0.0', installed: false, category: 'Security', downloads: '1M', rating: 4 },
  { id: 'snyk-security.snyk-code', name: 'Snyk Code', description: 'Code security', publisher: 'Snyk', version: '1.0.0', installed: false, category: 'Security', downloads: '2M', rating: 4 },
  // Testing
  { id: 'coderush.test-runner', name: 'CodeRush Test', description: 'Test runner', publisher: 'CodeRush', version: '1.0.0', installed: false, category: 'Testing', downloads: '500K', rating: 3 },
  { id: 'hbenl.vscode-jest-test-adapter', name: 'Jest Adapter', description: 'Jest test adapter', publisher: 'Holger Benl', version: '1.0.0', installed: false, category: 'Testing', downloads: '2M', rating: 4 },
  { id: 'jest-runner.jest', name: 'Jest Runner', description: 'Run Jest tests', publisher: 'Jest Runner', version: '0.4.0', installed: false, category: 'Testing', downloads: '5M', rating: 4 },
  { id: 'kavodio.kavod-test', name: 'Kavod Test', description: 'Test utilities', publisher: 'Kavod', version: '1.0.0', installed: false, category: 'Testing', downloads: '300K', rating: 3 },
  { id: 'ms-vscode.test-explorer-live', name: 'Test Live', description: 'Live test results', publisher: 'Microsoft', version: '1.0.0', installed: false, category: 'Testing', downloads: '1M', rating: 4 },
  { id: 'orta.vscode-jest-nightly', name: 'Jest Nightly', description: 'Jest nightly build', publisher: 'Orta', version: '5.3.0', installed: false, category: 'Testing', downloads: '1M', rating: 4 },
  // Machine Learning
  { id: 'google.tensorflow', name: 'TensorFlow', description: 'TF in VSCode', publisher: 'Google', version: '1.0.0', installed: false, category: 'Machine Learning', downloads: '3M', rating: 4 },
  { id: 'huggingface.huggingface', name: 'Hugging Face', description: 'HF models/tools', publisher: 'Hugging Face', version: '1.0.0', installed: false, category: 'Machine Learning', downloads: '1M', rating: 4 },
  { id: 'keras.keras', name: 'Keras', description: 'Keras deep learning', publisher: 'Keras', version: '1.0.0', installed: false, category: 'Machine Learning', downloads: '1M', rating: 4 },
  { id: 'ms-toolsai.jupyter-nightly', name: 'Jupyter Nightly', description: 'Nightly build', publisher: 'Microsoft', version: '2024.9.0', installed: false, category: 'Machine Learning', downloads: '5M', rating: 4 },
  { id: 'pytorch.pytorch', name: 'PyTorch', description: 'PyTorch support', publisher: 'PyTorch', version: '1.0.0', installed: false, category: 'Machine Learning', downloads: '2M', rating: 4 },
  { id: 'sk-learn.sklearn', name: 'Scikit-Learn', description: 'ML in VSCode', publisher: 'Scikit', version: '1.0.0', installed: false, category: 'Machine Learning', downloads: '1M', rating: 4 },
  // Frameworks
  { id: 'aurelia.aurelia', name: 'Aurelia', description: 'Aurelia framework', publisher: 'Aurelia', version: '1.0.0', installed: false, category: 'Frameworks', downloads: '500K', rating: 4 },
  { id: 'backbone.backbone', name: 'Backbone.js', description: 'Backbone framework', publisher: 'Backbone', version: '1.0.0', installed: false, category: 'Frameworks', downloads: '500K', rating: 3 },
  { id: 'emberjs.ember', name: 'Ember.js', description: 'Ember framework', publisher: 'Ember', version: '1.0.0', installed: false, category: 'Frameworks', downloads: '500K', rating: 4 },
  { id: 'ko-ko-ko.knockout', name: 'Knockout.js', description: 'Knockout framework', publisher: 'ko-ko-ko', version: '1.0.0', installed: false, category: 'Frameworks', downloads: '300K', rating: 3 },
  { id: 'meteor.meteor', name: 'Meteor', description: 'Meteor framework', publisher: 'Meteor', version: '1.0.0', installed: false, category: 'Frameworks', downloads: '1M', rating: 4 },
  { id: 'nextjs.nextjs', name: 'Next.js', description: 'Next.js support', publisher: 'Next.js', version: '1.0.0', installed: false, category: 'Frameworks', downloads: '5M', rating: 4 },
  { id: 'nuxt.nuxt', name: 'Nuxt.js', description: 'Nuxt framework', publisher: 'Nuxt', version: '1.0.0', installed: false, category: 'Frameworks', downloads: '3M', rating: 4 },
  { id: 'react-team.react-native', name: 'React Native', description: 'RN development', publisher: 'React Team', version: '1.0.0', installed: false, category: 'Frameworks', downloads: '5M', rating: 4 },
  { id: 'solidjs.solid', name: 'Solid.js', description: 'Solid framework', publisher: 'SolidJS', version: '1.0.0', installed: false, category: 'Frameworks', downloads: '1M', rating: 4 },
  // Build Tools
  { id: 'azure-pipelines.azure-pipelines', name: 'Azure Pipelines', description: 'CI/CD pipelines', publisher: 'Microsoft', version: '1.0.0', installed: false, category: 'Build Tools', downloads: '3M', rating: 4 },
  { id: 'donjayamanne.gulp', name: 'Gulp', description: 'Gulp task runner', publisher: 'Don Jayamanne', version: '0.2.0', installed: false, category: 'Build Tools', downloads: '2M', rating: 4 },
  { id: 'grunt.grunt', name: 'Grunt', description: 'Grunt task runner', publisher: 'Grunt', version: '1.0.0', installed: false, category: 'Build Tools', downloads: '1M', rating: 3 },
  { id: 'ms-vscode.webpack', name: 'Webpack', description: 'Webpack integration', publisher: 'Microsoft', version: '0.2.0', installed: false, category: 'Build Tools', downloads: '5M', rating: 4 },
  { id: 'vscode-parcel.parcel', name: 'Parcel', description: 'Parcel bundler', publisher: 'Parcel', version: '1.0.0', installed: false, category: 'Build Tools', downloads: '2M', rating: 4 },
  // Snippets
  { id: 'chrisvfritz.vue-vscode-snippets', name: 'Vue Snippets+', description: 'Enhanced Vue snippets', publisher: 'Chris Fritz', version: '1.0.0', installed: false, category: 'Snippets', downloads: '3M', rating: 4 },
  { id: 'doray.for-loop-snippets', name: 'For Loop Snippets', description: 'Loop snippets', publisher: 'doray', version: '1.0.0', installed: false, category: 'Snippets', downloads: '500K', rating: 3 },
  { id: 'jsartisan.react-native-snippets', name: 'RN Snippets', description: 'React Native snippets', publisher: 'jsartisan', version: '1.0.0', installed: false, category: 'Snippets', downloads: '2M', rating: 4 },
  { id: 'mikestead.vue-vscode-snippets', name: 'Vue Snips', description: 'Vue code snippets', publisher: 'mikestead', version: '1.0.0', installed: false, category: 'Snippets', downloads: '2M', rating: 4 },
  { id: 'pnp.polyfill-snippets', name: 'Polyfill Snippets', description: 'JS polyfills', publisher: 'PnP', version: '1.0.0', installed: false, category: 'Snippets', downloads: '1M', rating: 3 },
  { id: 'xabikos.javascriptsnippets-nightly', name: 'JS Snippets Nightly', description: 'Nightly build', publisher: 'xabikos', version: '1.9.0', installed: false, category: 'Snippets', downloads: '1M', rating: 3 },
  // Formatters
  { id: 'beautify.beautify', name: 'Beautify', description: 'JS/HTML/CSS beautify', publisher: 'Beautify', version: '1.0.0', installed: false, category: 'Formatters', downloads: '10M', rating: 4 },
  { id: 'dylanmeyer.sql-formatter', name: 'SQL Formatter+', description: 'Advanced SQL format', publisher: 'Dylan Meyer', version: '1.0.0', installed: false, category: 'Formatters', downloads: '2M', rating: 4 },
  { id: 'esbenp.prettier-nightly', name: 'Prettier Nightly', description: 'Nightly build', publisher: 'Prettier', version: '11.1.0', installed: false, category: 'Formatters', downloads: '5M', rating: 4 },
  { id: 'formatter.format', name: 'Formatter', description: 'Universal formatter', publisher: 'Formatter', version: '1.0.0', installed: false, category: 'Formatters', downloads: '3M', rating: 4 },
  { id: 'ms-python.autopep8-nightly', name: 'autopep8 Nightly', description: 'Nightly build', publisher: 'Microsoft', version: '2024.1.0', installed: false, category: 'Formatters', downloads: '1M', rating: 3 },
  // Linters
  { id: 'davidanson.markdownlint-nightly', name: 'markdownlint Nightly', description: 'Nightly build', publisher: 'David Anson', version: '0.59.0', installed: false, category: 'Linters', downloads: '2M', rating: 4 },
  { id: 'eslint.eslint-nightly', name: 'ESLint Nightly', description: 'Nightly build', publisher: 'ESLint', version: '3.3.0', installed: false, category: 'Linters', downloads: '5M', rating: 4 },
  { id: 'golang.golint', name: 'Golint', description: 'Go linter', publisher: 'Google', version: '0.1.0', installed: false, category: 'Linters', downloads: '2M', rating: 4 },
  { id: 'ms-python.flake8-nightly', name: 'Flake8 Nightly', description: 'Nightly build', publisher: 'Microsoft', version: '2024.3.0', installed: false, category: 'Linters', downloads: '1M', rating: 3 },
  { id: 'pycqa.pylint', name: 'Pylint (Community)', description: 'Python linter', publisher: 'PyCQA', version: '1.0.0', installed: false, category: 'Linters', downloads: '3M', rating: 4 },
  { id: 'standard.standard', name: 'StandardJS', description: 'Standard JS style', publisher: 'Standard', version: '1.0.0', installed: false, category: 'Linters', downloads: '5M', rating: 4 },
  // Keymaps
  { id: 'ms-vscode.vim-keybindings', name: 'Vim Keymap', description: 'Vim keybindings', publisher: 'Microsoft', version: '1.0.0', installed: false, category: 'Keymaps', downloads: '5M', rating: 4 },
  { id: 'vscode-emacs.emacs', name: 'Emacs Keymap', description: 'Emacs keybindings', publisher: 'Emacs', version: '1.0.0', installed: false, category: 'Keymaps', downloads: '3M', rating: 4 },
];

console.log(`Adding ${newExts.length} new extensions`);

// Combine existing and new extensions
const allExts = [...existingExts, ...newExts];

// Remove duplicates by ID
const seen = new Set();
const uniqueExts = allExts.filter(ext => {
  if (seen.has(ext.id)) return false;
  seen.add(ext.id);
  return true;
});

console.log(`Total unique extensions: ${uniqueExts.length}`);

// Sort alphabetically by name
uniqueExts.sort((a, b) => a.name.localeCompare(b.name));

// Generate the output string
let output = 'const ALL_EXTENSIONS: ExtensionItem[] = [\n';
uniqueExts.forEach(ext => {
  output += `  { id: '${ext.id}', name: '${ext.name}', description: '${ext.description}', publisher: '${ext.publisher}', version: '${ext.version}', installed: ${ext.installed}, category: '${ext.category}', downloads: '${ext.downloads}', rating: ${ext.rating} },\n`;
});
output += '];\n';

// Write to a temp file
const outputPath = path.join(__dirname, '..', 'src', 'renderer', 'components', 'Sidebar', 'extensions_sorted.txt');
fs.writeFileSync(outputPath, output);
console.log(`Sorted extensions written to ${outputPath}`);
console.log(`Total extensions: ${uniqueExts.length}`);
